const request = require('supertest');
const express = require('express');
const authRouter = require('../../src/routes/auth');
const { auth: adminAuth, db } = require('../../src/config/firebase');

// Mock dependencies
jest.mock('../../src/config/firebase', () => ({
    auth: {
        verifyIdToken: jest.fn(),
        getUser: jest.fn(),
        getUserByEmail: jest.fn(),
        createUser: jest.fn(),
        createCustomToken: jest.fn(),
    },
    db: {
        collection: jest.fn(),
    },
}));

const mockOAuthClient = {
    generateAuthUrl: jest.fn().mockReturnValue('https://google.com/auth'),
    getToken: jest.fn(),
    setCredentials: jest.fn(),
    verifyIdToken: jest.fn(),
};

jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => mockOAuthClient),
}));

jest.mock('../../src/config/stripe', () => ({
    PLANS: {
        free: { quotaSecondsMonth: 3600, concurrencyLimit: 1, features: [] },
    },
}));

// Mock middleware
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid_token') {
        req.user = { uid: 'user123', email: 'test@example.com' };
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/verify', () => {
        it('should return user data for existing user', async () => {
            const mockUser = {
                email: 'test@example.com',
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 100,
                quotaResetAt: { toDate: () => new Date(Date.now() + 1000000) }
            };
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser })
                })
            });

            const res = await request(app)
                .post('/api/v1/auth/verify')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.quota_remaining_seconds).toBe(3500);
        });

        it('should create user if document does not exist', async () => {
            const mockUser = {
                email: 'test@example.com',
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 0,
                quotaResetAt: { toDate: () => new Date(Date.now() + 1000000) }
            };
            const mockSet = jest.fn().mockResolvedValue(true);
            const mockDoc = {
                get: jest.fn()
                    .mockResolvedValueOnce({ exists: false })
                    .mockResolvedValueOnce({ exists: true, data: () => mockUser }),
                set: mockSet
            };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDoc) });

            const res = await request(app)
                .post('/api/v1/auth/verify')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(mockSet).toHaveBeenCalled();
        });

        it('should reset quota if month changed', async () => {
            const mockUser = {
                email: 'test@example.com',
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 1000,
                quotaResetAt: { toDate: () => new Date(Date.now() - 1000000) } // Past
            };
            const mockUpdate = jest.fn().mockResolvedValue(true);
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }),
                    update: mockUpdate
                })
            });

            const res = await request(app)
                .post('/api/v1/auth/verify')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ quotaSecondsUsed: 0 }));
            expect(res.body.quota_remaining_seconds).toBe(3600);
        });
    });

    describe('GET /api/v1/auth/google', () => {
        it('should redirect to Google auth URL', async () => {
            const res = await request(app).get('/api/v1/auth/google');
            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toBe('https://google.com/auth');
        });
    });

    describe('GET /api/v1/auth/google/callback', () => {
        it('should handle callback and return success page', async () => {
            mockOAuthClient.getToken.mockResolvedValue({ tokens: { id_token: 'id_token' } });
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => ({ email: 'test@example.com', name: 'Test User', picture: 'pic' })
            });
            adminAuth.getUserByEmail.mockResolvedValue({ uid: 'user123' });
            adminAuth.createCustomToken.mockResolvedValue('custom-token');
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ email: 'test@example.com' }) })
                })
            });

            const res = await request(app)
                .get('/api/v1/auth/google/callback')
                .query({ code: 'auth-code' });

            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('Login Successful');
            expect(res.text).toContain('custom-token');
        });

        it('should create new user if not found in Auth', async () => {
            mockOAuthClient.getToken.mockResolvedValue({ tokens: { id_token: 'id_token' } });
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => ({ email: 'new@example.com', name: 'New User' })
            });
            adminAuth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
            adminAuth.createUser.mockResolvedValue({ uid: 'new-uid' });
            adminAuth.createCustomToken.mockResolvedValue('custom-token');
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: false }),
                    set: jest.fn().mockResolvedValue(true)
                })
            });

            const res = await request(app)
                .get('/api/v1/auth/google/callback')
                .query({ code: 'auth-code' });

            expect(res.statusCode).toEqual(200);
            expect(adminAuth.createUser).toHaveBeenCalled();
        });

        it('should handle error if code is missing', async () => {
            const res = await request(app).get('/api/v1/auth/google/callback');
            expect(res.statusCode).toEqual(500);
            expect(res.text).toContain('Login Failed');
        });
    });

    describe('POST /api/v1/auth/exchange', () => {
        it('should exchange ID token for custom token', async () => {
            adminAuth.createCustomToken.mockResolvedValue('custom-token-123');

            const res = await request(app)
                .post('/api/v1/auth/exchange')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(200);
            expect(res.body.custom_token).toBe('custom-token-123');
            expect(adminAuth.createCustomToken).toHaveBeenCalledWith('user123');
        });

        it('should return 401 if unauthorized', async () => {
            const res = await request(app).post('/api/v1/auth/exchange');
            expect(res.statusCode).toEqual(401);
        });
    });
});
