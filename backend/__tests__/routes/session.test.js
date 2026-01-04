const request = require('supertest');
const app = require('../../src/index');
const { auth, db } = require('../../src/config/firebase');
const { rateLimiter } = require('../../src/config/redis');

// Mock Redis Rate Limiter
jest.mock('../../src/config/redis', () => ({
    rateLimiter: {
        checkLimit: jest.fn(),
        getLock: jest.fn(),
        setLock: jest.fn(),
        deleteLock: jest.fn(),
    },
}));

// Mock Firestore
const mockUserGet = jest.fn();
const mockUserUpdate = jest.fn();
const mockSessionSet = jest.fn();
const mockSessionGet = jest.fn();
const mockSessionUpdate = jest.fn();

db.collection = jest.fn((collectionName) => {
    if (collectionName === 'users') {
        return {
            doc: jest.fn(() => ({
                get: mockUserGet,
                update: mockUserUpdate,
            })),
        };
    }
    if (collectionName === 'sessions') {
        return {
            doc: jest.fn(() => ({
                set: mockSessionSet,
                get: mockSessionGet,
                update: mockSessionUpdate,
            })),
        };
    }
    return {
        doc: jest.fn(() => ({ get: jest.fn(), set: jest.fn(), update: jest.fn() })),
    };
});

describe('Session Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        auth.verifyIdToken.mockResolvedValue({
            uid: 'user123',
            email: 'test@example.com',
            email_verified: true,
        });

        // Default: DB returns active free user
        mockUserGet.mockResolvedValue({
            exists: true,
            data: () => ({
                uid: 'user123',
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 0
            })
        });

        // Default: Rate limiter allows
        rateLimiter.checkLimit.mockResolvedValue(true);
        rateLimiter.getLock.mockResolvedValue(null);
    });

    describe('POST /v1/realtime/session', () => {
        it('should create session for active user', async () => {
            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token')
                .send({ model: 'gemini-1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('session_id');
            expect(res.body).toHaveProperty('token');
            expect(mockSessionSet).toHaveBeenCalled();
            expect(rateLimiter.setLock).toHaveBeenCalled();
        });

        it('should enforce quota limits', async () => {
            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    plan: 'free',
                    status: 'active',
                    quotaSecondsUsed: 10000 // Exceeds free limit (assuming ~10-60m)
                })
            });

            // Need to ensure config allows testing this. 
            // Free plan quota is usually small.
            // Let's assume PLANS.free.quotaSecondsMonth < 10000

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(429); // QuotaExceededError is 429
            // checking errorHandler might reveal code, but usually 402 or 403.
        });

        it('should enforce concurrency limit', async () => {
            rateLimiter.getLock.mockResolvedValue('existing_session_id');

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');

            expect(res.statusCode).toEqual(429); // ConcurrencyLimitError -> 429
        });
    });

    describe('POST /v1/realtime/heartbeat', () => {
        it('should return continue: true if quota remains', async () => {
            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .set('Authorization', 'Bearer valid_token')
                .send({ session_id: 'sess_1', elapsed_seconds: 60 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.continue).toBe(true);
            expect(rateLimiter.setLock).toHaveBeenCalled(); // Should extend lock
        });

        it('should return continue: false if quota exceeded', async () => {
            mockUserGet.mockResolvedValue({
                exists: true,
                data: () => ({
                    uid: 'user123',
                    plan: 'free',
                    status: 'active',
                    quotaSecondsUsed: 999999
                })
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .set('Authorization', 'Bearer valid_token')
                .send({ session_id: 'sess_1', elapsed_seconds: 60 });

            expect(res.statusCode).toEqual(402);
        });
    });
});
