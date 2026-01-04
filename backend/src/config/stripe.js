const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Price IDs for subscription plans
const PRICES = {
    sprint_30d: process.env.STRIPE_PRICE_SPRINT_30D,
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

// Plan configurations
const PLANS = {
    free: {
        name: 'Free',
        quotaSecondsMonth: 60 * 60, // 60 minutes
        sessionMaxDuration: 10 * 60, // 10 minutes
        concurrencyLimit: 1,
        features: [],
        enabled: true,
        kind: 'free',
    },
    sprint_30d: {
        name: 'Interview Sprint (30 Days)',
        quotaSecondsMonth: 40 * 60 * 60, // 40 hours (flexible, based on user requirements "low quota or ...") - attempting to match "40 hours" from user request example? Actually user example said "quotaSecondsTotal: 40 * 60 * 60"
        sessionMaxDuration: 60 * 60, // 60 minutes
        concurrencyLimit: 2,
        features: ['audio', 'all_languages', 'undetectable'],
        duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        kind: 'time_pass',
        enabled: true,
    },
    lifetime: {
        name: 'Lifetime',
        quotaSecondsMonth: 1000000000 * 60, // Effectively infinite
        sessionMaxDuration: 60 * 60, // 60 minutes (can be longer if desired)
        concurrencyLimit: 5,
        features: ['audio', 'all_languages', 'undetectable', 'priority_support', 'early_access'],
        duration: null, // Forever
        kind: 'lifetime',
        enabled: true,
    },
};

module.exports = { stripe, PRICES, PLANS };
