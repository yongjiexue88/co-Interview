const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { PLANS, getPlanConfig } = require('../config/stripe');

/**
 * GET /v1/users/me
 * Get current user entitlement, plan details, and quota status.
 * Used by Electron Client to determine Managed Mode limits.
 */
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        // Handle V1 vs V2 Schema compatibility
        // V2: access.planId, usage.quotaSecondsUsed
        // V1: plan, quotaSecondsUsed (fallback)
        const planId = userData.access?.planId || userData.plan || 'free';
        const usageUsed = userData.usage?.quotaSecondsUsed || userData.quotaSecondsUsed || 0;

        // Use getPlanConfig to properly resolve aliases (e.g., sprint_30d -> pro)
        const planConfig = getPlanConfig(planId);

        const quotaLimit = planConfig.quotaSecondsMonth;
        // Remaining cannot be negative
        const quotaRemaining = Math.max(0, quotaLimit - usageUsed);

        res.json({
            uid,
            plan: {
                id: planId,
                name: planConfig.name,
                status: userData.access?.accessStatus || 'active',
                periodEnd: userData.billing?.currentPeriodEnd || null,
                features: userData.access?.features || {},
            },
            quota: {
                limit: quotaLimit,
                used: usageUsed,
                remaining: quotaRemaining,
                resetAt: userData.usage?.quotaResetAt || null,
            },
            config: {
                maxSessionDuration: planConfig.sessionMaxDuration,
                concurrencyLimit: planConfig.concurrencyLimit,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
