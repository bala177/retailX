require("dotenv").config();

module.exports = {
  // Server
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || "v1",

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/retailx",
    testUri: process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/retailx_test",
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  },

  // Password Reset
  passwordReset: {
    expiresMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES, 10) || 10,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5001", "http://localhost:5002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-store-slug", "X-Tenant-ID", "X-Request-ID"],
    exposedHeaders: ["X-Request-ID"],
    maxAge: 86400, // Cache preflight for 24 hours
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    path: process.env.UPLOAD_PATH || "./uploads",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "noreply@retailx.com",
  },

  // Platform
  platform: {
    name: process.env.PLATFORM_NAME || "RetailX",
    url: process.env.PLATFORM_URL || "http://localhost:5000",
    adminUrl: process.env.ADMIN_URL || "http://localhost:3001",
    storefrontUrl: process.env.STOREFRONT_URL || "http://localhost:3000",
  },

  // Tenant Resolution
  tenant: {
    resolutionMode: process.env.TENANT_RESOLUTION_MODE || "path", // subdomain | path | header
    headerName: "X-Tenant-ID",
  },

  // Default Platform Owner
  platformOwner: {
    email: process.env.PLATFORM_OWNER_EMAIL || "admin@retailx.com",
    password: process.env.PLATFORM_OWNER_PASSWORD || "Admin@123456",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    file: process.env.LOG_FILE || "./logs/app.log",
  },

  // Security
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    sessionSecret: process.env.SESSION_SECRET || "dev-session-secret",
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION || "us-east-1",
  },

  // Payment
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};
