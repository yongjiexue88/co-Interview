# Co-Interview TODO

## 🔧 Configuration Tasks

### Stripe Setup (Required for Billing)
- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
- [ ] Create **Pro Plan** product with one-time payment price
- [ ] Create **Lifetime Plan** product with one-time payment price
- [ ] Copy Price IDs and update `backend/.env`:
  ```bash
  STRIPE_PRICE_SPRINT_30D=price_YOUR_PRO_PRICE_ID
  STRIPE_PRICE_LIFETIME=price_YOUR_LIFETIME_PRICE_ID
  ```
- [ ] For production: Switch from `sk_test_*` to `sk_live_*` keys
- [ ] Configure Stripe webhook endpoint in dashboard pointing to `/api/webhooks/stripe`

### Redis Setup (Optional - For Rate Limiting)
- [ ] Set up Redis instance (local or cloud like Upstash/Redis Cloud)
- [ ] Uncomment and configure in `backend/.env`:
  ```bash
  REDIS_URL=redis://your-redis-url:6379
  ```
- [ ] Redis enables: rate limiting, concurrency locks, session management
