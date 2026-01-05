const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Initialize GA Data Client
const analyticsDataClient = new BetaAnalyticsDataClient();

// Protect all analytics routes
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/v1/admin/analytics/ga
 * Fetch aggregated GA4 data
 */
router.get('/ga', async (req, res) => {
    try {
        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

        if (!propertyId || propertyId === 'REPLACE_ME') {
            return res.status(503).json({
                error: 'GA4 Property ID not configured',
                activeUsers: 0,
                sessions: 0,
                screenPageViews: 0,
                eventCount: 0,
            });
        }

        // Run report for last 28 days
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: '28daysAgo',
                    endDate: 'today',
                },
            ],
            metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'eventCount' }],
        });

        const row = response.rows && response.rows.length > 0 ? response.rows[0] : null;

        const data = {
            activeUsers: row ? parseInt(row.metricValues[0].value) : 0,
            sessions: row ? parseInt(row.metricValues[1].value) : 0,
            screenPageViews: row ? parseInt(row.metricValues[2].value) : 0,
            eventCount: row ? parseInt(row.metricValues[3].value) : 0,
            dateRange: 'Last 28 Days',
        };

        res.json(data);
    } catch (error) {
        console.error('GA Data API Error:', error);
        // Fallback for demo/dev purposes if credentials fail
        res.status(500).json({
            error: 'Failed to fetch GA data',
            details: error.message,
        });
    }
});

module.exports = router;
