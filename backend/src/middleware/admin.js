const { db } = require('../config/firebase');

// Duplicated from frontend/src/constants.ts to keep backend independent
const ADMIN_EMAILS = ['yongjiexue88@gmail.com', 'xue515953749@gmail.com'];

/**
 * Middleware to ensure the user is an Admin.
 * Must be placed AFTER authMiddleware.
 */
async function adminMiddleware(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
        }

        const { email, uid } = req.user;

        // 1. Check Hardcoded Emails (Fastest)
        if (ADMIN_EMAILS.includes(email)) {
            req.user.isAdmin = true;
            return next();
        }

        // 2. Check Firestore Role (Future-proof)
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            req.user.isAdmin = true;
            return next();
        }

        // 3. Fallback: Forbidden
        console.warn(`[Admin Attempt Blocked] User: ${email} (${uid}) tried to access admin route.`);
        return res.status(403).json({ error: 'Forbidden', message: 'Access denied. Admin privileges required.' });
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to verify admin status' });
    }
}

module.exports = adminMiddleware;
