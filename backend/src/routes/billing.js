const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { stripe, PRICES, PLANS } = require('../config/stripe');

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

        // If no Stripe subscription, return free plan info
        if (!user.subscriptionId) {
            return res.json({
                plan: 'free',
                status: 'active',
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
            plan: user.plan,
            status: user.status,
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

        if (!PRICES[plan]) {
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
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICES[plan],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: success_url || `${process.env.FRONTEND_URL}/dashboard?success=true`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/pricing`,
            metadata: {
                firebase_uid: uid,
                plan,
            },
        });

        res.json({ checkout_url: session.url });
    } catch (error) {
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

module.exports = router;
