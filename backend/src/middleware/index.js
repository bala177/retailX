const { resolveTenant, requireTenant, tenantScope, getTenantFilter, validateTenantAccess } = require("./tenant");
const { authenticate, optionalAuth, authorize, authorizePermission, superAdminOnly, storeAdminOnly, storeStaffOnly, ownResourceOrAdmin, generateToken, generateRefreshToken, verifyRefreshToken, setTokenCookie, clearTokenCookie } = require("./auth");
const { errorHandler, notFound, asyncHandler } = require("./errorHandler");
const { helmetMiddleware, generalRateLimiter, authRateLimiter, passwordResetRateLimiter, tenantRateLimiter, sanitizeInput, preventParamPollution, xssProtection, requestId, securityHeaders, logSecurityEvent } = require("./security");
const { handleValidation, validators, authValidation, tenantValidation, productValidation, categoryValidation, orderValidation, cartValidation } = require("./validators");

module.exports = {
  // Tenant
  resolveTenant,
  requireTenant,
  tenantScope,
  getTenantFilter,
  validateTenantAccess,

  // Auth
  authenticate,
  optionalAuth,
  authorize,
  authorizePermission,
  superAdminOnly,
  storeAdminOnly,
  storeStaffOnly,
  ownResourceOrAdmin,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookie,
  clearTokenCookie,

  // Error Handling
  errorHandler,
  notFound,
  asyncHandler,

  // Security
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

  // Validators
  handleValidation,
  validators,
  authValidation,
  tenantValidation,
  productValidation,
  categoryValidation,
  orderValidation,
  cartValidation,
};
