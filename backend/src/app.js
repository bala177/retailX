const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");

const config = require("./config");
const routes = require("./routes");
const { helmetMiddleware, generalRateLimiter, sanitizeInput, preventParamPollution, xssProtection, requestId, securityHeaders, resolveTenant, tenantScope, errorHandler, notFound } = require("./middleware");
const logger = require("./utils/logger");

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
// CORS - must be before other middleware
app.use(cors(config.cors));

// Security middleware
app.use(helmetMiddleware);
app.use(securityHeaders);
app.use(requestId);

// Rate limiting
app.use("/api/", generalRateLimiter);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization
app.use(sanitizeInput);
app.use(xssProtection);
app.use(preventParamPollution);

// Compression
app.use(compression());

// Request logging
if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: logger.stream }));
}

// Session ID middleware for guest carts
app.use((req, res, next) => {
  req.sessionId = req.cookies?.cartSession || null;
  next();
});

// Tenant resolution middleware
app.use(resolveTenant);
app.use(tenantScope);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Favicon handler (ignore browser favicon requests)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// API routes
app.use("/api/v1", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "RetailX Platform API",
    version: "1.0.0",
    description: "Multi-tenant eCommerce platform API",
    documentation: "/api/v1/docs",
    health: "/api/v1/health",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
