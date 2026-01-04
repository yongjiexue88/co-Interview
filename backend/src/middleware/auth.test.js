const authMiddleware = require('./auth');
const { auth } = require('../config/firebase');

// Mock Firebase config
jest.mock('../config/firebase', () => ({
    auth: {
        verifyIdToken: jest.fn(),
    },
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if Authorization header is missing', async () => {
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missing or invalid Authorization header' }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header is malformed (no Bearer)', async () => {
        req.headers.authorization = 'InvalidToken';
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and populate req.user with valid token', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const mockDecodedToken = {
            uid: 'user123',
            email: 'test@example.com',
            email_verified: true,
        };
        auth.verifyIdToken.mockResolvedValue(mockDecodedToken);

        await authMiddleware(req, res, next);

        expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token');
        expect(req.user).toEqual({
            uid: 'user123',
            email: 'test@example.com',
            emailVerified: true,
        });
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid or expired token' }));
        expect(next).not.toHaveBeenCalled();
    });
});
