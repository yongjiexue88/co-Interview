const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock dependencies
jest.mock('../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
    auth: {
        getUserByEmail: jest.fn(),
        createUser: jest.fn(),
        createCustomToken: jest.fn(),
    },
}));

jest.mock('../config/stripe', () => ({
    PLANS: {
        free: { quotaSecondsMonth: 3600, concurrencyLimit: 1, features: [] },
    },
}));

const mockOAuthClient = {
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
    setCredentials: jest.fn(),
    verifyIdToken: jest.fn(),
};

jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn(() => mockOAuthClient),
}));

// Mock middleware to bypass real auth check
jest.mock('../middleware/auth', () => (req, res, next) => {
    next();
});

// Import routes after mocks
const authRouter = require('./auth');
const { db, auth } = require('../config/firebase');

const app = express();
app.use(bodyParser.json());
// Mock auth middleware logic for /verify route (setting user)
app.use((req, res, next) => {
    if (req.path === '/verify') {
        req.user = { uid: 'test-uid', email: 'test@example.com' };
    }
    next();
});
app.use('/', authRouter);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /verify', () => {
        it('should create new user if not exists', async () => {
            const mockDoc = {
                exists: false,
            };
            const mockGet = jest
                .fn()
                .mockResolvedValueOnce(mockDoc) // First check
                .mockResolvedValueOnce({
                    // After creation
                    exists: true,
                    data: () => ({ email: 'test@example.com', plan: 'free', status: 'active' }),
                });

            const mockSet = jest.fn().mockResolvedValue(true);
            const mockDocRef = { get: mockGet, set: mockSet };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });

            const res = await request(app).post('/verify').set('Authorization', 'Bearer valid').expect(200);

            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                    plan: 'free',
                })
            );
            expect(res.body.email).toBe('test@example.com');
        });

        it('should return existing user data', async () => {
            const mockDoc = {
                exists: true,
                data: jest.fn().mockReturnValue({
                    email: 'test@example.com',
                    plan: 'free',
                    status: 'active',
                    quotaSecondsUsed: 100,
                }),
            };
            const mockDocRef = { get: jest.fn().mockResolvedValue(mockDoc), update: jest.fn() };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });

            const res = await request(app).post('/verify').set('Authorization', 'Bearer valid').expect(200);

            expect(res.body.quota_remaining_seconds).toBe(3500); // 3600 - 100
        });
    });

    describe('GET /google/callback', () => {
        it('should handle successful login flow', async () => {
            // Setup Google Mock
            mockOAuthClient.getToken.mockResolvedValue({ tokens: { id_token: 'id_token' } });
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => ({ email: 'new@example.com', name: 'New User', sub: 'google_id', picture: 'pic.jpg' }),
            });

            // Setup Firebase User Mock (User not found -> Create)
            auth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
            auth.createUser.mockResolvedValue({ uid: 'firebase_uid' });
            auth.createCustomToken.mockResolvedValue('custom_token_123');

            // Setup Firestore Mock (Create user doc)
            const mockDocRef = { get: jest.fn().mockResolvedValue({ exists: false }), set: jest.fn() };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });

            const res = await request(app).get('/google/callback').query({ code: 'auth_code' }).expect(200);

            expect(res.text).toContain('Login Successful');
            expect(res.text).toContain('custom_token_123');
            expect(res.text).toContain('firebase_uid');

            expect(auth.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }));
            expect(auth.createCustomToken).toHaveBeenCalledWith('firebase_uid');
        });

        it('should handle error if code is missing', async () => {
            await request(app).get('/google/callback').expect(500);
        });
    });
});
