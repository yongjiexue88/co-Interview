const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { PLANS } = require('../config/stripe');
const { rateLimiter } = require('../config/redis');
const { PaymentRequiredError, ForbiddenError, QuotaExceededError, ConcurrencyLimitError } = require('../middleware/errorHandler');

/**
 * POST /v1/realtime/session
 * Mint ephemeral session credentials for Gemini Live
 */
router.post('/session', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { model = 'gemini-2.5-flash-native-audio-preview', client_version, platform } = req.body;

        // 1. Rate limit check
        const allowed = await rateLimiter.checkLimit(`rate:session_mint:${uid}`, 10, 60);
        if (!allowed) {
            throw new QuotaExceededError('Too many session requests. Please wait a moment.');
        }

        // 2. Get user data
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new ForbiddenError('User not found');
        }

        const user = userDoc.data();
        const planConfig = PLANS[user.plan] || PLANS.free;

        // 3. Check subscription status
        if (user.status !== 'active' && user.status !== 'trialing') {
            throw new PaymentRequiredError('Your subscription is not active. Please update your payment method.');
        }

        // 4. Check quota
        const quotaRemaining = planConfig.quotaSecondsMonth - (user.quotaSecondsUsed || 0);
        if (quotaRemaining <= 0) {
            throw new QuotaExceededError('Monthly quota exceeded. Please upgrade your plan or wait for quota reset.');
        }

        // 5. Check concurrency (if Redis available)
        const existingSession = await rateLimiter.getLock(`active_session:${uid}`);
        if (existingSession && planConfig.concurrencyLimit <= 1) {
            throw new ConcurrencyLimitError('You already have an active session. Please end it first.');
        }

        // 6. Create session
        const sessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
        const expiresAt = new Date(Date.now() + planConfig.sessionMaxDuration * 1000);

        const session = {
            userId: uid,
            model,
            clientVersion: client_version,
            platform,
            startedAt: new Date(),
            expiresAt,
            endedAt: null,
            durationSeconds: 0,
            status: 'active',
        };

        await db.collection('sessions').doc(sessionId).set(session);

        // 7. Set concurrency lock (TTL = session max duration + 1 minute buffer)
        await rateLimiter.setLock(`active_session:${uid}`, sessionId, planConfig.sessionMaxDuration + 60);

        // 8. Return credentials
        res.json({
            session_id: sessionId,
            provider: 'gemini',
            model,
            token: process.env.GEMINI_MASTER_API_KEY,
            expires_at: Math.floor(expiresAt.getTime() / 1000),
            max_duration_sec: planConfig.sessionMaxDuration,
            quota_remaining_seconds: quotaRemaining,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /v1/realtime/session/:sessionId/end
 * End session and record usage
 */
router.post('/session/:sessionId/end', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { sessionId } = req.params;
        const { duration_seconds, reason = 'user_ended' } = req.body;

        // 1. Get session
        const sessionRef = db.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionDoc.data();

        // 2. Verify ownership
        if (session.userId !== uid) {
            return res.status(403).json({ error: 'Not authorized to end this session' });
        }

        // 3. Update session
        await sessionRef.update({
            endedAt: new Date(),
            durationSeconds: duration_seconds,
            status: 'ended',
            endReason: reason,
        });

        // 4. Update user quota
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const user = userDoc.data();
        const planConfig = PLANS[user.plan] || PLANS.free;

        const newQuotaUsed = (user.quotaSecondsUsed || 0) + duration_seconds;
        await userRef.update({
            quotaSecondsUsed: newQuotaUsed,
        });

        // 5. Release concurrency lock
        await rateLimiter.deleteLock(`active_session:${uid}`);

        // 6. Return response
        res.json({
            session_id: sessionId,
            duration_seconds,
            quota_remaining_seconds: planConfig.quotaSecondsMonth - newQuotaUsed,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /v1/realtime/heartbeat
 * Keep session alive, check quota mid-session
 */
router.post('/heartbeat', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { session_id, elapsed_seconds } = req.body;

        // Get user and check quota
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const user = userDoc.data();
        const planConfig = PLANS[user.plan] || PLANS.free;

        const quotaRemaining = planConfig.quotaSecondsMonth - (user.quotaSecondsUsed || 0) - elapsed_seconds;

        if (quotaRemaining <= 0) {
            return res.status(402).json({
                continue: false,
                reason: 'quota_exceeded',
                message: "You've used all your minutes this month. Upgrade to continue.",
            });
        }

        // Extend session lock
        await rateLimiter.setLock(`active_session:${uid}`, session_id, planConfig.sessionMaxDuration + 60);

        res.json({
            continue: true,
            quota_remaining_seconds: quotaRemaining,
            extend_until: Math.floor(Date.now() / 1000) + planConfig.sessionMaxDuration,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
