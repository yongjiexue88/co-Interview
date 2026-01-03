const request = require('supertest');
const app = require('../../src/index'); // Assumes index.js exports app
const { auth } = require('../../src/config/firebase');

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/verify', () => {
        it('should verify token and return user data', async () => {
            const mockToken = 'valid_token';
            const mockDecodedToken = {
                uid: 'user123',
                email: 'test@example.com',
                picture: 'https://example.com/pic.jpg',
                email_verified: true
            };

            auth.verifyIdToken.mockResolvedValue(mockDecodedToken);

            // Mock getUser to return user record if your logic fetches it
            auth.getUser.mockResolvedValue({
                ...mockDecodedToken,
                metadata: { creationTime: new Date().toISOString() }
            });

            const res = await request(app)
                .post('/api/v1/auth/verify')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('user_id', 'user123');
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });

        it('should return 401 for invalid token', async () => {
            auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app)
                .post('/api/v1/auth/verify')
                .set('Authorization', 'Bearer invalid_token');

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 for missing header', async () => {
            const res = await request(app)
                .post('/api/v1/auth/verify');

            expect(res.statusCode).toEqual(401);
        });
    });
});
