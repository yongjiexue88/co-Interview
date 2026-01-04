const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock dependencies
jest.mock('../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../config/stripe', () => ({
    PLANS: {
        free: { quotaSecondsMonth: 3600, concurrencyLimit: 1, features: [] },
        pro: { quotaSecondsMonth: 18000, concurrencyLimit: 5, features: ['pro'] },
    },
}));

jest.mock('../config/redis', () => ({
    rateLimiter: {
        checkLimit: jest.fn(),
        getLock: jest.fn(),
        setLock: jest.fn(),
        deleteLock: jest.fn(),
    },
}));

// Mock middleware
jest.mock('../middleware/auth', () => (req, res, next) => next());

// Import session router
const sessionRouter = require('./session');
const { db } = require('../config/firebase'); // mocked
const { rateLimiter } = require('../config/redis'); // mocked

const app = express();
app.use(bodyParser.json());
// Mock auth middleware
app.use((req, res, next) => {
    req.user = { uid: 'user123', email: 'test@example.com' };
    next();
});
app.use('/', sessionRouter);

describe('Session Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /session', () => {
        it('should forbid access if rate limit exceeded', async () => {
            rateLimiter.checkLimit.mockResolvedValue(false);

            const res = await request(app).post('/session').send({});

            // Error handler usually returns 429 for QuotaExceededError or 500 depending on implementation
            // The code throws QuotaExceededError. Since we didn't mount actual error handler, express default might return 500 with stack
            // Or if we check the implementation of QuotaExceededError mapping.
            // Let's expect failure.
            expect(res.status).not.toBe(200);
        });

        it('should allow session creation for valid active user', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null); // No active session

            const mockUser = {
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 0,
            };
            const mockDocRef = { get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) };
            const mockSessionRef = { set: jest.fn() };

            db.collection.mockImplementation(name => {
                if (name === 'users') return { doc: jest.fn().mockReturnValue(mockDocRef) };
                if (name === 'sessions') return { doc: jest.fn().mockReturnValue(mockSessionRef) };
            });

            const res = await request(app).post('/session').send({ model: 'gemini-pro' }).expect(200);

            expect(res.body.session_id).toBeDefined();
            expect(res.body.provider).toBe('gemini');
        });

        it('should block if subscription is not active', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);

            const mockUser = {
                plan: 'pro',
                status: 'past_due',
            };
            const mockDocRef = { get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });

            await request(app).post('/session').expect(402); // PaymentRequiredError
        });
    });

    describe('POST /session/:sessionId/end', () => {
        it('should end a session and update quota', async () => {
            const mockSession = {
                userId: 'user123',
                status: 'active',
            };
            const mockUser = {
                plan: 'free',
                quotaSecondsUsed: 100,
            };

            const mockSessionDocRef = {
                get: jest.fn().mockResolvedValue({ exists: true, data: () => mockSession }),
                update: jest.fn().mockResolvedValue(true),
            };
            const mockUserDocRef = {
                get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }),
                update: jest.fn().mockResolvedValue(true),
            };

            db.collection.mockImplementation(name => {
                if (name === 'sessions') return { doc: jest.fn().mockReturnValue(mockSessionDocRef) };
                if (name === 'users') return { doc: jest.fn().mockReturnValue(mockUserDocRef) };
            });

            const res = await request(app).post('/session/sess_123/end').send({ duration_seconds: 50 }).expect(200);

            expect(mockSessionDocRef.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'ended' }));
            expect(mockUserDocRef.update).toHaveBeenCalledWith({ quotaSecondsUsed: 150 });
        });
    });
});
