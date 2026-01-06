const request = require('supertest');
const express = require('express');
const adminRouter = require('../../src/routes/admin');
const { auth: adminAuth, db } = require('../../src/config/firebase');
const { rateLimiter } = require('../../src/config/redis');

// Mock dependencies
jest.mock('../../src/config/firebase', () => ({
    auth: {
        updateUser: jest.fn(),
        createUser: jest.fn(),
    },
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../../src/config/redis', () => ({
    rateLimiter: {
        deleteLock: jest.fn(),
    },
}));

jest.mock('../../src/config/stripe', () => ({
    PLANS: {
        free: { name: 'Free', quotaSecondsMonth: 3600, sessionMaxDuration: 1800 },
        pro: { name: 'Pro', quotaSecondsMonth: 36000, sessionMaxDuration: 7200 },
    },
}));

// Mock middlewares
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'admin-uid', email: 'admin@example.com', isAdmin: true };
    next();
});

jest.mock('../../src/middleware/admin', () => (req, res, next) => {
    next();
});

const app = express();
app.use(express.json());
app.use('/api/v1/admin', adminRouter);

describe('Admin Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/admin/users', () => {
        it('should list users', async () => {
            const mockUsers = [
                { id: 'u1', data: () => ({ email: 'u1@ex.com', createdAt: { toDate: () => new Date() } }) },
                { id: 'u2', data: () => ({ email: 'u2@ex.com' }) }
            ];
            const mockSnapshot = {
                forEach: (cb) => mockUsers.forEach(cb)
            };
            const mockQuery = {
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSnapshot)
            };
            db.collection.mockReturnValue(mockQuery);

            const res = await request(app).get('/api/v1/admin/users').query({ limit: 10 });
            expect(res.statusCode).toEqual(200);
            expect(res.body.users).toHaveLength(2);
            expect(db.collection).toHaveBeenCalledWith('users');
        });

        it('should filter users in memory if search is provided', async () => {
            const mockUsers = [
                { id: 'u1', data: () => ({ email: 'match@ex.com' }) },
                { id: 'u2', data: () => ({ email: 'other@ex.com' }) }
            ];
            const mockSnapshot = {
                forEach: (cb) => mockUsers.forEach(cb)
            };
            db.collection.mockReturnValue({
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSnapshot)
            });

            const res = await request(app).get('/api/v1/admin/users').query({ search: 'match' });

            expect(res.body.users).toHaveLength(1);
            expect(res.body.users[0].email).toBe('match@ex.com');
        });

        it('should handle errors gracefully', async () => {
            db.collection.mockReturnValue({
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockRejectedValue(new Error('DB Error'))
            });
            const res = await request(app).get('/api/v1/admin/users');
            expect(res.statusCode).toEqual(500);
            expect(res.body.error).toBe('Failed to list users');
        });
    });

    describe('GET /api/v1/admin/users/:id', () => {
        it('should return user details', async () => {
            const mockUser = { email: 'u1@ex.com', createdAt: { toDate: () => new Date() } };
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser, id: 'u1' })
                })
            });

            const res = await request(app).get('/api/v1/admin/users/u1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe('u1@ex.com');
        });

        it('should return 404 if user not found', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: false })
                })
            });

            const res = await request(app).get('/api/v1/admin/users/ghost');
            expect(res.statusCode).toEqual(404);
        });

        it('should handle errors', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockRejectedValue(new Error('DB Error'))
                })
            });
            const res = await request(app).get('/api/v1/admin/users/u1');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('PATCH /api/v1/admin/users/:id', () => {
        it('should update user fields', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(true);
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({ update: mockUpdate })
            });

            const res = await request(app)
                .patch('/api/v1/admin/users/u1')
                .send({ plan: 'pro', quotaSecondsMonth: 5000 });

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith({ plan: 'pro', quotaSecondsMonth: 5000 });
        });

        it('should return 400 if no fields provided', async () => {
            const res = await request(app).patch('/api/v1/admin/users/u1').send({});
            expect(res.statusCode).toEqual(400);
        });

        it('should handle errors', async () => {
            const mockUpdate = jest.fn().mockRejectedValue(new Error('DB Error'));
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({ update: mockUpdate })
            });

            const res = await request(app)
                .patch('/api/v1/admin/users/u1')
                .send({ plan: 'pro' });

            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/admin/users/:id/disable', () => {
        it('should disable user in Auth and Firestore', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(true);
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({ update: mockUpdate })
            });
            adminAuth.updateUser.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/v1/admin/users/u1/disable')
                .send({ reason: 'testing' });

            expect(res.statusCode).toEqual(200);
            expect(adminAuth.updateUser).toHaveBeenCalledWith('u1', { disabled: true });
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'banned' }));
        });

        it('should handle errors', async () => {
            adminAuth.updateUser.mockRejectedValue(new Error('Auth Error'));
            const res = await request(app).post('/api/v1/admin/users/u1/disable');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/admin/users/:id/enable', () => {
        it('should enable user in Auth and Firestore', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(true);
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({ update: mockUpdate })
            });
            adminAuth.updateUser.mockResolvedValue(true);

            const res = await request(app).post('/api/v1/admin/users/u1/enable');

            expect(res.statusCode).toEqual(200);
            expect(adminAuth.updateUser).toHaveBeenCalledWith('u1', { disabled: false });
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
        });

        it('should handle errors', async () => {
            adminAuth.updateUser.mockRejectedValue(new Error('Auth Error'));
            const res = await request(app).post('/api/v1/admin/users/u1/enable');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/v1/admin/analytics', () => {
        it('should list analytics events', async () => {
            const mockEvents = [
                { id: 'e1', data: () => ({ type: 'login', createdAt: { toDate: () => new Date() } }) }
            ];
            const mockSnapshot = {
                forEach: (cb) => mockEvents.forEach(cb)
            };
            db.collection.mockReturnValue({
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSnapshot)
            });

            const res = await request(app).get('/api/v1/admin/analytics');

            expect(res.statusCode).toEqual(200);
            expect(res.body.events).toHaveLength(1);
        });

        it('should handle errors', async () => {
            db.collection.mockReturnValue({
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockRejectedValue(new Error('DB Error'))
            });
            const res = await request(app).get('/api/v1/admin/analytics');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/admin/users/seed-v2', () => {
        it('should create a V2 user with nested fields', async () => {
            const mockSet = jest.fn().mockResolvedValue(true);

            // Mock chain: db.collection("users").doc("uid").collection("devices").doc("devid").set(...)

            const mockDeviceRef = { set: mockSet };
            const mockDevicesCollection = { doc: jest.fn().mockReturnValue(mockDeviceRef) };

            const mockUserRef = {
                set: mockSet,
                collection: jest.fn().mockReturnValue(mockDevicesCollection)
            };

            const mockUsersCollection = {
                doc: jest.fn().mockReturnValue(mockUserRef)
            };

            db.collection.mockReturnValue(mockUsersCollection);

            adminAuth.createUser.mockResolvedValue({ uid: 'test-seed-uid' });

            const res = await request(app).post('/api/v1/admin/users/seed-v2').send({ email: 'seed@test.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe('seed@test.com');

            // Verify main user document structure
            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                profile: expect.objectContaining({ email: 'seed@test.com' }),
                meta: expect.objectContaining({ schemaVersion: 2 })
            }));

            // Verify subcollection call
            expect(mockUserRef.collection).toHaveBeenCalledWith('devices');
        });

        it('should handle user already exists in auth but proceed to overwrite in firestore', async () => {
            adminAuth.createUser.mockRejectedValue(new Error('User exists'));
            const mockSet = jest.fn().mockResolvedValue(true);
            const mockDeviceRef = { set: mockSet };
            const mockDevicesCollection = { doc: jest.fn().mockReturnValue(mockDeviceRef) };
            const mockUserRef = {
                set: mockSet,
                collection: jest.fn().mockReturnValue(mockDevicesCollection)
            };
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue(mockUserRef)
            });

            const res = await request(app).post('/api/v1/admin/users/seed-v2').send({ email: 'existing@test.com' });
            expect(res.statusCode).toEqual(200);
            expect(mockSet).toHaveBeenCalled();
        });

        it('should handle errors during seed', async () => {
            adminAuth.createUser.mockResolvedValue({ uid: 'test' });
            db.collection.mockReturnValue({
                doc: jest.fn().mockImplementation(() => { throw new Error('DB Error'); })
            });

            const res = await request(app).post('/api/v1/admin/users/seed-v2');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/v1/admin/sessions/active', () => {
        it('should list active sessions and enrich with user email', async () => {
            const mockSessions = [
                { id: 's1', data: () => ({ userId: 'u1', status: 'active', startedAt: { toDate: () => new Date() } }) }
            ];
            const mockSessionSnapshot = { docs: mockSessions };

            // Mock chain for sessions query
            const mockSessionsQuery = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSessionSnapshot)
            };

            // Mock user lookup
            const mockUserDoc = { exists: true, data: () => ({ profile: { email: 'u1@test.com' } }) };

            db.collection.mockImplementation((name) => {
                if (name === 'sessions') return mockSessionsQuery;
                if (name === 'users') return {
                    doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(mockUserDoc) })
                };
                return jest.fn();
            });

            const res = await request(app).get('/api/v1/admin/sessions/active');

            expect(res.statusCode).toEqual(200);
            expect(res.body.sessions).toHaveLength(1);
            expect(res.body.sessions[0].userEmail).toBe('u1@test.com');
        });

        it('should handle user lookup failure gracefully', async () => {
            const mockSessions = [
                { id: 's1', data: () => ({ userId: 'u1', status: 'active' }) }
            ];
            const mockSessionSnapshot = { docs: mockSessions };

            // Mock chain for sessions query
            const mockSessionsQuery = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSessionSnapshot)
            };

            db.collection.mockImplementation((name) => {
                if (name === 'sessions') return mockSessionsQuery;
                if (name === 'users') return {
                    doc: jest.fn().mockReturnValue({ get: jest.fn().mockRejectedValue(new Error('Fetch error')) })
                };
                return jest.fn();
            });

            const res = await request(app).get('/api/v1/admin/sessions/active');
            expect(res.statusCode).toEqual(200);
            expect(res.body.sessions[0].userEmail).toBe('Unknown');
        });

        it('should handle generic errors', async () => {
            db.collection.mockImplementation(() => {
                throw new Error('DB Error');
            });
            const res = await request(app).get('/api/v1/admin/sessions/active');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/admin/sessions/:sessionId/terminate', () => {
        it('should terminate an active session', async () => {
            const mockSession = { status: 'active', userId: 'u1', startedAt: { toDate: () => new Date(Date.now() - 10000) } };
            const mockUpdate = jest.fn().mockResolvedValue(true);
            const mockDoc = {
                get: jest.fn().mockResolvedValue({ exists: true, data: () => mockSession }),
                update: mockUpdate
            };

            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue(mockDoc)
            });

            const res = await request(app)
                .post('/api/v1/admin/sessions/s1/terminate')
                .send({ reason: 'violation' });

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'ended', endReason: 'violation' }));
            expect(rateLimiter.deleteLock).toHaveBeenCalledWith('active_session:u1');
        });

        it('should return 404 if session not found', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: false })
                })
            });
            const res = await request(app).post('/api/v1/admin/sessions/s1/terminate');
            expect(res.statusCode).toEqual(404);
        });

        it('should return 400 if session already ended', async () => {
            const mockSession = { status: 'ended' };
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => mockSession })
                })
            });
            const res = await request(app).post('/api/v1/admin/sessions/s1/terminate');
            expect(res.statusCode).toEqual(400);
        });

        it('should handle errors', async () => {
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).post('/api/v1/admin/sessions/s1/terminate');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/admin/users/:id/reset-quota', () => {
        it('should reset user quota', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(true);
            const mockDoc = {
                get: jest.fn().mockResolvedValue({ exists: true }),
                update: mockUpdate
            };

            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue(mockDoc)
            });

            const res = await request(app).post('/api/v1/admin/users/u1/reset-quota');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith({ 'usage.quotaSecondsUsed': 0 });
        });

        it('should return 404 if user not found', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: false })
                })
            });
            const res = await request(app).post('/api/v1/admin/users/u1/reset-quota');
            expect(res.statusCode).toEqual(404);
        });

        it('should handle errors', async () => {
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).post('/api/v1/admin/users/u1/reset-quota');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/v1/admin/users/:id/sessions', () => {
        it('should list sessions for a user', async () => {
            const mockSessions = [
                { id: 's1', data: () => ({ model: 'gemini-pro' }) }
            ];
            const mockSnapshot = {
                forEach: (cb) => mockSessions.forEach(cb)
            };
            const mockQuery = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSnapshot)
            };
            db.collection.mockReturnValue(mockQuery);

            const res = await request(app).get('/api/v1/admin/users/u1/sessions');
            expect(res.statusCode).toEqual(200);
            expect(res.body.sessions).toHaveLength(1);
        });

        it('should handle errors', async () => {
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).get('/api/v1/admin/users/u1/sessions');
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/v1/admin/system/health', () => {
        it('should return system health stats', async () => {
            process.env.GEMINI_MASTER_API_KEY = 'test-key';

            // Mock active sessions count
            const mockSessionsSnapshot = { size: 5 };
            const mockSessionsQuery = {
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockSessionsSnapshot)
            };

            // Mock users stats
            const mockUsers = [
                { data: () => ({ usage: { quotaSecondsUsed: 100 } }) },
                { data: () => ({ quotaSecondsUsed: 200 }) }
            ];
            const mockUsersSnapshot = {
                forEach: (cb) => mockUsers.forEach(cb)
            };
            const mockUsersQuery = {
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue(mockUsersSnapshot)
            };

            db.collection.mockImplementation((name) => {
                if (name === 'sessions') return mockSessionsQuery;
                if (name === 'users') return mockUsersQuery;
                return jest.fn();
            });

            const res = await request(app).get('/api/v1/admin/system/health');

            expect(res.statusCode).toEqual(200);
            expect(res.body.geminiKeyConfigured).toBe(true);
            expect(res.body.activeSessionsCount).toBe(5);
            expect(res.body.aggregateStats.totalQuotaUsedSeconds).toBe(300);
        });

        it('should handle errors', async () => {
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).get('/api/v1/admin/system/health');
            expect(res.statusCode).toEqual(500);
        });
    });
});
