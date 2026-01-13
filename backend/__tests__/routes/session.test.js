const { v4: uuidv4 } = require('uuid');

// Mock GoogleGenAI before requiring modules
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        authTokens: {
            create: jest.fn().mockResolvedValue({ name: 'mock-token' })
        }
    }))
}));

const request = require('supertest');

// 1. Mock Redis
jest.mock('../../src/config/redis', () => ({
    rateLimiter: {
        checkLimit: jest.fn(),
        getLock: jest.fn(),
        setLock: jest.fn(),
        deleteLock: jest.fn(),
    },
}));

// Mock Stripe config
jest.mock('../../src/config/stripe', () => ({
    PLANS: {
        free: {
            quotaSecondsMonth: 3600,
            sessionMaxDuration: 3600,
            concurrencyLimit: 1
        }
    }
}));

// 2. Mock Firebase Admin & DB
jest.mock('../../src/config/firebase', () => {
    const mockTransaction = jest.fn(async (callback) => {
        const t = {
            get: jest.fn(),
            update: jest.fn(),
            set: jest.fn(),
        };
        return await callback(t);
    });

    const mockDb = {
        collection: jest.fn(),
        runTransaction: mockTransaction,
    };

    const mockFirestoreFn = jest.fn(() => mockDb);
    mockFirestoreFn.FieldValue = {
        serverTimestamp: () => 'SERVER_TIMESTAMP',
    };
    mockFirestoreFn.Timestamp = {
        now: () => ({
            toMillis: () => Date.now(),
        }),
    };

    return {
        db: mockDb,
        admin: {
            firestore: mockFirestoreFn,
            auth: () => ({
                verifyIdToken: jest.fn(),
            })
        }
    };
});

// Restore console.error for debugging
global.console.error = console.error;

// 3. Mock Auth Middleware
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'user123', email: 'test@example.com' };
    next();
});

const { db, admin } = require('../../src/config/firebase');
const { rateLimiter } = require('../../src/config/redis');
const app = require('../../src/index');

describe('Session Routes (Server-Side Quota)', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset default mock implementations for db.collection
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
                update: jest.fn(),
                set: jest.fn(),
            })
        });
    });

    describe('POST /api/v1/realtime/session (Start)', () => {
        it('should create session with server timestamps', async () => {
            // Check dependency mock
            if (!admin.firestore.FieldValue) {
                process.stderr.write('DEBUG: admin.firestore.FieldValue is MISSING in test setup\n');
            }

            // Setup
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            const setMock = jest.fn(); // Persistent mock

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({ status: 'active', usage: { quotaSecondsUsed: 0 }, access: { planId: 'free' } })
                            }),
                            update: jest.fn()
                        })
                    };
                }
                if (name === 'sessions') {
                    return { doc: jest.fn().mockReturnValue({ set: setMock }) };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});

            if (res.statusCode !== 200) {
                process.stderr.write(`Test Failed Body: ${JSON.stringify(res.body)}\n`);
            }

            expect(res.statusCode).toEqual(200);
            expect(db.collection).toHaveBeenCalledWith('sessions');
            // Check that we used serverTimestamp
            const sessionData = setMock.mock.calls[0][0];
            expect(sessionData.startedAt).toBe('SERVER_TIMESTAMP');
            expect(sessionData.lastHeartbeatAt).toBe('SERVER_TIMESTAMP');
        });

        it('should perform lazy reset if new month', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            // User with stale reset date
            const pastDate = new Date('2023-01-01');
            const updateMock = jest.fn();

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    status: 'active',
                                    usage: { quotaSecondsUsed: 1000, quotaResetAt: pastDate },
                                    access: { planId: 'free' }
                                })
                            }),
                            update: updateMock
                        })
                    };
                }
                if (name === 'sessions') {
                    return { doc: jest.fn().mockReturnValue({ set: jest.fn() }) };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});
            if (res.statusCode !== 200) {
                process.stderr.write(`Lazy Reset Test Failed: ${JSON.stringify(res.body)}\n`);
            }

            expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
                'usage.quotaSecondsUsed': 0
            }));
        });

        it('should return 429 if rate limit exceeded', async () => {
            rateLimiter.checkLimit.mockResolvedValue(false);

            const res = await request(app).post('/api/v1/realtime/session').send({});

            expect(res.statusCode).toEqual(429);
        });

        it('should return 403 if user not found', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({ exists: false })
                        })
                    };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});

            expect(res.statusCode).toEqual(403);
        });

        it('should return 429 if concurrency limit exceeded', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue('existing-session-id'); // Has active session

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    status: 'active',
                                    usage: { quotaSecondsUsed: 0 },
                                    access: { planId: 'free' } // concurrencyLimit: 1
                                })
                            }),
                            update: jest.fn()
                        })
                    };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});

            expect(res.statusCode).toEqual(429);
        });

        it('should return 402 if subscription not active', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    status: 'past_due', // Not active
                                    usage: { quotaSecondsUsed: 0 },
                                    access: { planId: 'free' }
                                })
                            }),
                            update: jest.fn()
                        })
                    };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});

            expect(res.statusCode).toEqual(402);
        });

        it('should return 429 if quota exceeded', async () => {
            rateLimiter.checkLimit.mockResolvedValue(true);
            rateLimiter.getLock.mockResolvedValue(null);

            db.collection.mockImplementation((name) => {
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    status: 'active',
                                    usage: { quotaSecondsUsed: 3600 }, // Full quota used
                                    access: { planId: 'free' }
                                })
                            }),
                            update: jest.fn()
                        })
                    };
                }
            });

            const res = await request(app).post('/api/v1/realtime/session').send({});

            expect(res.statusCode).toEqual(429);
        });
    });

    describe('POST /api/v1/realtime/session/:sessionId/end (End)', () => {
        it('should cap charge if duration > remaining quota', async () => {
            // Setup for Transaction
            const nowMillis = 100000;
            const startedAtMillis = 100000 - (600 * 1000); // 600s ago (10 minutes)

            // Mock Timestamp.now dynamically
            jest.spyOn(admin.firestore.Timestamp, 'now').mockReturnValue({ toMillis: () => nowMillis });

            const mockSession = {
                userId: 'user123',
                startedAt: { toMillis: () => startedAtMillis },
                counted: false
            };

            // User with only 60s remaining (quota 3600, used 3540)
            const mockUser = {
                access: { planId: 'free' },
                usage: { quotaSecondsUsed: 3540 },
                status: 'active'
            };

            // Setup db.runTransaction mock with implementation
            db.runTransaction.mockImplementation(async (cb) => {
                const t = {
                    get: jest.fn()
                        .mockResolvedValueOnce({ exists: true, data: () => mockSession }) // 1st get: Session
                        .mockResolvedValueOnce({ exists: true, data: () => mockUser }),   // 2nd get: User
                    update: jest.fn()
                };

                return await cb(t);
            });

            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});

            if (res.statusCode !== 200) {
                process.stderr.write(`End Test Failed: ${JSON.stringify(res.body)}\n`);
            }

            expect(res.statusCode).toEqual(200);

            expect(res.body.duration_seconds).toBe(600);
            expect(res.body.charged_seconds).toBe(60);
            expect(res.body.quota_remaining_seconds).toBe(0);
        });

        it('should charge full duration if quota suffices', async () => {
            // 60s duration, plenty of quota
            const nowMillis = 200000;
            const startedAtMillis = 200000 - (60 * 1000);

            jest.spyOn(admin.firestore.Timestamp, 'now').mockReturnValue({ toMillis: () => nowMillis });

            db.runTransaction.mockImplementation(async (cb) => {
                const t = {
                    get: jest.fn()
                        .mockResolvedValueOnce({
                            exists: true, data: () => ({
                                userId: 'user123', startedAt: { toMillis: () => startedAtMillis }, counted: false
                            })
                        })
                        .mockResolvedValueOnce({
                            exists: true, data: () => ({
                                access: { planId: 'free' }, usage: { quotaSecondsUsed: 0 }
                            })
                        }),
                    update: jest.fn()
                };
                return await cb(t);
            });

            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});

            expect(res.body.duration_seconds).toBe(60);
            expect(res.body.charged_seconds).toBe(60);
        });

        it('should return already ended if double call', async () => {
            db.runTransaction.mockImplementation(async (cb) => {
                const t = {
                    get: jest.fn()
                        .mockResolvedValueOnce({
                            exists: true, data: () => ({
                                userId: 'user123', counted: true, durationSeconds: 50, chargedSeconds: 50
                            })
                        })
                        .mockResolvedValueOnce({ exists: true, data: () => ({}) }),
                    update: jest.fn() // shouldn't be called
                };
                return await cb(t);
            });

            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});
            expect(res.body.duration_seconds).toBe(50);
            expect(res.body.message).toMatch(/already ended/);
        });

        it('should return 404 if session not found', async () => {
            db.runTransaction.mockImplementation(async (cb) => {
                const t = {
                    get: jest.fn().mockResolvedValueOnce({ exists: false }),
                    update: jest.fn()
                };
                return await cb(t);
            });

            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});

            expect(res.statusCode).toEqual(404);
            expect(res.body.error).toBe('Session not found');
        });

        it('should return 403 if not authorized', async () => {
            db.runTransaction.mockImplementation(async (cb) => {
                const t = {
                    get: jest.fn()
                        .mockResolvedValueOnce({
                            exists: true, data: () => ({ userId: 'different-user', counted: false })
                        })
                        .mockResolvedValueOnce({ exists: true, data: () => ({}) }),
                    update: jest.fn()
                };
                return await cb(t);
            });

            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toBe('Not authorized');
        });
        it('should handle errors', async () => {
            db.runTransaction.mockImplementation(() => { throw new Error('Transaction failed'); });
            const res = await request(app).post('/api/v1/realtime/session/sess_1/end').send({});
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('POST /api/v1/realtime/heartbeat', () => {
        it('should return 404 if session not found', async () => {
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({ exists: false })
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'nonexistent' });

            expect(res.statusCode).toEqual(404);
            expect(res.body.error).toBe('Session not found');
        });

        it('should return 403 if not authorized', async () => {
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({ userId: 'different-user', status: 'active' })
                            })
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'sess_1' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toBe('Not authorized');
        });

        it('should return continue:false if session already ended', async () => {
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({ userId: 'user123', status: 'ended' })
                            })
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'sess_1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.continue).toBe(false);
            expect(res.body.reason).toBe('session_ended');
        });

        it('should return continue:true if startedAt is missing (legacy)', async () => {
            const updateMock = jest.fn();
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({ userId: 'user123', status: 'active', startedAt: null })
                            }),
                            update: updateMock
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'sess_1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.continue).toBe(true);
        });

        it('should return 402 if quota exceeded mid-session', async () => {
            const nowMillis = 300000;
            const startedAtMillis = nowMillis - (3600 * 1000); // 1 hour elapsed

            jest.spyOn(admin.firestore.Timestamp, 'now').mockReturnValue({ toMillis: () => nowMillis });

            const updateMock = jest.fn();
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    userId: 'user123',
                                    status: 'active',
                                    startedAt: { toMillis: () => startedAtMillis }
                                })
                            }),
                            update: updateMock
                        })
                    };
                }
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    access: { planId: 'free' },
                                    usage: { quotaSecondsUsed: 3500 } // Only 100s remaining, but 3600s elapsed
                                })
                            })
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'sess_1' });

            expect(res.statusCode).toEqual(402);
            expect(res.body.continue).toBe(false);
            expect(res.body.reason).toBe('quota_exceeded');
        });

        it('should extend session and return continue:true with quota', async () => {
            const nowMillis = 300000;
            const startedAtMillis = nowMillis - (60 * 1000); // 60s elapsed

            jest.spyOn(admin.firestore.Timestamp, 'now').mockReturnValue({ toMillis: () => nowMillis });

            const updateMock = jest.fn();
            db.collection.mockImplementation((name) => {
                if (name === 'sessions') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    userId: 'user123',
                                    status: 'active',
                                    startedAt: { toMillis: () => startedAtMillis }
                                })
                            }),
                            update: updateMock
                        })
                    };
                }
                if (name === 'users') {
                    return {
                        doc: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue({
                                exists: true,
                                data: () => ({
                                    access: { planId: 'free' },
                                    usage: { quotaSecondsUsed: 0 }
                                })
                            })
                        })
                    };
                }
            });

            const res = await request(app)
                .post('/api/v1/realtime/heartbeat')
                .send({ session_id: 'sess_1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.continue).toBe(true);
            expect(res.body.quota_remaining_seconds).toBe(3600 - 60);
            expect(rateLimiter.setLock).toHaveBeenCalled();
            expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
                lastHeartbeatAt: expect.anything()
            }));
        });
        it('should handle errors', async () => {
            db.collection.mockImplementation(() => { throw new Error('DB Error'); });
            const res = await request(app).post('/api/v1/realtime/heartbeat').send({ session_id: 'sess_1' });
            expect(res.statusCode).toEqual(500);
        });
    });
});
