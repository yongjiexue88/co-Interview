const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { stripe, PRICES, normalizePlanId } = require('../config/stripe');

/**
 * GET /v1/billing/subscription
 * Get current subscription details
 */
router.get('/subscription', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userDoc.data();

        const planId = normalizePlanId(user.access?.planId || user.plan || 'free');
        const status = user.access?.accessStatus || user.status || 'active';

        // If no Stripe subscription, return current plan info
        if (!user.subscriptionId) {
            return res.json({
                plan: planId,
                status,
                current_period_start: null,
                current_period_end: null,
                cancel_at_period_end: false,
                payment_method: null,
            });
        }

        // Get subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
            expand: ['default_payment_method'],
        });

        const paymentMethod = subscription.default_payment_method;

        res.json({
            plan: planId,
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            payment_method: paymentMethod
                ? {
                      type: paymentMethod.type,
                      last4: paymentMethod.card?.last4,
                      brand: paymentMethod.card?.brand,
                  }
                : null,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /v1/billing/checkout
 * Create Stripe Checkout session
 */
router.post('/checkout', authMiddleware, async (req, res, next) => {
    try {
        const { uid, email } = req.user;
        const { plan, success_url, cancel_url } = req.body;
        const normalizedPlan = normalizePlanId(plan);

        if (!PRICES[normalizedPlan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Get or create Stripe customer
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const user = userDoc.data();

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: { firebase_uid: uid },
            });
            customerId = customer.id;
            await userRef.update({ stripeCustomerId: customerId });
        }

        // Create checkout session
        // Create checkout session
        // Determine mode based on plan
        // Pro plan is a recurring subscription in Stripe (even if treated as a pass)
        // Lifetime is a one-time payment
        const isSubscription = false;

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICES[normalizedPlan],
                    quantity: 1,
                },
            ],
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: success_url || `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/#pricing`,
            metadata: {
                firebase_uid: uid,
                plan: normalizedPlan,
            },
            client_reference_id: uid,
        });

        res.json({ checkout_url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        next(error);
    }
});

/**
 * POST /v1/billing/portal
 * Create Stripe Customer Portal session
 */
router.post('/portal', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;

        const userDoc = await db.collection('users').doc(uid).get();
        const user = userDoc.data();

        if (!user.stripeCustomerId) {
            return res.status(400).json({ error: 'No billing account found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/dashboard`,
        });

        res.json({ portal_url: session.url });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /v1/billing/checkout-status?session_id=...
 * Poll status of a checkout session
 */
router.get('/checkout-status', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Security check: ensure this session belongs to the user
        const sessionUid = session.client_reference_id || session.metadata?.firebase_uid;

        if (sessionUid && sessionUid !== uid) {
            return res.status(403).json({ error: 'Unauthorized access to this session' });
        }

        if (session.payment_status === 'paid') {
            // Check if entitlement is already applied
            const userDoc = await db.collection('users').doc(uid).get();
            const user = userDoc.data();

            // Should match plan from metadata
            const plan = normalizePlanId(session.metadata?.plan);
            const accessStatus = user.access?.accessStatus || user.status || 'active';
            const storedPlan = normalizePlanId(user.access?.planId || user.plan || 'free');

            if (storedPlan === plan && accessStatus === 'active') {
                // Simple verification
                return res.json({ status: 'complete', plan, entitlement: user });
            }

            // If webhook hasn't processed it yet
            return res.json({ status: 'processing' });
        }

        res.json({ status: session.status }); // 'open', 'complete', 'expired'
    } catch (error) {
        next(error);
    }
});

module.exports = router;
