import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                 // 10 requests
    message: {
        success: false,
        message: "Too many attempts, try again later"
    }
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100
});

export { apiLimiter, authLimiter };