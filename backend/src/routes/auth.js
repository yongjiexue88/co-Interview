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
                features: PLANS.free.features,
            };
            await userRef.set(newUser);
            userDoc = await userRef.get();
        }

        const userData = userDoc.data();

        // Check if quota needs reset (new month)
        if (new Date() > userData.quotaResetAt?.toDate()) {
            await userRef.update({
                quotaSecondsUsed: 0,
                quotaResetAt: getNextMonthStart(),
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
            features: planConfig.features,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /v1/auth/google
 * Initiate Google OAuth 2.0 flow
 */
router.get('/google', (req, res) => {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'select_account',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /v1/auth/google/callback
 * Handle Google OAuth callback, mint custom token, and redirect to Electron
 */
router.get('/google/callback', async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) {
            throw new Error('No code provided');
        }

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, sub: googleUid, name, picture } = payload;

        // Get or Create Firebase User
        const { auth: adminAuth, db } = require('../config/firebase'); // Re-import to ensure admin context

        let firebaseUser;
        try {
            firebaseUser = await adminAuth.getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Create new user
                firebaseUser = await adminAuth.createUser({
                    email,
                    displayName: name,
                    photoURL: picture,
                    emailVerified: true,
                });
            } else {
                throw error;
            }
        }

        // Mint Custom Token
        const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

        // Ensure user document exists (sync with /verify logic)
        const userRef = db.collection('users').doc(firebaseUser.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            const { PLANS } = require('../config/stripe');
            const newUser = {
                email,
                createdAt: new Date(),
                plan: 'free',
                status: 'active',
                quotaSecondsMonth: PLANS.free.quotaSecondsMonth,
                quotaSecondsUsed: 0,
                // Helper needed or copy logic
                quotaResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                concurrencyLimit: PLANS.free.concurrencyLimit,
                features: PLANS.free.features,
            };
            await userRef.set(newUser);
        }

        // Build the Electron protocol URL
        const redirectUrl = new URL('co-interview://auth-callback');
        redirectUrl.searchParams.set('token', customToken);
        redirectUrl.searchParams.set('uid', firebaseUser.uid);
        redirectUrl.searchParams.set('email', email);
        redirectUrl.searchParams.set('name', name);
        if (picture) redirectUrl.searchParams.set('photo', picture);

        // Serve an HTML page that redirects to Electron and shows success message
        // This solves the browser "stuck" issue after custom protocol redirect
        const successHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Login Successful</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 40px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #FACC15 0%, #EAB308 100%);
            border-radius: 20px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .logo svg {
            width: 48px;
            height: 48px;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 12px;
            color: #22c55e;
        }
        p {
            color: #9ca3af;
            font-size: 16px;
            margin-bottom: 24px;
        }
        .hint {
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2">
                <path d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1>✓ Login Successful!</h1>
        <p>You can now return to the Co-Interview app.</p>
        <p class="hint">This tab will close automatically...</p>
    </div>
    <script>
        // Redirect to Electron app
        window.location.href = '${redirectUrl.toString()}';
        // Try to close the tab after a short delay
        setTimeout(function() {
            window.close();
        }, 2000);
    </script>
</body>
</html>
        `;
        res.send(successHtml);
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        // Show error page
        const errorHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Login Failed</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container { text-align: center; padding: 40px; }
        h1 { color: #ef4444; }
        p { color: #9ca3af; }
        a { color: #FACC15; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Login Failed</h1>
        <p>${error.message}</p>
        <p><a href="javascript:window.close()">Close this tab</a> and try again.</p>
    </div>
</body>
</html>
        `;
        res.status(500).send(errorHtml);
    }
});

/**
 * POST /v1/auth/exchange
 * Exchange an ID Token (from client login) for a Custom Token (for Electron sign-in)
 */
router.post('/exchange', authMiddleware, async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { auth: adminAuth } = require('../config/firebase');

        // Mint Custom Token
        const customToken = await adminAuth.createCustomToken(uid);

        res.json({ custom_token: customToken });
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
