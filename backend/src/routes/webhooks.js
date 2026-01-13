const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { stripe, PLANS, normalizePlanId, getPlanConfig } = require('../config/stripe');

function listToMap(list) {
    if (!Array.isArray(list)) return list || {};
    return list.reduce((acc, item) => {
        acc[item] = true;
        return acc;
    }, {});
}

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
    let { firebase_uid, plan } = session.metadata || {};

    // Fallback for Payment Links which use client_reference_id
    if (!firebase_uid && session.client_reference_id) {
        firebase_uid = session.client_reference_id;
    }

    // Infer plan for one-time payments if not explicitly in metadata (e.g. from payment links)
    // Note: This relies on you setting the plan in metadata for your own checkout flow.
    // For raw payment links, you might need to map price ID to plan if metadata isn't set.
    if (!plan && session.mode === 'payment') {
        // Attempt to find plan from line items if expanded, or just default to lifetime if that was the only one-time use case before.
        // Better safe fallback: check amount or just require metadata/setup.
        // For this specific requirement, let's assume metadata is populated or we strictly check price_id if possible.
        // But session object in webhook usually doesn't have line_items expanded by default unless configured.
        // Let's rely on metadata passed in /checkout or Payment Link query params (client_reference_id).
        // If we don't know the plan, we might log error.
        console.warn('Plan not found in metadata for checkout session', session.id);
    }

    if (!firebase_uid || !plan) {
        console.error('Missing identifiers in checkout session', {
            firebase_uid,
            plan,
            client_reference_id: session.client_reference_id,
            mode: session.mode,
        });
        return;
    }

    const normalizedPlan = normalizePlanId(plan);
    const planConfig = getPlanConfig(normalizedPlan);

    let subscriptionId = null;
    let currentPeriodEnd = null;

    if (session.mode === 'subscription') {
        if (session.subscription) {
            subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
            // We need to fetch subscription to get End Date if not present, but usually 'checkout.session.completed' might not have it all.
            // Actually, simplest is to let 'customer.subscription.updated' handle the precise dates,
            // and here just mark as active. But user wants blocking flow.
            // Let's fetch it to be sure.
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }
    } else if (session.mode === 'payment') {
        // One-time payment (Pro or Lifetime)
        if (normalizedPlan === 'lifetime') {
            currentPeriodEnd = null; // null means forever
        } else if (normalizedPlan === 'pro') {
            // Extension logic: max(now, current.accessEndAt) + 30 days
            const userRef = db.collection('users').doc(firebase_uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data() || {};

            const now = Date.now();
            let currentEnd = 0;

            // Check if user already has active pro access
            const existingPlanId = normalizePlanId(userData.access?.planId || userData.plan);
            const existingStatus = userData.access?.accessStatus || userData.status;
            const existingPeriodEnd = userData.billing?.currentPeriodEnd || userData.currentPeriodEnd;

            if (existingPlanId === 'pro' && existingStatus === 'active' && existingPeriodEnd) {
                // Firestore timestamp to millis
                const exEnd = existingPeriodEnd.toDate ? existingPeriodEnd.toDate().getTime() : new Date(existingPeriodEnd).getTime();
                currentEnd = exEnd;
            }

            // If currentEnd is in the past, treat as now. If future, start from there.
            const startPoint = Math.max(now, currentEnd);
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            currentPeriodEnd = new Date(startPoint + thirtyDaysMs);
        }
    }

    await db
        .collection('users')
        .doc(firebase_uid)
        .set(
            {
                'access.planId': normalizedPlan,
                'access.accessStatus': 'active',
                'access.concurrencyLimit': planConfig.concurrencyLimit,
                'access.features': listToMap(planConfig.features),
                'usage.quotaSecondsMonth': planConfig.quotaSecondsMonth,
                'billing.subscriptionId': subscriptionId,
                'billing.currentPeriodEnd': currentPeriodEnd,
                'billing.billingStatus': 'active',
                'meta.updatedAt': new Date(),
                // Legacy fields for backward compatibility
                plan: normalizedPlan,
                status: 'active',
                subscriptionId, // null for one-time
                currentPeriodEnd,
                quotaSecondsMonth: planConfig.quotaSecondsMonth,
                concurrencyLimit: planConfig.concurrencyLimit,
                features: planConfig.features,
                // Optional: track purchases
                lastPurchase: {
                    planId: normalizedPlan,
                    amount: session.amount_total,
                    currency: session.currency,
                    checkoutSessionId: session.id,
                    purchasedAt: new Date(),
                },
            },
            { merge: true }
        );

    console.log(`✅ User ${firebase_uid} upgraded to ${normalizedPlan}`);
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
    if (priceId === process.env.STRIPE_PRICE_SPRINT_30D) plan = 'pro';
    if (priceId === process.env.STRIPE_PRICE_LIFETIME) plan = 'lifetime';

    const normalizedPlan = normalizePlanId(plan);
    const planConfig = getPlanConfig(normalizedPlan);

    // Map Stripe status to our status
    let status = 'active';
    if (subscription.status === 'past_due') status = 'past_due';
    if (subscription.status === 'canceled') status = 'canceled';
    if (subscription.status === 'trialing') status = 'trialing';

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await db
        .collection('users')
        .doc(firebaseUid)
        .set(
            {
                'access.planId': normalizedPlan,
                'access.accessStatus': status,
                'access.concurrencyLimit': planConfig.concurrencyLimit,
                'access.features': listToMap(planConfig.features),
                'usage.quotaSecondsMonth': planConfig.quotaSecondsMonth,
                'billing.subscriptionId': subscription.id,
                'billing.currentPeriodEnd': currentPeriodEnd,
                'billing.billingStatus': status,
                'meta.updatedAt': new Date(),
                // Legacy fields
                plan: normalizedPlan,
                status,
                subscriptionId: subscription.id,
                currentPeriodEnd,
                quotaSecondsMonth: planConfig.quotaSecondsMonth,
                concurrencyLimit: planConfig.concurrencyLimit,
                features: planConfig.features,
            },
            { merge: true }
        );

    console.log(`📝 Subscription updated for ${firebaseUid}: ${normalizedPlan} (${status})`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription) {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUid = customer.metadata?.firebase_uid;

    if (!firebaseUid) return;

    const freeConfig = PLANS.free;

    await db.collection('users').doc(firebaseUid).set(
        {
            'access.planId': 'free',
            'access.accessStatus': 'active',
            'access.concurrencyLimit': freeConfig.concurrencyLimit,
            'access.features': listToMap(freeConfig.features),
            'usage.quotaSecondsMonth': freeConfig.quotaSecondsMonth,
            'billing.subscriptionId': null,
            'billing.currentPeriodEnd': null,
            'billing.billingStatus': 'active',
            'meta.updatedAt': new Date(),
            // Legacy fields
            plan: 'free',
            status: 'active',
            subscriptionId: null,
            currentPeriodEnd: null,
            quotaSecondsMonth: freeConfig.quotaSecondsMonth,
            concurrencyLimit: freeConfig.concurrencyLimit,
            features: freeConfig.features,
        },
        { merge: true }
    );

    console.log(`❌ Subscription canceled for ${firebaseUid}, downgraded to free`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const firebaseUid = customer.metadata?.firebase_uid;

    if (!firebaseUid) return;

    await db.collection('users').doc(firebaseUid).set(
        {
            'access.accessStatus': 'past_due',
            'billing.billingStatus': 'past_due',
            'meta.updatedAt': new Date(),
            // Legacy field
            status: 'past_due',
        },
        { merge: true }
    );

    console.log(`⚠️ Payment failed for ${firebaseUid}`);
}

module.exports = router;
