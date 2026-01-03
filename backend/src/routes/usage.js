const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { PLANS } = require('../config/stripe');

/**
 * GET /v1/usage
 * Get current usage stats for the user
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;

        // Get user data
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userDoc.data();
        const planConfig = PLANS[user.plan] || PLANS.free;

        // Get session count for this month
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const sessionsSnapshot = await db.collection('sessions').where('userId', '==', uid).where('startedAt', '>=', monthStart).get();

        const sessions = sessionsSnapshot.docs.map(doc => doc.data());
        const totalDuration = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
        const avgDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;

        // Format period
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        res.json({
            period,
            quota_total_seconds: planConfig.quotaSecondsMonth,
            quota_used_seconds: user.quotaSecondsUsed || 0,
            quota_remaining_seconds: planConfig.quotaSecondsMonth - (user.quotaSecondsUsed || 0),
            session_count: sessions.length,
            avg_session_seconds: avgDuration,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
