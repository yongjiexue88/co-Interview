const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Adds `req.user` with { uid, email } on success
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
        };
        next();
    } catch (error) {
        console.error('Auth verification failed:', error.message);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
    }
}

module.exports = authMiddleware;
