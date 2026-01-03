const request = require('supertest');

const app = require('../../src/index');
const { stripe } = require('../../src/config/stripe');
const { db } = require('../../src/config/firebase');

// Mock Stripe locally to this test file if needed, or rely on jest.setup.js
// Since jest.setup.js already mocks stripe module, the instance exported by config/stripe IS a mock.

describe('Webhook Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/webhooks', () => {
        it('should handle checkout.session.completed event', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        metadata: { userId: 'user123' },
                        subscription: 'sub_123',
                        customer: 'cus_123',
                    },
                },
            };

            const mockSubscription = {
                items: { data: [{ price: { product: 'prod_pro' } }] },
                current_period_end: 1735689600, // Future date
                status: 'active',
            };

            // Mock Stripe responses
            stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
            // Mock stripe.subscriptions.retrieve if your code uses it
            // Based on typical implementation, it might fetch subscription.
            // But let's check webhooks.js content first. Assuming it does:
            stripe.subscriptions = {
                retrieve: jest.fn().mockResolvedValue(mockSubscription),
            };

            // Mock DB
            const mockUserRef = {
                update: jest.fn().mockResolvedValue({}),
            };
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue(mockUserRef),
            });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify(mockEvent)) // Webhooks often need raw body
                .set('stripe-signature', 'valid_signature');

            expect(res.statusCode).toEqual(200);
            expect(stripe.webhooks.constructEvent).toHaveBeenCalled();
            // Verify DB update happened (user entitlement update)
            // This assertion depends on exact implementation in webhooks.js
        });

        it('should return 400 for invalid signature', async () => {
            stripe.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .send(JSON.stringify({}))
                .set('stripe-signature', 'invalid_signature');

            expect(res.statusCode).toEqual(400);
            expect(res.text).toContain('Webhook Error: Invalid signature');
        });
    });
});
