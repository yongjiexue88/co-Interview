const errorHandler = require('../../src/middleware/errorHandler');
const {
    ApiError,
    PaymentRequiredError,
    ForbiddenError,
    QuotaExceededError,
    ConcurrencyLimitError,
} = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe('Custom API Errors', () => {
        it('should handle ApiError with statusCode', () => {
            const error = new ApiError(400, 'Bad request');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'ApiError',
                message: 'Bad request',
            });
        });

        it('should handle PaymentRequiredError (402)', () => {
            const error = new PaymentRequiredError('Payment required');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(402);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'PaymentRequired',
                message: 'Payment required',
            });
        });

        it('should handle PaymentRequiredError with default message', () => {
            const error = new PaymentRequiredError();

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(402);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'PaymentRequired',
                message: 'Payment required',
            });
        });

        it('should handle ForbiddenError (403)', () => {
            const error = new ForbiddenError('Access denied');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Forbidden',
                message: 'Access denied',
            });
        });

        it('should handle ForbiddenError with default message', () => {
            const error = new ForbiddenError();

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Forbidden',
                message: 'Forbidden',
            });
        });

        it('should handle QuotaExceededError (429)', () => {
            const error = new QuotaExceededError('Quota exceeded');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'QuotaExceeded',
                message: 'Quota exceeded',
            });
        });

        it('should handle QuotaExceededError with default message', () => {
            const error = new QuotaExceededError();

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'QuotaExceeded',
                message: 'Quota exceeded',
            });
        });

        it('should handle ConcurrencyLimitError (429)', () => {
            const error = new ConcurrencyLimitError('Too many sessions');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'ConcurrencyLimit',
                message: 'Too many sessions',
            });
        });

        it('should handle ConcurrencyLimitError with default message', () => {
            const error = new ConcurrencyLimitError();

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'ConcurrencyLimit',
                message: 'Concurrent session limit reached',
            });
        });
    });

    describe('Stripe Errors', () => {
        it('should handle StripeCardError', () => {
            const error = {
                type: 'StripeCardError',
                message: 'Card declined',
            };

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'PaymentError',
                message: 'Card declined',
            });
        });
    });

    describe('Firebase Auth Errors', () => {
        it('should handle Firebase auth errors', () => {
            const error = {
                code: 'auth/invalid-token',
                message: 'Invalid token',
            };

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'AuthError',
                message: 'Invalid token',
            });
        });

        it('should handle Firebase auth/user-not-found', () => {
            const error = {
                code: 'auth/user-not-found',
                message: 'User not found',
            };

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'AuthError',
                message: 'User not found',
            });
        });
    });

    describe('Default 500 Errors', () => {
        it('should handle generic errors in development', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const error = new Error('Something went wrong');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'InternalServerError',
                message: 'Something went wrong',
            });

            process.env.NODE_ENV = originalEnv;
        });

        it('should hide error details in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const error = new Error('Sensitive database error');

            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'InternalServerError',
                message: 'An unexpected error occurred',
            });

            process.env.NODE_ENV = originalEnv;
        });
    });
});

describe('Custom Error Classes', () => {
    describe('ApiError', () => {
        it('should create error with statusCode and message', () => {
            const error = new ApiError(418, "I'm a teapot");

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(418);
            expect(error.message).toBe("I'm a teapot");
            expect(error.name).toBe('ApiError');
        });
    });

    describe('PaymentRequiredError', () => {
        it('should create 402 error', () => {
            const error = new PaymentRequiredError('Need payment');

            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(402);
            expect(error.name).toBe('PaymentRequired');
        });
    });

    describe('ForbiddenError', () => {
        it('should create 403 error', () => {
            const error = new ForbiddenError('No access');

            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(403);
            expect(error.name).toBe('Forbidden');
        });
    });

    describe('QuotaExceededError', () => {
        it('should create 429 error', () => {
            const error = new QuotaExceededError('Too much usage');

            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(429);
            expect(error.name).toBe('QuotaExceeded');
        });
    });

    describe('ConcurrencyLimitError', () => {
        it('should create 429 error', () => {
            const error = new ConcurrencyLimitError('Too many concurrent');

            expect(error).toBeInstanceOf(ApiError);
            expect(error.statusCode).toBe(429);
            expect(error.name).toBe('ConcurrencyLimit');
        });
    });
});
