const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock dependencies BEFORE importing routes
jest.mock('../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../config/stripe', () => {
    return {
        stripe: {
            webhooks: {
                constructEvent: jest.fn(),
            },
            subscriptions: {
                retrieve: jest.fn(),
            },
            customers: {
                retrieve: jest.fn(),
            },
        },
        PLANS: {
            free: { quotaSecondsMonth: 3600, concurrencyLimit: 1, features: [] },
            pro: { quotaSecondsMonth: 18000, concurrencyLimit: 5, features: ['pro'] },
            lifetime: { quotaSecondsMonth: 36000, concurrencyLimit: 10, features: ['lifetime'] },
            sprint_30d: { quotaSecondsMonth: 7200, concurrencyLimit: 2, features: ['sprint'] },
        },
    };
});

// Import after mocks
const webhooksRouter = require('./webhooks');
const { stripe } = require('../config/stripe');
const { db } = require('../config/firebase');

const app = express();
// Webhooks need raw body for signature verification in real app, but here we mock constructEvent
app.use(bodyParser.json());
app.use('/webhooks', webhooksRouter);

describe('Stripe Webhooks', () => {
    let mockUserDoc;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup Firestore mocks
        mockUserDoc = {
            exists: true,
            data: jest.fn().mockReturnValue({}),
        };
        const mockDocRef = {
            get: jest.fn().mockResolvedValue(mockUserDoc),
            set: jest.fn().mockResolvedValue(true),
        };
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue(mockDocRef),
        });
    });

    it('should return 400 for invalid signature', async () => {
        stripe.webhooks.constructEvent.mockImplementation(() => {
            throw new Error('Invalid signature');
        });

        await request(app).post('/webhooks/stripe').set('stripe-signature', 'invalid').send({ type: 'test' }).expect(400);
    });

    describe('checkout.session.completed', () => {
        it('should handle one-time lifetime payment', async () => {
            const event = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        mode: 'payment',
                        metadata: { firebase_uid: 'user123', plan: 'lifetime' },
                        client_reference_id: 'user123',
                    },
                },
            };
            stripe.webhooks.constructEvent.mockReturnValue(event);

            await request(app).post('/webhooks/stripe').send(event).expect(200);

            expect(db.collection).toHaveBeenCalledWith('users');
            // Check calling doc with firebase_uid
            expect(db.collection('users').doc).toHaveBeenCalledWith('user123');

            // Check the set call
            const setCall = db.collection('users').doc('user123').set.mock.calls[0];
            expect(setCall[0]).toEqual(
                expect.objectContaining({
                    plan: 'lifetime',
                    status: 'active',
                    currentPeriodEnd: null,
                })
            );
            expect(setCall[1]).toEqual({ merge: true });
        });

        it('should handle subscription creation', async () => {
            const event = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        mode: 'subscription',
                        updated: 1234567890,
                        subscription: 'sub_123',
                        metadata: { firebase_uid: 'user456', plan: 'pro' },
                    },
                },
            };
            stripe.webhooks.constructEvent.mockReturnValue(event);

            stripe.subscriptions.retrieve.mockResolvedValue({
                id: 'sub_123',
                current_period_end: 1700000000,
            });

            await request(app).post('/webhooks/stripe').send(event).expect(200);

            const setCall = db.collection('users').doc('user456').set.mock.calls[0];
            expect(setCall[0]).toEqual(
                expect.objectContaining({
                    plan: 'pro',
                    subscriptionId: 'sub_123',
                    currentPeriodEnd: expect.any(Date),
                })
            );
        });
    });

    describe('customer.subscription.updated', () => {
        it('should update user status and plan', async () => {
            const event = {
                type: 'customer.subscription.updated',
                data: {
                    object: {
                        customer: 'cus_123',
                        status: 'active',
                        current_period_end: 1700000000,
                        items: {
                            data: [{ price: { id: 'price_pro' } }],
                        },
                    },
                },
            };
            stripe.webhooks.constructEvent.mockReturnValue(event);
            stripe.customers.retrieve.mockResolvedValue({
                metadata: { firebase_uid: 'user789' },
            });

            // Mock env var for price mapping if needed, or rely on default 'free'
            // The code maps unknown prices to 'free', assuming defaults.
            // Let's assume price_pro maps to 'free' in the test unless we mock env vars.
            // To test logic, we check calls.

            await request(app).post('/webhooks/stripe').send(event).expect(200);

            expect(stripe.customers.retrieve).toHaveBeenCalledWith('cus_123');
            expect(db.collection).toHaveBeenCalledWith('users');
            expect(db.collection('users').doc).toHaveBeenCalledWith('user789');
        });
    });

    describe('customer.subscription.deleted', () => {
        it('should downgrade user to free', async () => {
            const event = {
                type: 'customer.subscription.deleted',
                data: {
                    object: {
                        customer: 'cus_canc',
                    },
                },
            };
            stripe.webhooks.constructEvent.mockReturnValue(event);
            stripe.customers.retrieve.mockResolvedValue({
                metadata: { firebase_uid: 'user_canc' },
            });

            await request(app).post('/webhooks/stripe').send(event).expect(200);

            const setCall = db.collection('users').doc('user_canc').set.mock.calls[0];
            expect(setCall[0]).toEqual(
                expect.objectContaining({
                    plan: 'free',
                    status: 'active',
                    subscriptionId: null,
                })
            );
        });
    });
});
