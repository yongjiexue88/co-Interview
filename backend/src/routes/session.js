const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const { admin, db } = require('../config/firebase');
const { PLANS } = require('../config/stripe');
const { rateLimiter } = require('../config/redis');
const { PaymentRequiredError, ForbiddenError, QuotaExceededError, ConcurrencyLimitError } = require('../middleware/errorHandler');

// Helper to get next month start for reset
const getNextMonthStart = (date) => {
    const d = new Date(date);
    // Set to 1st of next month, 00:00:00
    return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1));
};

/**
 * POST /v1/realtime/session
 * Mint ephemeral session credentials for Gemini Live
 * Implements Server-Side Quota & Concurrency
 */
router.post('/session', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { model = 'gemini-2.5-flash-native-audio-preview', client_version, platform } = req.body;

        // 1. Rate limit check (prevents abusive spamming of start button)
        const allowed = await rateLimiter.checkLimit(`rate:session_mint:${uid}`, 10, 60);
        if (!allowed) {
            throw new QuotaExceededError('Too many session requests. Please wait a moment.');
        }

        // 2. Concurrency Check (Reject New)
        // Check if there is an active session lock for this user
        const existingSessionId = await rateLimiter.getLock(`active_session:${uid}`);

        // Get user data for plan details
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new ForbiddenError('User not found');
        }

        const user = userDoc.data();
        // Schema V2: user.access.planId (fallback to user.plan for migration)
        const planId = user.access?.planId || user.plan || 'free';
        const planConfig = PLANS[planId] || PLANS.free;

        // Enforce concurrency if limit is 1 (standard)
        if (existingSessionId && planConfig.concurrencyLimit <= 1) {
            throw new ConcurrencyLimitError('You already have an active session. Please end it first.');
        }

        // 3. Lazy Quota Reset Check
        // Schema V2: user.usage.quotaSecondsUsed, user.usage.quotaResetAt
        let usage = user.usage || { quotaSecondsUsed: 0, quotaResetAt: null };
        const now = new Date();

        let quotaSecondsUsed = usage.quotaSecondsUsed || 0;
        let quotaResetAt = usage.quotaResetAt ? (usage.quotaResetAt.toDate ? usage.quotaResetAt.toDate() : new Date(usage.quotaResetAt)) : null;

        let needsUpdate = false;

        // If no reset date, set it to next month (first run or migration)
        if (!quotaResetAt) {
            quotaResetAt = getNextMonthStart(now);
            needsUpdate = true;
        }
        // If current date is past the reset date, reset usage!
        else if (now >= quotaResetAt) {
            quotaSecondsUsed = 0;
            quotaResetAt = getNextMonthStart(now);
            needsUpdate = true;
        }

        if (needsUpdate) {
            // Update user doc with new reset info
            await userRef.update({
                'usage.quotaSecondsUsed': quotaSecondsUsed,
                'usage.quotaResetAt': quotaResetAt
            });
        }

        // 4. Check Subscription Status
        if (user.status !== 'active' && user.status !== 'trialing') {
            throw new PaymentRequiredError('Your subscription is not active. Please update your payment method.');
        }

        // 5. Check Quota Remaining
        // Lifetime plans might have huge quotaSecondsMonth
        const quotaRemaining = planConfig.quotaSecondsMonth - quotaSecondsUsed;
        if (quotaRemaining <= 0) {
            throw new QuotaExceededError('Monthly quota exceeded. Please upgrade your plan or wait for quota reset.');
        }

        // 6. Create Session
        const sessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
        const expiresAt = new Date(Date.now() + planConfig.sessionMaxDuration * 1000);

        const session = {
            userId: uid,
            model,
            clientVersion: client_version,
            platform,
            // SERVER-SIDE TRUTH: We set the start time here.
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastHeartbeatAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt,
            endedAt: null,
            durationSeconds: 0,
            status: 'active',
            planIdAtStart: planId, // Track plan at start for audits
        };

        await db.collection('sessions').doc(sessionId).set(session);

        // 7. Set Concurrency Lock in Redis
        // TTL = Max Duration + buffer (e.g. 2 minutes)
        // If client crashes, lock expires after TTL, allowing new session.
        await rateLimiter.setLock(`active_session:${uid}`, sessionId, planConfig.sessionMaxDuration + 60);

        // 8. Return Credentials
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
 * End session and record usage (Transactional)
 */
router.post('/session/:sessionId/end', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { sessionId } = req.params;
        const { reason = 'user_ended' } = req.body;
        // NOTE: We ignore req.body.duration_seconds. Server calculates it.

        const sessionRef = db.collection('sessions').doc(sessionId);
        const userRef = db.collection('users').doc(uid);

        // 1. Transaction for atomic read-calc-update
        const result = await db.runTransaction(async (t) => {
            const sessionDoc = await t.get(sessionRef);
            const userDoc = await t.get(userRef);

            if (!sessionDoc.exists) {
                throw { status: 404, message: 'Session not found' };
            }

            const session = sessionDoc.data();
            if (session.userId !== uid) {
                throw { status: 403, message: 'Not authorized' };
            }

            // If already counted, don't double charge
            if (session.counted) {
                return {
                    alreadyEnded: true,
                    durationSeconds: session.durationSeconds,
                    chargedSeconds: session.chargedSeconds || 0,
                    quotaRemaining: 0 // rough estimate or fetch real
                };
            }

            // Calculate Duration using Server Timestamps
            // We use 'now' as the end time.
            // Note: session.startedAt is a Firestore Timestamp.
            const now = admin.firestore.Timestamp.now();
            const startedAt = session.startedAt || now; // fallback if missing
            const diffMs = now.toMillis() - startedAt.toMillis();
            const realDuration = Math.floor(diffMs / 1000);

            // Calculate Charge
            const user = userDoc.data();
            const planId = user.access?.planId || user.plan || 'free';
            const planConfig = PLANS[planId] || PLANS.free;

            const usage = user.usage || { quotaSecondsUsed: 0 };
            const currentUsed = usage.quotaSecondsUsed || 0;
            const totalQuota = planConfig.quotaSecondsMonth;

            const quotaRemainingBeforeEnd = Math.max(0, totalQuota - currentUsed);

            // CAPPNG LOGIC: Charge min(real, remaining)
            // If they had 10s left and used 60s, we charge 10s.
            const chargedSeconds = Math.min(realDuration, quotaRemainingBeforeEnd);

            const newQuotaUsed = currentUsed + chargedSeconds;

            // Updates
            t.update(sessionRef, {
                endedAt: now,
                durationSeconds: realDuration,
                chargedSeconds: chargedSeconds,
                status: 'ended',
                endReason: reason,
                counted: true
            });

            t.update(userRef, {
                'usage.quotaSecondsUsed': newQuotaUsed
            });

            return {
                durationSeconds: realDuration,
                chargedSeconds: chargedSeconds,
                quotaRemaining: totalQuota - newQuotaUsed
            };
        });

        // 2. Release Lock
        await rateLimiter.deleteLock(`active_session:${uid}`);

        // 3. Response
        res.json({
            session_id: sessionId,
            duration_seconds: result.durationSeconds,
            charged_seconds: result.chargedSeconds,
            quota_remaining_seconds: result.quotaRemaining,
            message: result.alreadyEnded ? 'Session already ended' : 'Session ended successfully'
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
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
        const { session_id } = req.body; // Ignore elapsed_seconds from client

        const sessionRef = db.collection('sessions').doc(session_id);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const session = sessionDoc.data();

        if (session.userId !== uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (session.status === 'ended') {
            return res.json({ continue: false, reason: 'session_ended' });
        }

        // 1. Calculate Server-Side Elapsed
        const nowTimestamp = admin.firestore.Timestamp.now();
        const startedAt = session.startedAt;
        if (!startedAt) {
            // Fallback if startedAt missing (legacy?)
            return res.json({ continue: true });
        }

        const elapsedMs = nowTimestamp.toMillis() - startedAt.toMillis();
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // 2. Check Quota
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const user = userDoc.data();
        const planId = user.access?.planId || user.plan || 'free';
        const planConfig = PLANS[planId] || PLANS.free;

        const currentUsed = user.usage?.quotaSecondsUsed || 0;
        const quotaRemaining = planConfig.quotaSecondsMonth - currentUsed - elapsedSeconds;

        if (quotaRemaining <= 0) {
            return res.status(402).json({
                continue: false,
                reason: 'quota_exceeded',
                message: "You've used all your minutes this month. Upgrade to continue.",
            });
        }

        // 3. Extend Lock (Heartbeat Refresh)
        // Reset the TTL to allow for sessionMaxDuration + buffer
        // This keeps the "seat" taken as long as heartbeat is active.
        await rateLimiter.setLock(`active_session:${uid}`, session_id, planConfig.sessionMaxDuration + 60);

        // 4. Update lastHeartbeatAt
        await sessionRef.update({
            lastHeartbeatAt: nowTimestamp
        });

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
