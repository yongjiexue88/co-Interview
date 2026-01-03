const authMiddleware = require('../../src/middleware/auth');
const { auth } = require('../../src/config/firebase');

// Mock next function
const mockNext = jest.fn();

// Mock response object
const mockRes = (() => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
})();

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should call next() if valid token is provided', async () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer valid_token',
            },
        };

        auth.verifyIdToken.mockResolvedValue({
            uid: 'user123',
            email: 'test@example.com',
            email_verified: true,
        });

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(auth.verifyIdToken).toHaveBeenCalledWith('valid_token');
        expect(mockReq.user).toEqual({
            uid: 'user123',
            email: 'test@example.com',
            emailVerified: true,
        });
        expect(mockNext).toHaveBeenCalled();
    });

    test('should return 401 if authorization header is missing', async () => {
        const mockReq = {
            headers: {},
        };

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if token is invalid', async () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer invalid_token',
            },
        };

        auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(auth.verifyIdToken).toHaveBeenCalledWith('invalid_token');
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        }));
        expect(mockNext).not.toHaveBeenCalled();
    });
});
