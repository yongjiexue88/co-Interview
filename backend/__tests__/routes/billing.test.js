const request = require('supertest');
const app = require('../../src/index');
const { auth, db } = require('../../src/config/firebase');

// Mock stripe config
jest.mock('../../src/config/stripe', () => ({
    stripe: {
        customers: { create: jest.fn() },
        checkout: {
            sessions: {
                create: jest.fn(),
                retrieve: jest.fn()
            }
        },
        subscriptions: { retrieve: jest.fn() },
        billingPortal: { sessions: { create: jest.fn() } }
    },
    PRICES: {
        'sprint_30d': 'price_sprint',
        'lifetime': 'price_lifetime',
    },
    PLANS: {
        free: { quotaSecondsMonth: 3600 },
        pro: { quotaSecondsMonth: 36000 }
    }
}));

const { stripe } = require('../../src/config/stripe');

// Mock Firestore
const mockUserGet = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserSet = jest.fn();

db.collection = jest.fn((collectionName) => {
    if (collectionName === 'users') {
        return {
            doc: jest.fn(() => ({
                get: mockUserGet,
                update: mockUserUpdate,
                set: mockUserSet,
            })),
        };
    }
    return {
        doc: jest.fn(() => ({ get: jest.fn(), set: jest.fn(), update: jest.fn() })),
    };
});

describe('Billing Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        auth.verifyIdToken.mockResolvedValue({
            uid: 'user123',
            email: 'test@example.com',
            email_verified: true,
        });
    });

    describe('GET /v1/billing/subscription', () => {
        it('should return subscription details', async () => {
            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({ subscriptionId: 'sub_123', plan: 'pro', status: 'active' })
            });

            stripe.subscriptions.retrieve.mockResolvedValue({
                current_period_start: 1735689600,
                current_period_end: 1738368000,
                cancel_at_period_end: false,
                default_payment_method: { type: 'card', card: { last4: '4242', brand: 'visa' } }
            });

            const res = await request(app)
                .get('/api/v1/billing/subscription')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body.plan).toBe('pro');
        });

        it('should return free plan info if no subscriptionId', async () => {
            mockUserGet.mockResolvedValue({ exists: true, data: () => ({}) });
            const res = await request(app).get('/api/v1/billing/subscription').set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(200);
            expect(res.body.plan).toBe('free');
        });
    });

    describe('POST /v1/billing/portal', () => {
        it('should return portal URL', async () => {
            mockUserGet.mockResolvedValue({ exists: true, data: () => ({ stripeCustomerId: 'cus_123' }) });
            stripe.billingPortal.sessions.create.mockResolvedValue({ url: 'https://portal.stripe.com/test' });

            const res = await request(app)
                .post('/api/v1/billing/portal')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body.portal_url).toBe('https://portal.stripe.com/test');
        });

        it('should return 400 if no stripeCustomerId', async () => {
            mockUserGet.mockResolvedValue({ exists: true, data: () => ({}) });
            const res = await request(app).post('/api/v1/billing/portal').set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/v1/billing/checkout', () => {
        it('should create a checkout session', async () => {
            mockUserGet.mockResolvedValue({ exists: true, data: () => ({ stripeCustomerId: 'cus_123' }) });
            stripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });

            const res = await request(app).post('/api/v1/billing/checkout').set('Authorization', 'Bearer valid_token').send({ plan: 'sprint_30d' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.checkout_url).toBe('https://checkout.stripe.com/test');
        });
    });

    describe('GET /api/v1/billing/checkout-status', () => {
        it('should return complete if paid and user updated', async () => {
            stripe.checkout.sessions.retrieve.mockResolvedValue({
                payment_status: 'paid',
                metadata: { plan: 'sprint_30d' },
                client_reference_id: 'user123'
            });
            mockUserGet.mockResolvedValue({ exists: true, data: () => ({ plan: 'sprint_30d', status: 'active' }) });

            const res = await request(app).get('/api/v1/billing/checkout-status?session_id=cs_1').set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('complete');
        });

        it('should return 400 if session_id missing', async () => {
            const res = await request(app).get('/api/v1/billing/checkout-status').set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(400);
        });
    });
});
