const express = require('express');
const router = express.Router();
const { auth: adminAuth, db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/v1/admin/users
 * List users with pagination and search
 */
router.get('/users', async (req, res) => {
    try {
        const { limit = 20, search } = req.query;
        let query = db.collection('users').orderBy('createdAt', 'desc');

        // Note: Firestore search is limited. Use a proper search engine (Algolia/Typesense) for prod.
        // For now, if 'search' is provided, we might have to filter in memory or do a simple prefix match if feasible.
        // But since we want to search by email, and Firestore doesn't do "contains", we'll just return latest users
        // and let frontend search if the list is small, or use exact match.
        // Optimization: For this MVP, we will fetch users and if search exists, we assume it's exact email or we scan.

        // Since we are using firebase-admin to list users for authentication management (disable),
        // we might want to list from Auth or Firestore.
        // User data (plan, status) is in Firestore.

        const snapshot = await query.limit(parseInt(limit)).get();

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Basic search filtering (in-memory for MVP)
            if (search && !data.email?.toLowerCase().includes(search.toLowerCase())) {
                return;
            }
            users.push({
                id: doc.id,
                ...data,
                // Convert timestamps to ISO strings
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                quotaResetAt: data.quotaResetAt?.toDate?.()?.toISOString() || data.quotaResetAt,
            });
        });

        res.json({
            users,
            nextPageToken: null, // Implement proper pagination if needed
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

/**
 * GET /api/v1/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const data = userDoc.data();
        // Enrich with Auth data if possible (e.g. disabled status?)
        // We track status in Firestore too ('active' | 'banned').

        res.json({
            id: userDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * PATCH /api/v1/admin/users/:id
 * Update user plan or details
 */
router.patch('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, quotaSecondsMonth, concurrencyLimit } = req.body;

        const updateData = {};
        if (plan) updateData.plan = plan;
        if (quotaSecondsMonth !== undefined) updateData.quotaSecondsMonth = quotaSecondsMonth;
        if (concurrencyLimit !== undefined) updateData.concurrencyLimit = concurrencyLimit;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        await db.collection('users').doc(id).update(updateData);
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * POST /api/v1/admin/users/:id/disable
 * Disable a user (Ban)
 */
router.post('/users/:id/disable', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // 1. Disable in Firebase Auth
        await adminAuth.updateUser(id, {
            disabled: true,
        });

        // 2. Mark as banned in Firestore
        await db
            .collection('users')
            .doc(id)
            .update({
                status: 'banned',
                banReason: reason || 'Admin action',
                bannedAt: new Date(),
            });

        console.log(`[Admin Action] User ${id} disabled by ${req.user.email}`);
        res.json({ success: true, message: 'User disabled successfully' });
    } catch (error) {
        console.error('Disable user error:', error);
        res.status(500).json({ error: 'Failed to disable user' });
    }
});

/**
 * POST /api/v1/admin/users/:id/enable
 * Re-enable a user
 */
router.post('/users/:id/enable', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Enable in Firebase Auth
        await adminAuth.updateUser(id, {
            disabled: false,
        });

        // 2. Mark as active in Firestore
        await db.collection('users').doc(id).update({
            status: 'active',
            banReason: null,
            bannedAt: null,
        });

        console.log(`[Admin Action] User ${id} enabled by ${req.user.email}`);
        res.json({ success: true, message: 'User enabled successfully' });
    } catch (error) {
        console.error('Enable user error:', error);
        res.status(500).json({ error: 'Failed to enable user' });
    }
});

/**
 * GET /api/v1/admin/analytics
 * Get analytics events for dashboard
 */
router.get('/analytics', async (req, res) => {
    try {
        const { limit = 1000 } = req.query;
        // Fetch last N events
        const snapshot = await db.collection('analytics_events').orderBy('createdAt', 'desc').limit(parseInt(limit)).get();

        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            events.push({
                id: doc.id,
                ...data,
                // Convert timestamp to ISO string for frontend
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            });
        });

        res.json({ events });
    } catch (error) {
        console.error('Fetch analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * POST /api/v1/admin/users/seed-v2
 * Create a dummy user with full V2 Schema data for testing
 */
router.post('/users/seed-v2', async (req, res) => {
    try {
        const { email } = req.body;
        const testEmail = email || `test_v2_${Date.now()}@example.com`;
        const testUid = `test_v2_${Date.now()}`;

        // 1. Create in Auth (if not exists)
        try {
            await adminAuth.createUser({
                uid: testUid,
                email: testEmail,
                displayName: 'Test User V2',
                emailVerified: true,
            });
        } catch (e) {
            console.log('User might already exist in Auth, proceeding to overwrite Firestore...');
        }

        // 2. Create V2 Data in Firestore
        const v2Data = {
            profile: {
                email: testEmail,
                displayName: 'Test User V2',
                photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                createdAt: new Date(),
                lastLoginAt: new Date(),
                locale: 'en-US',
                timezone: 'America/Los_Angeles',
            },
            preferences: {
                onboarding: {
                    userPersona: 'Senior Developer',
                    userRole: 'Interviewer',
                    userExperience: '5+ Years',
                    userReferral: 'LinkedIn',
                },
                tailor: {
                    outputLanguage: 'Spanish',
                    programmingLanguage: 'Rust',
                    audioLanguage: 'es-MX',
                    customPrompt: 'Be very critical and succinct.',
                },
            },
            access: {
                planId: 'pro',
                accessStatus: 'active',
                concurrencyLimit: 5,
                features: {
                    basic_interview_help: true,
                    advanced_metrics: true,
                    unlimited_history: true,
                },
            },
            usage: {
                quotaSecondsMonth: 36000,
                quotaSecondsUsed: 1250,
                quotaResetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Next month
            },
            billing: {
                stripeCustomerId: 'cus_test_123',
                subscriptionId: 'sub_test_456',
                billingStatus: 'active',
            },
            security: {
                lastLoginIp: '192.168.1.100',
                lastLoginUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
            },
            devicesSummary: {
                deviceCount: 2,
                lastPlatform: 'macOS 14.5',
                lastSeenAt: new Date(),
            },
            meta: {
                schemaVersion: 2,
                updatedAt: new Date(),
                sourceOfTruth: 'admin_seed',
            },
        };

        const userRef = db.collection('users').doc(testUid);
        await userRef.set(v2Data);

        // Add dummy devices
        await userRef
            .collection('devices')
            .doc('device_1')
            .set({
                platform: 'macOS 14.5',
                appVersion: '1.0.0',
                firstSeenAt: new Date(Date.now() - 86400000 * 10),
                lastSeenAt: new Date(),
                lastIp: '192.168.1.100',
            });

        await userRef
            .collection('devices')
            .doc('device_2')
            .set({
                platform: 'Windows 11',
                appVersion: '1.0.0',
                firstSeenAt: new Date(Date.now() - 86400000 * 5),
                lastSeenAt: new Date(Date.now() - 86400000 * 2),
                lastIp: '10.0.0.50',
            });

        res.json({ success: true, message: 'Seeded V2 user', uid: testUid, email: testEmail });
    } catch (error) {
        console.error('Seed V2 error:', error);
        res.status(500).json({ error: 'Failed to seed user' });
    }
});

module.exports = router;
