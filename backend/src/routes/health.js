const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Health check endpoint for load balancers
 */
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
