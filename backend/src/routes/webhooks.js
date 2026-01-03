const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { stripe, PLANS } = require('../config/stripe');

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 */
router.post('/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📬 Received Stripe webhook: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutComplete(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session) {
    const { firebase_uid, plan } = session.metadata;

    if (!firebase_uid || !plan) {
        console.error('Missing metadata in checkout session');
        return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const planConfig = PLANS[plan] || PLANS.free;

    await db
        .collection('users')
        .doc(firebase_uid)
        .update({
            plan,
            status: 'active',
            subscriptionId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            quotaSecondsMonth: planConfig.quotaSecondsMonth,
            concurrencyLimit: planConfig.concurrencyLimit,
            features: planConfig.features,
        });

    console.log(`✅ User ${firebase_uid} upgraded to ${plan}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUid = customer.metadata?.firebase_uid;

    if (!firebaseUid) {
        console.error('No firebase_uid in customer metadata');
        return;
    }

    // Determine plan from price
    let plan = 'free';
    const priceId = subscription.items.data[0]?.price.id;
    if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) plan = 'pro';
    if (priceId === process.env.STRIPE_PRICE_TEAM_MONTHLY) plan = 'team';

    const planConfig = PLANS[plan];

    // Map Stripe status to our status
    let status = 'active';
    if (subscription.status === 'past_due') status = 'past_due';
    if (subscription.status === 'canceled') status = 'canceled';
    if (subscription.status === 'trialing') status = 'trialing';

    await db
        .collection('users')
        .doc(firebaseUid)
        .update({
            plan,
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            quotaSecondsMonth: planConfig.quotaSecondsMonth,
            concurrencyLimit: planConfig.concurrencyLimit,
            features: planConfig.features,
        });

    console.log(`📝 Subscription updated for ${firebaseUid}: ${plan} (${status})`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUid = customer.metadata?.firebase_uid;

    if (!firebaseUid) return;

    const freeConfig = PLANS.free;

    await db.collection('users').doc(firebaseUid).update({
        plan: 'free',
        status: 'active',
        subscriptionId: null,
        quotaSecondsMonth: freeConfig.quotaSecondsMonth,
        concurrencyLimit: freeConfig.concurrencyLimit,
        features: freeConfig.features,
    });

    console.log(`❌ Subscription canceled for ${firebaseUid}, downgraded to free`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const firebaseUid = customer.metadata?.firebase_uid;

    if (!firebaseUid) return;

    await db.collection('users').doc(firebaseUid).update({
        status: 'past_due',
    });

    console.log(`⚠️ Payment failed for ${firebaseUid}`);
}

module.exports = router;
