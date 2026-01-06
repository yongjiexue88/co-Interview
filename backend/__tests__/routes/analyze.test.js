const request = require('supertest');
const express = require('express');

// Mock dependencies before requiring the router
jest.mock('../../src/config/firebase', () => ({
    db: {
        collection: jest.fn(),
    },
}));

jest.mock('../../src/middleware/auth', () => (req, res, next) => {
    req.user = { uid: 'user-123', email: 'test@example.com' };
    next();
});

jest.mock('../../src/config/stripe', () => ({
    PLANS: {
        free: {
            quotaSecondsMonth: 3600,
            concurrencyLimit: 1,
        },
        pro: {
            quotaSecondsMonth: 36000,
            concurrencyLimit: 5,
        },
    },
}));

// Mock @google/genai
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: mockGenerateContent,
        },
    })),
}));

const analyzeRouter = require('../../src/routes/analyze');
const { db } = require('../../src/config/firebase');

const app = express();
app.use(express.json());
app.use('/api/v1/analyze', analyzeRouter);

// Add simple error handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

describe('Analyze Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/analyze/screenshot', () => {
        const mockUserRef = {
            get: jest.fn(),
            update: jest.fn(),
        };

        beforeEach(() => {
            db.collection.mockReturnValue({
                doc: jest.fn().mockReturnValue(mockUserRef),
            });
        });

        it('should return 400 if image is missing', async () => {
            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ prompt: 'Analyze this' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toBe('Missing image data');
        });

        it('should return 403 if user not found', async () => {
            mockUserRef.get.mockResolvedValue({ exists: false });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toBe('User not found');
        });

        it('should return 402 if insufficient quota', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    usage: { quotaSecondsUsed: 3590 }, // Only 10 seconds remaining, need 30
                }),
            });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(402);
            expect(res.body.error).toBe('Insufficient quota for screenshot analysis');
            expect(res.body.quota_remaining_seconds).toBe(10);
        });

        it('should analyze screenshot successfully', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'pro' },
                    usage: { quotaSecondsUsed: 1000 },
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({
                text: 'This is a screenshot of code.',
            });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({
                    image: 'base64imagedata',
                    prompt: 'Analyze this screenshot',
                    model: 'gemini-2.5-flash',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.text).toBe('This is a screenshot of code.');
            expect(res.body.model).toBe('gemini-2.5-flash');
            expect(res.body.quota_charged_seconds).toBe(30);
            expect(res.body.quota_remaining_seconds).toBe(35000 - 30); // 36000 - 1000 - 30

            // Verify quota was deducted
            expect(mockUserRef.update).toHaveBeenCalledWith({
                'usage.quotaSecondsUsed': 1030,
            });
        });

        it('should use default model if not specified', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    usage: { quotaSecondsUsed: 0 },
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({
                text: 'Analysis result',
            });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.model).toBe('gemini-2.5-flash');
        });

        it('should use default prompt if not specified', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    usage: { quotaSecondsUsed: 0 },
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({
                text: 'Default analysis',
            });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
            expect(mockGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    contents: expect.arrayContaining([
                        expect.objectContaining({
                            text: 'Analyze this image and provide helpful insights.',
                        }),
                    ]),
                })
            );
        });

        it('should handle V1 user schema (fallback to user.plan)', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    plan: 'pro', // V1 schema
                    // No access.planId
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({ text: 'Result' });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
        });

        it('should handle empty text response from Gemini', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    usage: { quotaSecondsUsed: 0 },
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({
                text: '',
            });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.text).toBe('');
        });

        it('should handle Gemini API errors', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    usage: { quotaSecondsUsed: 0 },
                }),
            });

            mockGenerateContent.mockRejectedValue(new Error('Gemini API Error'));

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(500);
        });

        it('should handle missing usage data (default to 0)', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'free' },
                    // No usage field
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({ text: 'Result' });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.quota_remaining_seconds).toBe(3600 - 30);
        });

        it('should fallback to free plan if plan not recognized', async () => {
            mockUserRef.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    access: { planId: 'unknown_plan' },
                    usage: { quotaSecondsUsed: 0 },
                }),
            });
            mockUserRef.update.mockResolvedValue({});

            mockGenerateContent.mockResolvedValue({ text: 'Result' });

            const res = await request(app)
                .post('/api/v1/analyze/screenshot')
                .send({ image: 'base64data' });

            expect(res.statusCode).toEqual(200);
            // Should use free plan quota (3600)
            expect(res.body.quota_remaining_seconds).toBe(3600 - 30);
        });
    });
});
