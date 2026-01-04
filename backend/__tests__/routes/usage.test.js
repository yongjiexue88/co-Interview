const request = require('supertest');
const express = require('express');
const usageRouter = require('../../src/routes/usage');
const { db } = require('../../src/config/firebase');

// Mock dependencies
jest.mock('../../src/config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../../src/config/stripe', () => ({
    PLANS: {
        free: { quotaSecondsMonth: 3600, concurrencyLimit: 1, features: [] },
        pro: { quotaSecondsMonth: 36000, concurrencyLimit: 5, features: [] },
    },
}));

// Mock middlewares
jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'user123', email: 'test@example.com' };
    next();
});

const app = express();
app.use(express.json());
app.use('/api/v1/usage', usageRouter);

describe('Usage Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return usage stats for authenticated user', async () => {
        const mockUser = {
            plan: 'free',
            quotaSecondsUsed: 1200
        };
        const mockSessions = [
            { id: 's1', data: () => ({ durationSeconds: 300, startedAt: new Date() }) },
            { id: 's2', data: () => ({ durationSeconds: 300, startedAt: new Date() }) }
        ];

        db.collection.mockImplementation((name) => {
            if (name === 'users') {
                return {
                    doc: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue({ exists: true, data: () => mockUser })
                    })
                };
            }
            if (name === 'sessions') {
                return {
                    where: jest.fn().mockReturnThis(),
                    get: jest.fn().mockResolvedValue({ docs: mockSessions })
                };
            }
        });

        const res = await request(app).get('/api/v1/usage');

        expect(res.statusCode).toEqual(200);
        expect(res.body.quota_total_seconds).toBe(3600);
        expect(res.body.quota_used_seconds).toBe(1200);
        expect(res.body.quota_remaining_seconds).toBe(2400);
        expect(res.body.session_count).toBe(2);
        expect(res.body.avg_session_seconds).toBe(300);
    });

    it('should handle user not found', async () => {
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({ exists: false })
            })
        });

        const res = await request(app).get('/api/v1/usage');
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('User not found');
    });

    it('should handle errors gracefully', async () => {
        db.collection.mockImplementation(() => {
            throw new Error('Database error');
        });

        // Error handler should be hit (though we didn't mount a complex one, 
        // our test express app will return 500)
        const res = await request(app).get('/api/v1/usage');
        expect(res.statusCode).toEqual(500);
    });
});
