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
    },
    PRICES: {
        'sprint_30d': 'price_sprint',
        'lifetime': 'price_lifetime',
    },
    PLANS: {
        free: { quotaSecondsMonth: 3600 },
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

        // Default auth mock
        auth.verifyIdToken.mockResolvedValue({
            uid: 'user123',
            email: 'test@example.com',
            email_verified: true,
        });
    });

    describe('POST /v1/billing/checkout', () => {
        it('should create a checkout session for valid plan', async () => {
            // Mock user
            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    email: 'test@example.com',
                    stripeCustomerId: 'cus_123'
                })
            });

            // Mock Stripe session create
            stripe.checkout.sessions.create.mockResolvedValue({
                url: 'https://checkout.stripe.com/test',
                id: 'cs_test_123'
            });

            const res = await request(app)
                .post('/api/v1/billing/checkout')
                .set('Authorization', 'Bearer valid_token')
                .send({
                    plan: 'sprint_30d',
                    success_url: 'http://localhost/success',
                    cancel_url: 'http://localhost/cancel'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('checkout_url', 'https://checkout.stripe.com/test');
            expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
                customer: 'cus_123',
                mode: 'payment',
                success_url: 'http://localhost/success',
                metadata: expect.objectContaining({
                    firebase_uid: 'user123',
                    plan: 'sprint_30d'
                })
            }));
        });

        it('should create customer if not found on user', async () => {
            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    email: 'test@example.com',
                    // No stripeCustomerId
                })
            });

            stripe.customers.create.mockResolvedValue({ id: 'new_cus_123' });
            stripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.session' });

            await request(app)
                .post('/api/v1/billing/checkout')
                .set('Authorization', 'Bearer valid_token')
                .send({ plan: 'lifetime' });

            expect(stripe.customers.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com',
                metadata: { firebase_uid: 'user123' }
            }));
            expect(mockUserUpdate).toHaveBeenCalledWith({ stripeCustomerId: 'new_cus_123' });
        });

        it('should return 400 for invalid plan', async () => {
            const res = await request(app)
                .post('/api/v1/billing/checkout')
                .set('Authorization', 'Bearer valid_token')
                .send({ plan: 'invalid_plan' });

            expect(res.statusCode).toEqual(400);
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /v1/billing/checkout-status', () => {
        it('should return status complete if user plan updated', async () => {
            const sessionId = 'cs_test_complete';

            stripe.checkout.sessions.retrieve.mockResolvedValue({
                id: sessionId,
                client_reference_id: 'user123',
                metadata: { plan: 'sprint_30d' },
                payment_status: 'paid',
                status: 'complete'
            });

            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    plan: 'sprint_30d', // Match
                    status: 'active'
                })
            });

            const res = await request(app)
                .get(`/api/v1/billing/checkout-status?session_id=${sessionId}`)
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(expect.objectContaining({
                status: 'complete',
                plan: 'sprint_30d'
            }));
        });

        it('should return processing if paid but DB not updated', async () => {
            const sessionId = 'cs_test_paid_pending';

            stripe.checkout.sessions.retrieve.mockResolvedValue({
                id: sessionId,
                client_reference_id: 'user123',
                metadata: { plan: 'lifetime' },
                payment_status: 'paid',
                status: 'complete'
            });

            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    plan: 'free', // Old plan
                    status: 'active'
                })
            });

            const res = await request(app)
                .get(`/api/v1/billing/checkout-status?session_id=${sessionId}`)
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'processing');
        });

        it('should return 403 if session belongs to another user', async () => {
            const sessionId = 'cs_test_other_user';

            stripe.checkout.sessions.retrieve.mockResolvedValue({
                id: sessionId,
                client_reference_id: 'other_user', // Mismatch
                metadata: { firebase_uid: 'other_user' }
            });

            const res = await request(app)
                .get(`/api/v1/billing/checkout-status?session_id=${sessionId}`)
                .set('Authorization', 'Bearer valid_token'); // token says 'user123'

            expect(res.statusCode).toEqual(403);
        });
    });
});
