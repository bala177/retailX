const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Extract token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Or from cookie
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError("Authentication required. Please log in.");
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new UnauthorizedError("Your account is not active");
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError("Password recently changed. Please log in again.");
    }

    // Tenant validation for non-platform users
    // Only super_admin has global access (you/Synexon platform owner)
    if (user.role !== "super_admin" && req.tenant) {
      // Ensure user belongs to the current tenant
      if (user.tenant && user.tenant.toString() !== req.tenant._id.toString()) {
        throw new ForbiddenError("Access denied to this store");
      }
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expired. Please log in again."));
    }
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (user && user.status === "active") {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // Continue without user on token errors
    logger.debug("Optional auth failed:", error.message);
    next();
  }
};

/**
 * Authorize Roles Middleware
 * Restricts access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }

    next();
  };
};

/**
 * Authorize Permissions Middleware
 * Checks if user has specific permissions
 */
const authorizePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Super admins and store owners have all permissions
    if (["super_admin", "store_owner"].includes(req.user.role)) {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = permissions.some((permission) => req.user.hasPermission(permission));

    if (!hasPermission) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }

    next();
  };
};

/**
 * Super Admin Only Middleware
 * Only super_admin can access (for RetailX platform configuration)
 */
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (req.user.role !== "super_admin") {
    return next(new ForbiddenError("This action is restricted to RetailX super administrators only"));
  }

  next();
};

/**
 * Store Admin Only Middleware
 * Allows super admins and store owners
 */
const storeAdminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (!["super_admin", "store_owner"].includes(req.user.role)) {
    return next(new ForbiddenError("This action is restricted to store administrators"));
  }

  next();
};

/**
 * Store Staff Only Middleware
 * Allows super admins, store owners, and store staff
 */
const storeStaffOnly = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  if (!["super_admin", "store_owner", "store_staff"].includes(req.user.role)) {
    return next(new ForbiddenError("This action is restricted to store staff"));
  }

  next();
};

/**
 * Own Resource or Admin Middleware
 * Allows users to access their own resources or admins to access any
 */
const ownResourceOrAdmin = (paramName = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const resourceId = req.params[paramName];
    const isOwnResource = req.user._id.toString() === resourceId;
    const isAdmin = ["super_admin", "store_owner"].includes(req.user.role);

    if (!isOwnResource && !isAdmin) {
      return next(new ForbiddenError("Access denied"));
    }

    next();
  };
};

/**
 * Generate JWT Token
 */
const generateToken = (userId, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Set Cookie with Token
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
  };

  res.cookie("jwt", token, cookieOptions);
};

/**
 * Clear Token Cookie
 */
const clearTokenCookie = (res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
};

module.exports = {
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
};
