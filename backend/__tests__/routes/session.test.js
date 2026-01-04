const request = require('supertest');
const app = require('../../src/index');

jest.mock('../../src/config/redis', () => ({
    rateLimiter: {
        checkLimit: jest.fn(),
        getLock: jest.fn(),
        setLock: jest.fn(),
        deleteLock: jest.fn(),
    },
}));

const { db } = require('../../src/config/firebase');
const { rateLimiter } = require('../../src/config/redis');

// Mock middlewares
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (auth === 'Bearer valid_token') {
        req.user = { uid: 'user123', email: 'test@example.com' };
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('Session Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/realtime/session', () => {
        it('should create session for active user', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            const mockUser = {
                plan: 'free',
                status: 'active',
                quotaSecondsUsed: 0
            };
            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return { doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) }) };
                }
                if (name === 'sessions') {
                    return { doc: jest.fn().mockReturnValue({ set: jest.fn().mockResolvedValue(true) }) };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token')
                .send({ model: 'gemini-2.0' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('session_id');
        });

        it('should return 429 if rate limited', async () => {
            rateLimiter.checkLimit.mockResolvedValue(false);
            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(429);
        });

        it('should return 401 if subscription inactive', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            const mockUser = { status: 'canceled' };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) }) });

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(402);
        });

        it('should return 402 if subscription expired', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            const mockUser = {
                status: 'active',
                currentPeriodEnd: { toDate: () => new Date(Date.now() - 1000) }
            };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) }) });

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(402);
        });

        it('should return 429 if concurrency limit exceeded', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue('existing_session');
            const mockUser = { plan: 'free', status: 'active' };
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser }) }) });

            const res = await request(app)
                .post('/api/v1/realtime/session')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(429);
        });
    });

    describe('POST /api/v1/realtime/session/:sessionId/end', () => {
        it('should end session and release lock', async () => {
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ userId: 'user123' }) }),
                            update: jest.fn().mockResolvedValue(true)
                        })
                    };
                }
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ plan: 'free' }) }),
                            update: jest.fn().mockResolvedValue(true)
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/session/sess_1/end')
                .set('Authorization', 'Bearer valid_token')
                .send({ duration_seconds: 60 });

            expect(res.statusCode).toEqual(200);
            expect(rateLimiter.deleteLock).toHaveBeenCalled();
        });

        it('should return 404 if session not found', async () => {
            db.collection.mockReturnValue({ doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: false }) }) });
            const res = await request(app)
                .post('/api/v1/realtime/session/999/end')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(404);
        });

        it('should return 403 if not session owner', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ userId: 'other' }) })
                })
            });
            const res = await request(app)
                .post('/api/v1/realtime/session/sess_1/end')
                .set('Authorization', 'Bearer valid_token');
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('POST /api/v1/realtime/heartbeat', () => {
        it('should return continue: true if quota remains', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ plan: 'free', quotaSecondsUsed: 0 }) })
                })
            });
            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .set('Authorization', 'Bearer valid_token')
                .send({ session_id: 'sess_1', elapsed_seconds: 10 });
            expect(res.statusCode).toEqual(200);
            expect(res.body.continue).toBe(true);
        });

        it('should return continue: false if quota exceeded', async () => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ plan: 'free', quotaSecondsUsed: 3600 }) })
                })
            });
            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .set('Authorization', 'Bearer valid_token')
                .send({ session_id: 'sess_1', elapsed_seconds: 10 });
            expect(res.statusCode).toEqual(402);
            expect(res.body.continue).toBe(false);
        });
    });
});
