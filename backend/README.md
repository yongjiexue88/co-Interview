# Co-Interview Backend API

V2 SaaS Backend for Co-Interview, providing session minting, billing, and usage tracking.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev
```

## Environment Setup

1. **Firebase Service Account**: Download from Firebase Console → Project Settings → Service Accounts
2. **Stripe Keys**: Get from Stripe Dashboard
3. **Gemini API Key**: Store in Google Secret Manager for production

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/v1/auth/verify` | Verify token, get entitlements |
| POST | `/v1/realtime/session` | Mint session credentials |
| POST | `/v1/realtime/session/:id/end` | End session, record usage |
| POST | `/v1/realtime/heartbeat` | Keep-alive, check quota |
| GET | `/v1/usage` | Get usage stats |
| GET | `/v1/billing/subscription` | Get subscription details |
| POST | `/v1/billing/checkout` | Create Stripe Checkout |
| POST | `/v1/billing/portal` | Create Stripe Portal |
| POST | `/webhooks/stripe` | Stripe webhook handler |

## Deployment

### Cloud Run

```bash
gcloud run deploy co-interview-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_MASTER_API_KEY=gemini-key:latest
```

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Express app entry
│   ├── config/
│   │   ├── firebase.js   # Firebase Admin SDK
│   │   ├── stripe.js     # Stripe + plan configs
│   │   └── redis.js      # Redis for rate limiting
│   ├── middleware/
│   │   ├── auth.js       # Firebase token verification
│   │   └── errorHandler.js
│   └── routes/
│       ├── health.js
│       ├── auth.js
│       ├── session.js    # Core session minting
│       ├── usage.js
│       ├── billing.js
│       └── webhooks.js
├── .env.example
├── .gitignore
└── package.json
```
