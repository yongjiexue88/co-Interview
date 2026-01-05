const request = require('supertest');
const express = require('express');
const adminRouter = require('../../src/routes/admin');
const { auth: adminAuth, db } = require('../../src/config/firebase');

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
    });
});
