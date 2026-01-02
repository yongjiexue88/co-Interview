const Redis = require('ioredis');

let redis = null;

// Only connect to Redis if URL is provided
if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100
    });

    redis.on('error', (err) => {
        console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
        console.log('✅ Redis connected');
    });
}

// Rate limiting helpers
const rateLimiter = {
    /**
     * Check if action is rate limited
     * @returns {boolean} true if allowed, false if rate limited
     */
    async checkLimit(key, limit, windowSeconds) {
        if (!redis) return true; // Skip if Redis not configured

        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, windowSeconds);
        }
        return current <= limit;
    },

    /**
     * Set a lock with TTL
     */
    async setLock(key, value, ttlSeconds) {
        if (!redis) return true;
        return redis.setex(key, ttlSeconds, value);
    },

    /**
     * Get lock value
     */
    async getLock(key) {
        if (!redis) return null;
        return redis.get(key);
    },

    /**
     * Delete lock
     */
    async deleteLock(key) {
        if (!redis) return;
        return redis.del(key);
    }
};

module.exports = { redis, rateLimiter };
