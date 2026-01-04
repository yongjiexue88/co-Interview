# Backend API Specification for Co-Interview V2

> Supports both V1 (BYOK) and V2 (SaaS) modes

---

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Electron App   │────▶│  Your Backend   │────▶│  Gemini Live    │
│  (Client)       │     │  (Cloud Run)    │     │  (Provider)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │  Firebase Auth  │
        │               │  Stripe         │
        │               │  Redis          │
        │               │  Firestore      │
        └───────────────└─────────────────┘
```

---

## API Endpoints

### 1. Health & Status

#### `GET /health`
**Purpose:** Load balancer health check

**Response:**
```json
{ "status": "ok", "version": "1.0.0" }
```

---

### 2. Authentication

#### `POST /v1/auth/verify`
**Purpose:** Verify Firebase ID token and return user entitlements

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response (200):**
```json
{
  "user_id": "abc123",
  "email": "user@example.com",
  "plan": "pro",
  "status": "active",
  "quota_remaining_seconds": 3600,
  "features": ["audio", "screen_capture", "unlimited_sessions"]
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Account suspended

---

### 3. Realtime Session Management (Core V2)

#### `POST /v1/realtime/session`
**Purpose:** Mint ephemeral session credentials for Gemini Live

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "model": "gemini-2.5-flash-native-audio-preview",
  "client_version": "2.0.0",
  "platform": "darwin"
}
```

**Response (200):**
```json
{
  "session_id": "sess_abc123",
  "provider": "gemini",
  "model": "gemini-2.5-flash-native-audio-preview-09-2025",
  "token": "EPHEMERAL_API_KEY_OR_SESSION_TOKEN",
  "expires_at": 1704153600,
  "max_duration_sec": 600,
  "quota_remaining_seconds": 3000
}
```

**Errors:**
- `401 Unauthorized` - Invalid token
- `402 Payment Required` - No active subscription
- `403 Forbidden` - Account suspended or banned
- `429 Too Many Requests` - Rate limited or concurrent session limit

**Backend Logic:**
```python
def create_session(user_id, model):
    # 1. Verify user exists and is active
    user = db.get_user(user_id)
    if not user or user.status != 'active':
        raise ForbiddenError()
    
    # 2. Check subscription
    if user.plan == 'free' and user.trial_expired:
        raise PaymentRequiredError()
    
    # 3. Check quota
    if user.quota_seconds_used >= user.quota_seconds_month:
        raise QuotaExceededError()
    
    # 4. Check concurrency (Redis lock)
    if redis.exists(f"active_session:{user_id}"):
        existing = redis.get(f"active_session:{user_id}")
        if user.concurrency_limit <= 1:
            raise ConcurrencyLimitError()
    
    # 5. Create session
    session_id = generate_session_id()
    expires_at = now() + timedelta(seconds=600)
    
    # 6. Set concurrency lock
    redis.setex(f"active_session:{user_id}", 660, session_id)
    
    # 7. Store session metadata
    db.create_session(session_id, user_id, model, expires_at)
    
    # 8. Return credentials
    return {
        "session_id": session_id,
        "token": MASTER_API_KEY,  # Or mint ephemeral
        "expires_at": expires_at,
        ...
    }
```

---

#### `POST /v1/realtime/session/{session_id}/end`
**Purpose:** End session and record usage

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "duration_seconds": 245,
  "reason": "user_ended"
}
```

**Response (200):**
```json
{
  "session_id": "sess_abc123",
  "duration_seconds": 245,
  "quota_remaining_seconds": 2755
}
```

**Backend Logic:**
```python
def end_session(session_id, duration_seconds):
    session = db.get_session(session_id)
    
    # 1. Update session record
    session.ended_at = now()
    session.duration_seconds = duration_seconds
    
    # 2. Update user quota
    user = db.get_user(session.user_id)
    user.quota_seconds_used += duration_seconds
    
    # 3. Release concurrency lock
    redis.delete(f"active_session:{user.id}")
    
    # 4. Save
    db.save(session, user)
```

---

#### `POST /v1/realtime/heartbeat`
**Purpose:** Keep session alive, check quota mid-session

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "session_id": "sess_abc123",
  "elapsed_seconds": 120
}
```

**Response (200):**
```json
{
  "continue": true,
  "quota_remaining_seconds": 2880,
  "extend_until": 1704154200
}
```

**Response (402 - Quota Exceeded):**
```json
{
  "continue": false,
  "reason": "quota_exceeded",
  "message": "You've used all your minutes this month. Upgrade to continue."
}
```

---

### 4. Usage & Billing

#### `GET /v1/usage`
**Purpose:** Get current usage stats

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response (200):**
```json
{
  "period": "2026-01",
  "quota_total_seconds": 7200,
  "quota_used_seconds": 4445,
  "quota_remaining_seconds": 2755,
  "session_count": 12,
  "avg_session_seconds": 370
}
```

---

#### `GET /v1/billing/subscription`
**Purpose:** Get subscription details

**Response (200):**
```json
{
  "plan": "pro",
  "status": "active",
  "current_period_start": "2026-01-01T00:00:00Z",
  "current_period_end": "2026-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "payment_method": {
    "type": "card",
    "last4": "4242",
    "brand": "visa"
  }
}
```

---

#### `POST /v1/billing/checkout`
**Purpose:** Create Stripe Checkout session

**Request Body:**
```json
{
  "plan": "pro",
  "success_url": "https://co-interview.com/dashboard?success=true",
  "cancel_url": "https://co-interview.com/pricing"
}
```

**Response (200):**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_xxx"
}
```

---

#### `POST /v1/billing/portal`
**Purpose:** Create Stripe Customer Portal session

**Response (200):**
```json
{
  "portal_url": "https://billing.stripe.com/p/session/xxx"
}
```

---

### 5. Webhooks

#### `POST /webhooks/stripe`
**Purpose:** Handle Stripe events

**Events Handled:**
- `checkout.session.completed` → Activate subscription
- `customer.subscription.updated` → Update plan/status
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_failed` → Mark past_due

---

## Database Schema (Firestore)

### Users Collection
```
/users/{user_id}
{
  email: string,
  created_at: timestamp,
  
  // Stripe
  stripe_customer_id: string,
  
  // Subscription
  plan: "free" | "pro" | "team",
  status: "active" | "trialing" | "past_due" | "canceled",
  subscription_id: string,
  current_period_end: timestamp,
  
  // Quotas
  quota_seconds_month: number,      // e.g. 7200 for Pro
  quota_seconds_used: number,       // resets monthly
  quota_reset_at: timestamp,
  concurrency_limit: number,        // 1 for free, 3 for team
  
  // Features
  features: string[],               // ["audio", "unlimited_sessions"]
}
```

### Sessions Collection
```
/sessions/{session_id}
{
  user_id: string,
  model: string,
  started_at: timestamp,
  ended_at: timestamp | null,
  duration_seconds: number,
  status: "active" | "ended" | "expired",
}
```

---

## Rate Limiting (Redis)

| Key Pattern | Limit | Window |
|-------------|-------|--------|
| `rate:session_mint:{user_id}` | 10 | 1 minute |
| `rate:api:{user_id}` | 100 | 1 minute |
| `rate:ip:{ip}` | 50 | 1 minute |
| `active_session:{user_id}` | TTL lock | 11 minutes |

---

## Plan Limits

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Monthly Minutes | 60 | 600 | 3000 |
| Concurrent Sessions | 1 | 1 | 3 |
| Session Max Duration | 5 min | 10 min | 30 min |
| Audio Support | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

---

## Tech Stack

- **Runtime:** Node.js 20 / Python 3.11
- **Framework:** Express.js / FastAPI
- **Hosting:** Google Cloud Run
- **Database:** Firestore
- **Cache/Locks:** Redis (Memorystore)
- **Secrets:** Google Secret Manager
- **Auth:** Firebase Admin SDK
- **Payments:** Stripe SDK

---

## Environment Variables

```env
# Firebase
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
FIREBASE_PROJECT_ID=co-interview-481814

# Gemini
GEMINI_MASTER_API_KEY=<from Secret Manager>

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis
REDIS_URL=redis://10.0.0.1:6379

# App
NODE_ENV=production
PORT=8080
```

---

## Deployment Checklist

- [ ] Create Cloud Run service
- [ ] Set up Secret Manager for API keys
- [ ] Configure Firestore security rules
- [ ] Set up Redis (Memorystore)
- [ ] Configure Stripe webhooks
- [ ] Set up monitoring (Cloud Logging + Alerts)
- [ ] Load test session minting endpoint
