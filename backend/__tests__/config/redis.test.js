// Tests for Redis config and rate limiter helpers
// Note: These tests mock the Redis module to test the rateLimiter behavior

describe('Redis Rate Limiter', () => {
    let rateLimiter;
    let mockRedis;

    beforeEach(() => {
        jest.resetModules();
    });

    describe('Without Redis configured', () => {
        beforeEach(() => {
            // Reset modules to get fresh require
            jest.resetModules();

            // Clear REDIS_URL to simulate no Redis
            delete process.env.REDIS_URL;

            // Mock ioredis
            jest.mock('ioredis', () => {
                return jest.fn();
            });

            const config = require('../../src/config/redis');
            rateLimiter = config.rateLimiter;
        });

        it('checkLimit should return true (allow) when Redis not configured', async () => {
            const result = await rateLimiter.checkLimit('test-key', 10, 60);
            expect(result).toBe(true);
        });

        it('setLock should return true when Redis not configured', async () => {
            const result = await rateLimiter.setLock('lock-key', 'value', 60);
            expect(result).toBe(true);
        });

        it('getLock should return null when Redis not configured', async () => {
            const result = await rateLimiter.getLock('lock-key');
            expect(result).toBe(null);
        });

        it('deleteLock should return undefined when Redis not configured', async () => {
            const result = await rateLimiter.deleteLock('lock-key');
            expect(result).toBe(undefined);
        });
    });

    describe('With Redis configured', () => {
        beforeEach(() => {
            jest.resetModules();

            // Set REDIS_URL
            process.env.REDIS_URL = 'redis://localhost:6379';

            // Create mock Redis instance
            mockRedis = {
                incr: jest.fn(),
                expire: jest.fn(),
                setex: jest.fn(),
                get: jest.fn(),
                del: jest.fn(),
                on: jest.fn(),
            };

            // Mock ioredis constructor
            jest.mock('ioredis', () => {
                return jest.fn(() => mockRedis);
            });

            const config = require('../../src/config/redis');
            rateLimiter = config.rateLimiter;

            // Trigger connection events immediately if registered
            const calls = mockRedis.on.mock.calls;
            calls.forEach(([event, handler]) => {
                if (event === 'connect') handler();
                if (event === 'error') handler(new Error('Test connection error'));
            });
        });

        afterEach(() => {
            delete process.env.REDIS_URL;
        });

        describe('checkLimit', () => {
            it('should allow request if under limit', async () => {
                mockRedis.incr.mockResolvedValue(1);

                const result = await rateLimiter.checkLimit('key', 10, 60);

                expect(result).toBe(true);
                expect(mockRedis.incr).toHaveBeenCalledWith('key');
                expect(mockRedis.expire).toHaveBeenCalledWith('key', 60);
            });

            it('should allow request at limit boundary', async () => {
                mockRedis.incr.mockResolvedValue(10);

                const result = await rateLimiter.checkLimit('key', 10, 60);

                expect(result).toBe(true);
            });

            it('should deny request if over limit', async () => {
                mockRedis.incr.mockResolvedValue(11);

                const result = await rateLimiter.checkLimit('key', 10, 60);

                expect(result).toBe(false);
            });

            it('should not set expire on subsequent increments', async () => {
                mockRedis.incr.mockResolvedValue(5);

                await rateLimiter.checkLimit('key', 10, 60);

                expect(mockRedis.expire).not.toHaveBeenCalled();
            });
        });

        describe('setLock', () => {
            it('should set lock with TTL', async () => {
                mockRedis.setex.mockResolvedValue('OK');

                const result = await rateLimiter.setLock('lock-key', 'session-123', 300);

                expect(mockRedis.setex).toHaveBeenCalledWith('lock-key', 300, 'session-123');
                expect(result).toBe('OK');
            });
        });

        describe('getLock', () => {
            it('should get lock value', async () => {
                mockRedis.get.mockResolvedValue('session-123');

                const result = await rateLimiter.getLock('lock-key');

                expect(mockRedis.get).toHaveBeenCalledWith('lock-key');
                expect(result).toBe('session-123');
            });

            it('should return null if lock not found', async () => {
                mockRedis.get.mockResolvedValue(null);

                const result = await rateLimiter.getLock('nonexistent');

                expect(result).toBe(null);
            });
        });

        describe('deleteLock', () => {
            it('should delete lock', async () => {
                mockRedis.del.mockResolvedValue(1);

                const result = await rateLimiter.deleteLock('lock-key');

                expect(mockRedis.del).toHaveBeenCalledWith('lock-key');
                expect(result).toBe(1);
            });
        });
    });
});
