const request = require('supertest');
const express = require('express');
const healthRouter = require('../../src/routes/health');

const app = express();
app.use('/api/health', healthRouter);

describe('Health Routes', () => {
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.version).toBe('1.0.0');
            expect(res.body.timestamp).toBeDefined();
            expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
        });

        it('should return valid ISO timestamp', async () => {
            const res = await request(app).get('/api/health');

            const timestamp = new Date(res.body.timestamp);
            const now = new Date();

            // Timestamp should be recent (within 1 second)
            expect(Math.abs(now - timestamp)).toBeLessThan(1000);
        });
    });
});
