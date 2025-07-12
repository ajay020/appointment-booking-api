import rateLimit from 'express-rate-limit';

// General rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth rate limiter - 5 login attempts per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only apply to specific routes
    skip: (req) => {
        return !req.path.includes('/login') && !req.path.includes('/register');
    }
});

// Booking rate limiter - 20 booking attempts per hour
export const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        error: 'Too many booking attempts from this IP, please try again later.',
        retryAfter: 60 * 60 // 1 hour in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin rate limiter - 200 requests per 15 minutes
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        error: 'Too many admin requests from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    generalLimiter,
    authLimiter,
    bookingLimiter,
    adminLimiter
};