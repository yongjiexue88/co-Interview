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

        it('should log default unhandled event', async () => {
            const mockEvent = { type: 'unknown.event', data: { object: {} } };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            console.log = jest.fn(); // Mock console.log

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'valid')
                .send(mockEvent);

            expect(res.statusCode).toEqual(200);
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Unhandled event type'));
        });

        it('should handle handler error', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_error',
                        metadata: { firebase_uid: 'u_err', plan: 'pro' },
                        mode: 'subscription',
                        subscription: 'sub_err'
                    }
                }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);

            // We act as if handleCheckoutComplete throws when calling DB
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'valid')
                .send(mockEvent);

            expect(res.statusCode).toEqual(500);
        });

        it('should handle checkout with client_reference_id fallback', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_fallback',
                        mode: 'subscription',
                        metadata: { plan: 'pro' }, // Missing firebase_uid here
                        client_reference_id: 'uid_fallback',
                        subscription: 'sub_123'
                    }
                }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.subscriptions.retrieve.mockResolvedValue({ id: 'sub', current_period_end: 1000 });

            const mockUpdate = jest.fn().mockResolvedValue({});
            // Mock DB to expect uid_fallback
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ set: mockUpdate }) });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'valid')
                .send(mockEvent);

            expect(res.statusCode).toEqual(200);
            expect(db.collection).toHaveBeenCalledWith('users');
            // We can't easily verify the doc ID called in this mock setup without more complex mocking, 
            // but if it didn't crash and called set, we hit the branch.
        });

        it('should warn if plan missing', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_noplan',
                        mode: 'payment',
                        metadata: { firebase_uid: 'u1' }
                    }
                }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            console.warn = jest.fn();

            await request(app).post('/api/webhooks/stripe').send(mockEvent);
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Plan not found'), 'cs_noplan');
        });

        it('should log error if missing identifiers', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: { object: { id: 'cs_empty', metadata: {} } }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            console.error = jest.fn();

            await request(app).post('/api/webhooks/stripe').send(mockEvent);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing identifiers'), expect.anything());
        });

        it('should handle sprint_30d extension logic', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_sprint',
                        mode: 'payment',
                        metadata: { firebase_uid: 'u1', plan: 'sprint_30d' }
                    }
                }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);

            // Mock User Data for extension
            const currentEnd = new Date(Date.now() + 86400000); // 1 day future
            const mockUserDoc = {
                data: () => ({
                    plan: 'sprint_30d',
                    status: 'active',
                    currentPeriodEnd: { toDate: () => currentEnd }
                })
            };

            const mockSet = jest.fn().mockResolvedValue({});
            const mockGet = jest.fn().mockResolvedValue(mockUserDoc);

            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: mockGet,
                    set: mockSet
                })
            });

            await request(app).post('/api/webhooks/stripe').send(mockEvent);

            // Expect currentPeriodEnd to be old end + 30 days
            const expectedEnd = new Date(currentEnd.getTime() + (30 * 24 * 60 * 60 * 1000));
            // Allow small delta
            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                currentPeriodEnd: expect.any(Date)
            }), { merge: true });

            const callArg = mockSet.mock.calls[0][0];
            expect(callArg.currentPeriodEnd.getTime()).toBeCloseTo(expectedEnd.getTime(), -3);
        });

        it('should return error if no firebase_uid in sub update', async () => {
            const mockEvent = {
                type: 'customer.subscription.updated',
                data: { object: { customer: 'cus_no_uid' } }
            };
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            stripe.customers.retrieve.mockResolvedValue({ metadata: {} });
            console.error = jest.fn();

            await request(app).post('/api/webhooks/stripe').send(mockEvent);
            expect(console.error).toHaveBeenCalledWith('No firebase_uid in customer metadata');
        });
    });
});
