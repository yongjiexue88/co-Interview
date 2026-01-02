const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { PLANS } = require('../config/stripe');

/**
 * POST /v1/auth/verify
 * Verify Firebase token and return user entitlements
 */
router.post('/verify', authMiddleware, async (req, res, next) => {
    try {
        const { uid, email } = req.user;

        // Get or create user document
        const userRef = db.collection('users').doc(uid);
        let userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create new user with free plan
            const newUser = {
                email,
                createdAt: new Date(),
                plan: 'free',
                status: 'active',
                quotaSecondsMonth: PLANS.free.quotaSecondsMonth,
                quotaSecondsUsed: 0,
                quotaResetAt: getNextMonthStart(),
                concurrencyLimit: PLANS.free.concurrencyLimit,
                features: PLANS.free.features
            };
            await userRef.set(newUser);
            userDoc = await userRef.get();
        }

        const userData = userDoc.data();

        // Check if quota needs reset (new month)
        if (new Date() > userData.quotaResetAt?.toDate()) {
            await userRef.update({
                quotaSecondsUsed: 0,
                quotaResetAt: getNextMonthStart()
            });
            userData.quotaSecondsUsed = 0;
        }

        const planConfig = PLANS[userData.plan] || PLANS.free;

        res.json({
            user_id: uid,
            email: userData.email,
            plan: userData.plan,
            status: userData.status,
            quota_remaining_seconds: planConfig.quotaSecondsMonth - userData.quotaSecondsUsed,
            features: planConfig.features
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get the first day of next month
 */
function getNextMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

module.exports = router;
