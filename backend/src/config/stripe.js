const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

// Price IDs for subscription plans
const PRICES = {
    pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
    team: process.env.STRIPE_PRICE_TEAM_MONTHLY
};

// Plan configurations
const PLANS = {
    free: {
        name: 'Free',
        quotaSecondsMonth: 60 * 60,      // 60 minutes
        sessionMaxDuration: 5 * 60,       // 5 minutes
        concurrencyLimit: 1,
        features: []
    },
    pro: {
        name: 'Pro',
        quotaSecondsMonth: 10 * 60 * 60,  // 600 minutes (10 hours)
        sessionMaxDuration: 10 * 60,      // 10 minutes
        concurrencyLimit: 1,
        features: ['audio', 'priority_support']
    },
    team: {
        name: 'Team',
        quotaSecondsMonth: 50 * 60 * 60,  // 3000 minutes (50 hours)
        sessionMaxDuration: 30 * 60,      // 30 minutes
        concurrencyLimit: 3,
        features: ['audio', 'priority_support', 'team_features']
    }
};

module.exports = { stripe, PRICES, PLANS };
