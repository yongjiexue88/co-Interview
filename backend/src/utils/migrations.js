const { PLANS } = require('../config/stripe');

/**
 * Migrate a user document to Schema V2
 * Idempotent: safe to run multiple times
 * Transactional: Does not delete unknown fields (uses merge)
 */
function migrateUserToV2(userData) {
    const v2 = {
        meta: {
            schemaVersion: 2,
            updatedAt: new Date(),
            sourceOfTruth: 'migration_v2',
        },
        profile: {
            email: userData.email,
            displayName: userData.displayName || null,
            photoURL: userData.photoURL || null,
            createdAt: userData.createdAt,
            // Last login might not exist in V1, keep if present
            lastLoginAt: userData.lastLoginAt || new Date(),
            locale: userData.locale || 'en',
            timezone: userData.timezone || null,
        },
        preferences: {
            onboarding: {
                userPersona: userData.userPersona || null,
                userRole: userData.userRole || null,
                userExperience: userData.userExperience || null,
                userReferral: userData.userReferral || null,
            },
            tailor: {
                outputLanguage: userData.outputLanguage || 'English',
                programmingLanguage: userData.programmingLanguage || 'Python',
                audioLanguage: userData.audioLanguage || 'en',
                customPrompt: userData.customPrompt || null,
            },
        },
        access: {
            planId: userData.plan || 'free',
            accessStatus: userData.status || 'active', // Map old 'status' to 'accessStatus'
            features: listToMap(userData.features || []), // Convert array to map
            concurrencyLimit: userData.concurrencyLimit || 1,
        },
        usage: {
            quotaSecondsMonth: userData.quotaSecondsMonth || 3600,
            quotaSecondsUsed: userData.quotaSecondsUsed || 0,
            quotaResetAt: userData.quotaResetAt,
        },
        billing: {
            stripeCustomerId: userData.stripeCustomerId || null,
            subscriptionId: userData.subscriptionId || null,
            billingStatus: userData.billingStatus || 'active',
        },
        security: {
            lastLoginIp: userData.lastLoginIp || null,
            lastLoginUserAgent: userData.lastLoginUserAgent || null,
        },
        // devicesSummary will be built/updated by the caller/verify endpoint
    };

    return v2;
}

/**
 * Helper to convert feature array to boolean map
 * e.g. ['a', 'b'] -> { a: true, b: true }
 */
function listToMap(list) {
    if (!Array.isArray(list)) return list || {};
    return list.reduce((acc, item) => {
        acc[item] = true;
        return acc;
    }, {});
}

module.exports = { migrateUserToV2 };
