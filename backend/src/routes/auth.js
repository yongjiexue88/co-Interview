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
        // access_type: 'offline', // Removing offline access to see if it fixes invalid_grant (we don't need refresh token here)
        prompt: 'select_account',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /v1/auth/google/callback
 * Handle Google OAuth callback, mint custom token, and redirect to Electron
 */
router.get('/google/callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('No code provided');
    }

    // Serve a loading page that POSTs the code to the backend
    // This prevents browser pre-fetching from burning the auth code
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Processing Login...</title>
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
        .loader {
            border: 4px solid #333;
            border-top: 4px solid #FACC15;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        p { color: #9ca3af; }
    </style>
</head>
<body>
    <div class="loader"></div>
    <p>Completing secure sign-in...</p>
    <script>
        async function completeLogin() {
            try {
                const response = await fetch('/api/v1/auth/google/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: '${code}' })
                });
                
                const data = await response.json();
                
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                    setTimeout(() => window.close(), 2000);
                } else {
                    document.body.innerHTML = '<h1 style="color:red">Login Failed</h1><p>' + (data.error || 'Unknown error') + '</p>';
                }
            } catch (err) {
                document.body.innerHTML = '<h1 style="color:red">Network Error</h1><p>' + err.message + '</p>';
            }
        }
        // Run immediately
        completeLogin();
    </script>
</body>
</html>
    `;
    res.send(html);
});

/**
 * POST /v1/auth/google/exchange
 * Actual token exchange logic, moved here to be effectively "idempotent" from browser perspective
 * (only the active tab will execute the POST)
 */
router.post('/google/exchange', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) throw new Error('No code provided');

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

        console.log('[Auth Exchange] Exchanging code:', code.substring(0, 10) + '...');

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload; // sub is googleUid

        // Get or Create Firebase User
        const { auth: adminAuth, db } = require('../config/firebase');

        let firebaseUser;
        try {
            firebaseUser = await adminAuth.getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
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

        // Ensure user document exists
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
                quotaResetAt: getNextMonthStart(),
                concurrencyLimit: PLANS.free.concurrencyLimit,
                features: PLANS.free.features,
            };
            await userRef.set(newUser);
        }

        // Build Redirect URL
        const redirectUrl = new URL('co-interview://auth-callback');
        redirectUrl.searchParams.set('token', customToken);
        redirectUrl.searchParams.set('uid', firebaseUser.uid);
        redirectUrl.searchParams.set('email', email);
        redirectUrl.searchParams.set('name', name);
        if (picture) redirectUrl.searchParams.set('photo', picture);

        res.json({ redirectUrl: redirectUrl.toString() });

    } catch (error) {
        console.error('Auth Exchange Error:', error);
        res.status(400).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
