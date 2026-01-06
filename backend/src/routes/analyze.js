const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const authMiddleware = require('../middleware/auth');
const { db } = require('../config/firebase');
const { PLANS } = require('../config/stripe');

// Initialize Gemini client with master key (server-side only)
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_MASTER_API_KEY });

// Cost per screenshot in "equivalent seconds" for quota tracking
const SCREENSHOT_COST_SECONDS = 30;

/**
 * POST /v1/analyze/screenshot
 * Proxy screenshot analysis through backend (master key stays server-side)
 */
router.post('/screenshot', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { image, prompt, model = 'gemini-2.5-flash' } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Missing image data' });
        }

        // 1. Check user quota
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(403).json({ error: 'User not found' });
        }

        const user = userDoc.data();
        const planId = user.access?.planId || user.plan || 'free';
        const planConfig = PLANS[planId] || PLANS.free;

        const quotaSecondsUsed = user.usage?.quotaSecondsUsed || 0;
        const quotaRemaining = planConfig.quotaSecondsMonth - quotaSecondsUsed;

        if (quotaRemaining < SCREENSHOT_COST_SECONDS) {
            return res.status(402).json({
                error: 'Insufficient quota for screenshot analysis',
                quota_remaining_seconds: quotaRemaining,
            });
        }

        // 2. Call Gemini with master key
        const contents = [
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: image,
                },
            },
            { text: prompt || 'Analyze this image and provide helpful insights.' },
        ];

        const response = await geminiClient.models.generateContent({
            model: model,
            contents: contents,
        });

        const text = response.text || '';

        // 3. Deduct usage (fixed cost per screenshot)
        await userRef.update({
            'usage.quotaSecondsUsed': quotaSecondsUsed + SCREENSHOT_COST_SECONDS,
        });

        // 4. Return result
        res.json({
            success: true,
            text: text,
            model: model,
            quota_charged_seconds: SCREENSHOT_COST_SECONDS,
            quota_remaining_seconds: quotaRemaining - SCREENSHOT_COST_SECONDS,
        });
    } catch (error) {
        console.error('Screenshot analysis error:', error);
        next(error);
    }
});

module.exports = router;
