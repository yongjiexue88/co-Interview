/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Custom API errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.name || 'Error',
            message: err.message,
        });
    }

    // Stripe errors
    if (err.type === 'StripeCardError') {
        return res.status(400).json({
            error: 'PaymentError',
            message: err.message,
        });
    }

    // Firebase errors
    if (err.code?.startsWith('auth/')) {
        return res.status(401).json({
            error: 'AuthError',
            message: err.message,
        });
    }

    // Default 500 error
    res.status(500).json({
        error: 'InternalServerError',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
}

// Custom error classes
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

class PaymentRequiredError extends ApiError {
    constructor(message = 'Payment required') {
        super(402, message);
        this.name = 'PaymentRequired';
    }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
        this.name = 'Forbidden';
    }
}

class QuotaExceededError extends ApiError {
    constructor(message = 'Quota exceeded') {
        super(429, message);
        this.name = 'QuotaExceeded';
    }
}

class ConcurrencyLimitError extends ApiError {
    constructor(message = 'Concurrent session limit reached') {
        super(429, message);
        this.name = 'ConcurrencyLimit';
    }
}

module.exports = errorHandler;
module.exports.ApiError = ApiError;
module.exports.PaymentRequiredError = PaymentRequiredError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.QuotaExceededError = QuotaExceededError;
module.exports.ConcurrencyLimitError = ConcurrencyLimitError;
