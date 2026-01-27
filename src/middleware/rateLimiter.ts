import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for tenant creation
export const tenantCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 tenant creations per hour
  message: {
    success: false,
    message: 'Too many tenant creation requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for order creation
export const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 orders per 15 minutes
  message: {
    success: false,
    message: 'Too many order requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
