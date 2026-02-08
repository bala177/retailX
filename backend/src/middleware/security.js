const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Helmet Security Headers
 * Sets various HTTP headers for security
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * General Rate Limiter
 * Limits requests from a single IP
 */
const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Authentication Rate Limiter
 * Stricter limits for login/register endpoints
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    status: "error",
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Password Reset Rate Limiter
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    status: "error",
    message: "Too many password reset attempts. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API Rate Limiter (per tenant)
 * Limits requests per tenant to prevent one tenant from affecting others
 */
const tenantRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute per tenant
  keyGenerator: (req) => {
    // Rate limit by tenant + IP combination
    return `${req.tenant?._id || "public"}-${req.ip}`;
  },
  message: {
    status: "error",
    message: "Rate limit exceeded for this store. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * MongoDB Query Sanitization
 * Prevents NoSQL injection attacks
 */
const sanitizeInput = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    logger.warn(`Sanitized key "${key}" in request from IP: ${req.ip}`);
  },
});

/**
 * HTTP Parameter Pollution Prevention
 * Prevents parameter pollution attacks
 */
const preventParamPollution = hpp({
  whitelist: ["sort", "fields", "page", "limit", "category", "brand", "tags", "price", "status"],
});

/**
 * XSS Protection Middleware
 * Basic XSS protection for request body
 */
const xssProtection = (req, res, next) => {
  if (req.body) {
    const sanitizeValue = (value) => {
      if (typeof value === "string") {
        // Basic XSS prevention - remove script tags and event handlers
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/on\w+="[^"]*"/gi, "")
          .replace(/on\w+='[^']*'/gi, "");
      }
      return value;
    };

    const sanitizeObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === "object") {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return sanitizeValue(obj);
    };

    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Request ID Middleware
 * Adds unique request ID for tracking
 */
const requestId = (req, res, next) => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
};

/**
 * Security Headers Middleware
 * Additional security headers beyond helmet
 */
const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader("X-Powered-By");

  // Add additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  next();
};

/**
 * Log Security Events
 */
const logSecurityEvent = (event, req, details = {}) => {
  logger.warn("Security Event", {
    event,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    path: req.path,
    method: req.method,
    tenant: req.tenant?.slug,
    user: req.user?._id,
    ...details,
  });
};

module.exports = {
  helmetMiddleware,
  generalRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  tenantRateLimiter,
  sanitizeInput,
  preventParamPollution,
  xssProtection,
  requestId,
  securityHeaders,
  logSecurityEvent,
};
