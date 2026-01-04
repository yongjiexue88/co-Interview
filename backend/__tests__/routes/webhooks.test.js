const request = require('supertest');
const app = require('../../src/index');
const { stripe } = require('../../src/config/stripe');
const { db } = require('../../src/config/firebase');

describe('Webhook Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/webhooks/stripe', () => {
        it('should handle checkout.session.completed for subscription', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_123',
                        mode: 'subscription',
                        metadata: { firebase_uid: 'user123', plan: 'pro' },
                        subscription: 'sub_123',
                        customer: 'cus_123'
                    },
                },
            };

            const mockSubscription = {
                id: 'sub_123',
                current_period_end: 1735689600,
                status: 'active',
            };

            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.subscriptions.retrieve = jest.fn().mockResolvedValue(mockSubscription);

            const mockUpdate = jest.fn().mockResolvedValue({});
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent))
                .set('stripe-signature', 'valid');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ plan: 'pro' }), { merge: true });
        });

        it('should handle checkout.session.completed for lifetime payment', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_456',
                        mode: 'payment',
                        metadata: { firebase_uid: 'user456', plan: 'lifetime' }
                    },
                },
            };

            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            const mockUpdate = jest.fn().mockResolvedValue({});
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent))
                .set('stripe-signature', 'valid');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ plan: 'lifetime', currentPeriodEnd: null }), { merge: true });
        });

        it('should handle customer.subscription.updated', async () => {
            const mockEvent = {
                type: 'customer.subscription.updated',
                data: {
                    object: {
                        customer: 'cus_123',
                        status: 'past_due',
                        current_period_end: 1735689600,
                        items: { data: [{ price: { id: 'price_pro' } }] }
                    },
                },
            };

            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.customers.retrieve = jest.fn().mockResolvedValue({ metadata: { firebase_uid: 'user123' } });
            const mockUpdate = jest.fn().mockResolvedValue({});
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent))
                .set('stripe-signature', 'valid');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'past_due' }), { merge: true });
        });

        it('should handle customer.subscription.deleted', async () => {
            const mockEvent = {
                type: 'customer.subscription.deleted',
                data: { object: { customer: 'cus_123' } },
            };

            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.customers.retrieve = jest.fn().mockResolvedValue({ metadata: { firebase_uid: 'user123' } });
            const mockUpdate = jest.fn().mockResolvedValue({});
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent))
                .set('stripe-signature', 'valid');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ plan: 'free' }), { merge: true });
        });

        it('should handle invoice.payment_failed', async () => {
            const mockEvent = {
                type: 'invoice.payment_failed',
                data: { object: { customer: 'cus_123' } },
            };

            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.customers.retrieve = jest.fn().mockResolvedValue({ metadata: { firebase_uid: 'user123' } });
            const mockUpdate = jest.fn().mockResolvedValue({});
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent))
                .set('stripe-signature', 'valid');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'past_due' }), { merge: true });
        });

        it('should return 400 for invalid signature', async () => {
            stripe.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'invalid');

            expect(res.statusCode).toEqual(400);
        });
    });
});
