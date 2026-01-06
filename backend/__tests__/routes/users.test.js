const request = require('supertest');
const app = require('../../src/index');
const { auth: adminAuth, db } = require('../../src/config/firebase');
const { PLANS } = require('../../src/config/stripe');

jest.mock('../../src/config/firebase', () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'test-user-id', email: 'test@example.com' };
    next();
});

describe('GET /api/v1/users/me', () => {
    let mockUserDoc;

    beforeEach(() => {
        mockUserDoc = {
            exists: true,
            data: jest.fn(),
        };
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue(mockUserDoc),
            }),
        });
    });

    it('should return correct Schema V2 entitlement', async () => {
        mockUserDoc.data.mockReturnValue({
            access: { planId: 'sprint_30d', accessStatus: 'active' },
            usage: { quotaSecondsUsed: 1000 },
        });

        const res = await request(app).get('/api/v1/users/me');

        expect(res.statusCode).toEqual(200);
        expect(res.body.plan.id).toBe('sprint_30d');
        expect(res.body.quota.limit).toBe(PLANS.sprint_30d.quotaSecondsMonth);
        expect(res.body.quota.used).toBe(1000);
        expect(res.body.quota.remaining).toBe(PLANS.sprint_30d.quotaSecondsMonth - 1000);
    });

    it('should fallback correctly for Schema V1 user', async () => {
        mockUserDoc.data.mockReturnValue({
            plan: 'free',
            quotaSecondsUsed: 50,
        });

        const res = await request(app).get('/api/v1/users/me');

        expect(res.statusCode).toEqual(200);
        expect(res.body.plan.id).toBe('free');
        expect(res.body.quota.limit).toBe(PLANS.free.quotaSecondsMonth);
        expect(res.body.quota.used).toBe(50);
    });

    it('should default to free/zero if fields missing', async () => {
        mockUserDoc.data.mockReturnValue({});

        const res = await request(app).get('/api/v1/users/me');

        expect(res.statusCode).toEqual(200);
        expect(res.body.plan.id).toBe('free');
        expect(res.body.quota.used).toBe(0);
    });

    it('should return 404 if user not found (unlikely with auth)', async () => {
        mockUserDoc.exists = false;

        const res = await request(app).get('/api/v1/users/me');

        expect(res.statusCode).toEqual(404);
    });
    it('should handle errors', async () => {
        db.collection.mockImplementation(() => { throw new Error('DB Error'); });
        const res = await request(app).get('/api/v1/users/me');
        expect(res.statusCode).toEqual(500);
    });
});
