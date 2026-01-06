const request = require('supertest');
const express = require('express');

// Mock dependencies before requiring the router
jest.mock('../../src/config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'admin-uid', email: 'admin@example.com' };
    next();
});

jest.mock('../../src/middleware/admin', () => (req, res, next) => {
    next();
});

// Mock @google-analytics/data
const mockRunReport = jest.fn();
jest.mock('@google-analytics/data', () => ({
    BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({
        runReport: mockRunReport,
    })),
}));

const analyticsRouter = require('../../src/routes/analytics');

const app = express();
app.use(express.json());
app.use('/api/v1/admin/analytics', analyticsRouter);

describe('Analytics Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/admin/analytics/ga', () => {
        it('should return 503 when property ID is not configured', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(503);
            expect(res.body.error).toBe('GA4 Property ID not configured');
            expect(res.body.activeUsers).toBe(0);
            expect(res.body.sessions).toBe(0);

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            }
        });

        it('should return 503 when property ID is REPLACE_ME', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            process.env.GOOGLE_ANALYTICS_PROPERTY_ID = 'REPLACE_ME';

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(503);
            expect(res.body.error).toBe('GA4 Property ID not configured');

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            } else {
                delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            }
        });

        it('should return GA data successfully', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            process.env.GOOGLE_ANALYTICS_PROPERTY_ID = '12345678';

            mockRunReport.mockResolvedValue([
                {
                    rows: [
                        {
                            metricValues: [
                                { value: '100' },  // activeUsers
                                { value: '500' },  // sessions
                                { value: '1000' }, // screenPageViews
                                { value: '2000' }, // eventCount
                            ],
                        },
                    ],
                },
            ]);

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(200);
            expect(res.body.activeUsers).toBe(100);
            expect(res.body.sessions).toBe(500);
            expect(res.body.screenPageViews).toBe(1000);
            expect(res.body.eventCount).toBe(2000);
            expect(res.body.dateRange).toBe('Last 28 Days');

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            } else {
                delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            }
        });

        it('should handle empty rows response', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            process.env.GOOGLE_ANALYTICS_PROPERTY_ID = '12345678';

            mockRunReport.mockResolvedValue([{ rows: [] }]);

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(200);
            expect(res.body.activeUsers).toBe(0);
            expect(res.body.sessions).toBe(0);
            expect(res.body.screenPageViews).toBe(0);
            expect(res.body.eventCount).toBe(0);

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            } else {
                delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            }
        });

        it('should handle null rows response', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            process.env.GOOGLE_ANALYTICS_PROPERTY_ID = '12345678';

            mockRunReport.mockResolvedValue([{ rows: null }]);

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(200);
            expect(res.body.activeUsers).toBe(0);
            expect(res.body.sessions).toBe(0);

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            } else {
                delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            }
        });

        it('should handle GA API errors', async () => {
            const originalPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            process.env.GOOGLE_ANALYTICS_PROPERTY_ID = '12345678';

            mockRunReport.mockRejectedValue(new Error('GA API Error'));

            const res = await request(app).get('/api/v1/admin/analytics/ga');

            expect(res.statusCode).toEqual(500);
            expect(res.body.error).toBe('Failed to fetch GA data');
            expect(res.body.details).toBe('GA API Error');

            if (originalPropertyId) {
                process.env.GOOGLE_ANALYTICS_PROPERTY_ID = originalPropertyId;
            } else {
                delete process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
            }
        });
    });
});
