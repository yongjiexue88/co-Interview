# Stripe Plan Integration Plan (Managed Mode, 3 Plans)

## Goals and Constraints
- Plans: `free`, `sprint_30d`, `lifetime`
- Managed Mode only: Electron must always obtain session tokens from your backend and be gated by entitlements.
- Critical rule: frontend/Electron sends only `planId` (never price IDs).

## 0) Canonical plan IDs + Stripe mapping
- Canonical plan IDs used everywhere:
  - `free`
  - `sprint_30d`
  - `lifetime`
- Stripe env vars (backend secrets):
  - `STRIPE_PRICE_SPRINT_30D`
  - `STRIPE_PRICE_LIFETIME`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PORTAL_CONFIG_ID` (optional)
- Plan behavior:
  - `free`: limited access (choose short max session + low quota or even no managed sessions).
  - `sprint_30d`: 30 days of managed access from purchase time (extendable).
  - `lifetime`: managed access forever.

## 1) Stripe setup (Dashboard work)
### 1.1 Create products + prices
- Create two one-time prices (Checkout mode: `payment`):
  - Interview Sprint - 30 Days ($29)
  - Lifetime ($99)

### 1.2 Webhook endpoint
- Endpoint: `/api/webhooks/stripe` (matches raw body config in `backend/src/index.js`).
- Enable events:
  - `checkout.session.completed`
  - Optional: `charge.refunded` or `refund.updated` if you want refunds to revoke access.

### 1.3 Payment Links (if you keep them)
- Update Payment Links to use the new prices and update frontend links.
- Append `client_reference_id=<uid>` and `prefilled_email=<email>` to the Payment Link URL.
- Note: Payment Links are fine, but Checkout Sessions give you cleaner metadata and idempotency.

## 2) Backend tasks (Express + Firebase Admin + Stripe)
### 2.1 Single plans config (source of truth)
File: `backend/src/config/stripe.js` (or rename to `plans.js`).

Export:
- `plans`
- `priceIdByPlanId`
- `planIdByPriceId`

Example shape:
```js
const plans = {
  free: {
    planId: 'free',
    kind: 'free',
    durationDays: null,
    enabled: true,
    maxSessionDurationSec: 10 * 60,
    quotaSecondsTotal: 30 * 60,
    features: {},
  },
  sprint_30d: {
    planId: 'sprint_30d',
    kind: 'time_pass',
    durationDays: 30,
    enabled: true,
    maxSessionDurationSec: 60 * 60,
    quotaSecondsTotal: 40 * 60 * 60,
    features: {},
  },
  lifetime: {
    planId: 'lifetime',
    kind: 'lifetime',
    durationDays: null,
    enabled: true,
    maxSessionDurationSec: 60 * 60,
    quotaSecondsTotal: 999999999,
    features: {},
  },
};
```
Keep quotas and max durations in backend config only.

### 2.2 Firestore schema (operational)
Use Firestore for entitlements, usage, sessions, and webhook idempotency:
```
users/{uid}
  email, createdAt, stripeCustomerId?
  entitlement: {
    planId: 'free'|'sprint_30d'|'lifetime',
    status: 'active'|'inactive',
    accessStartAt: Timestamp,
    accessEndAt: Timestamp|null,
    features: { ... },
    stripe: {
      lastCheckoutSessionId?,
      lastPaymentIntentId?,
      lastEventId?
    }
  }

usage/{uid}
  windowStartAt: Timestamp
  windowEndAt: Timestamp
  secondsUsed: number
  updatedAt: Timestamp

realtime_sessions/{sessionId}
  uid, startedAt, expiresAt, lastHeartbeatAt
  status: 'active'|'closed'
  closedReason?: 'ended'|'timeout'|'quota_exhausted'|'error'
  planIdSnapshot: string

stripe_events/{eventId}
  receivedAt: Timestamp, type: string

users/{uid}/purchases/{purchaseId} (optional)
  planId, amount, currency, checkoutSessionId, paymentIntentId, purchasedAt, accessGrantedUntil
```

### 2.3 Billing endpoints
#### A) POST /v1/billing/checkout
Input: `{ planId: 'sprint_30d' | 'lifetime' }`
- Verify Firebase ID token.
- Validate plan enabled.
- Lookup/create Stripe customer, store `stripeCustomerId`.
- Create Checkout Session (mode `payment`):
  - `client_reference_id = uid`
  - `metadata = { uid, planId }`
  - `success_url = /billing/success?session_id={CHECKOUT_SESSION_ID}`
- Return `{ checkout_url }`.
- Use Stripe idempotency keys to protect against double-clicks.
- Never accept price IDs from the client.

#### B) GET /v1/billing/checkout-status?session_id=...
- Verify Firebase ID token.
- Retrieve session from Stripe.
- Confirm it belongs to this user (`client_reference_id` or metadata).
- If paid/complete, call `applyEntitlementFromCheckoutSession`.
- Return updated entitlement or `{ status: 'pending' }`.
- Add rate limiting; this will be polled by the success page.

#### C) GET /v1/entitlements (or update /v1/auth/verify)
- Return:
  - `entitlement`
  - usage summary (remaining seconds, window dates)
  - `isActive` boolean
- Do all calculations from Firestore, never client state.

### 2.4 Webhook handler (must implement)
Webhook: `POST /api/webhooks/stripe`
- Verify signature with raw body.
- Idempotency: if `stripe_events/{event.id}` exists, return 200.
- Handle `checkout.session.completed`:
  - Require `payment_status === 'paid'`.
  - Read `uid` and `planId` from metadata or `client_reference_id`.
  - Apply entitlement.
- Optional: handle refunds to mark entitlement inactive or downgrade to free.

### 2.5 Entitlement application rules
Implement `applyEntitlement(uid, planId, stripeData)`:
- `sprint_30d`:
  - `newEnd = max(now, current.accessEndAt) + 30 days`
  - status = active
- `lifetime`:
  - `accessEndAt = null`
  - status = active
- Update user entitlement + Stripe references.
- Update `usage/{uid}` window:
  - Sprint: set `windowEndAt = newEnd`; keep `secondsUsed` (do not reset).
  - Lifetime: choose unlimited or rolling monthly windows.

## 3) Usage + session enforcement (backend)
### Required endpoints
- `POST /v1/realtime/session`
  - Verify entitlement active (now < accessEndAt or lifetime).
  - Verify quota remaining.
  - Create session record with server timestamps.
  - Return `{ session_id, token, max_duration_sec, expires_at }`.
  - Enforce concurrency (max 1 active session recommended).
- `POST /v1/realtime/heartbeat`
  - Validate session + entitlement still active.
  - Update `lastHeartbeatAt` server-side.
  - Deny if entitlement expired or quota exhausted.
- `POST /v1/realtime/session/:id/end`
  - Close session.
  - Compute usage from server timestamps only.
  - Transactionally increment usage.

### Zombie cleanup job
- Close sessions where `lastHeartbeatAt` is older than 5 minutes.
- Compute usage from server timestamps.

### Be careful
- Never trust `duration_seconds` from Electron.
- Token must be required for session, heartbeat, and end.

## 4) Frontend tasks (Web)
### 4.1 Pricing page
- Render plans: free, sprint_30d, lifetime.
- "Buy" buttons call `POST /v1/billing/checkout { planId }` and redirect to `checkout_url`.
- If you keep Payment Links, update the links to the new prices and append `client_reference_id`.

### 4.2 Success page
- Route: `/billing/success?session_id=...`
- Poll `GET /v1/billing/checkout-status` (2s, backoff to 5s, max 60s).
- On success, call `GET /v1/entitlements` (or `/v1/auth/verify`) and route to dashboard.

### 4.3 Account/Billing UI
- Show current plan, access end date (important for sprint), usage remaining.
- Show upgrade CTA when inactive/expired.
- Portal is optional (one-time purchases usually do not need it).

## 5) Electron tasks (Managed Mode only)
### 5.1 Startup + login
- Call `GET /v1/entitlements` and store entitlement locally for display only.
- If inactive/expired, show upgrade screen and open pricing page.

### 5.2 Before starting Gemini session
- Must call `POST /v1/realtime/session`.
- Use returned session token in `electron/src/utils/gemini.js`.

### 5.3 During session
- Heartbeat every 30 seconds.
- Stop if server returns expired/quota exhausted, or local `expires_at` reached.

### 5.4 On session end
- Call `POST /v1/realtime/session/:id/end`.
- If app crashes, zombie cleanup handles it.

### Be careful
- Remove/disable any direct Gemini calls that bypass backend tokens (BYOK bypass path).

## 6) Testing checklist (end-to-end)
### Stripe flows
- Sprint purchase -> entitlement active -> `accessEndAt` ~ 30 days out.
- Lifetime purchase -> `accessEndAt = null`.
- Webhook replay -> no double-extension.
- Sprint purchase twice -> `accessEndAt` extends from max(now, currentEnd).

### Electron enforcement
- Expired user cannot create `/v1/realtime/session`.
- Quota exhausted -> heartbeat/session fails and upgrade UI shows.

### Firestore sufficiency
- Firestore is enough for entitlements, idempotency, usage, and sessions.
- If you outgrow it: export to BigQuery for analytics.

## Action Items for Your Current Stripe Setup
- Align plan ID to `sprint_30d` everywhere in code and data.
- Update Payment Links to use the 30-day Sprint price and the $99 Lifetime price.
- Update frontend Payment Link URLs and plan IDs to match the canonical plan IDs.

## Reference (Optional, Not Mandatory)
- Update frontend pricing + Payment Link wiring to match `sprint_30d` and `lifetime`.
- Implement backend entitlements + checkout-status + webhook flow based on this plan.
