const { User } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { UnauthorizedError, BadRequestError, NotFoundError } = require("../utils/errors");
const { generateToken, generateRefreshToken, verifyRefreshToken, setTokenCookie, clearTokenCookie } = require("../middleware/auth");
const logger = require("../utils/logger");
const crypto = require("crypto");

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // Determine tenant context - STRICT enforcement for customer registration
  const tenantId = req.tenantId || null;

  // Customers MUST register within a specific store context
  // They cannot register without being associated to a tenant
  if (!tenantId && (!role || role === "customer")) {
    throw new BadRequestError("Customer registration requires a store context. Please register from a specific store.");
  }

  // Check if user exists within this tenant ONLY
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    tenant: tenantId,
  });

  if (existingUser) {
    throw new BadRequestError("An account with this email already exists in this store");
  }

  // Determine user role
  let userRole = "customer";

  // Only super admins and store owners can create store staff
  if (role && ["store_owner", "store_staff"].includes(role)) {
    if (!req.user || !["super_admin", "store_owner"].includes(req.user.role)) {
      throw new UnauthorizedError("You cannot create users with this role");
    }
    userRole = role;
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: userRole,
    tenant: tenantId,
    status: "active",
  });

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  // Set cookie
  setTokenCookie(res, accessToken);

  logger.info(`New user registered: ${user.email} (${user.role})`);

  res.status(201).json({
    status: "success",
    message: "Registration successful",
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const query = { email: email.toLowerCase() };

  // STRICT tenant isolation for login
  if (req.tenantId) {
    // For tenant-specific login:
    // - Customers can ONLY login to their registered store
    // - Super admins can access any store (for management)
    // - Store owners/staff can only access their assigned store
    query.$or = [
      { tenant: req.tenantId }, // Users registered in this store
      { tenant: null, role: "super_admin" }, // Super admin has global access
    ];
  } else {
    // Without tenant context, only allow super_admin
    query.$or = [{ role: "super_admin" }];
  }

  const user = await User.findOne(query).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new UnauthorizedError("Account temporarily locked due to too many failed attempts. Please try again later.");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user is active
  if (user.status !== "active") {
    throw new UnauthorizedError("Your account is not active. Please contact support.");
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  user.lastLoginIP = req.ip;

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token (limit to 5 sessions)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }
  user.refreshTokens.push({
    token: refreshToken,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  await user.save({ validateBeforeSave: false });

  // Set cookie
  setTokenCookie(res, accessToken);

  logger.info(`User logged in: ${user.email}`);

  res.json({
    status: "success",
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        tenant: user.tenant,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (req.user && refreshToken) {
    // Remove refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== refreshToken);
    await req.user.save({ validateBeforeSave: false });
  }

  // Clear cookie
  clearTokenCookie(res);

  logger.info(`User logged out: ${req.user?.email || "anonymous"}`);

  res.json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is required");
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Find user and check if refresh token exists
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken && t.expires > new Date());

  if (!tokenExists) {
    throw new UnauthorizedError("Refresh token not found or expired");
  }

  // Generate new access token
  const accessToken = generateToken(user._id);

  // Set cookie
  setTokenCookie(res, accessToken);

  res.json({
    status: "success",
    data: {
      accessToken,
    },
  });
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("tenant", "name slug branding settings").select("-password -refreshTokens");

  res.json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * Update current user profile
 * PATCH /api/v1/auth/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["firstName", "lastName", "phone", "avatar"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password -refreshTokens");

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

/**
 * Change password
 * PATCH /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new BadRequestError("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  // Generate new tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store new refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  // Set cookie
  setTokenCookie(res, accessToken);

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    status: "success",
    message: "Password changed successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Forgot password - send reset email
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const query = { email: email.toLowerCase() };
  if (req.tenantId) {
    query.tenant = req.tenantId;
  }

  const user = await User.findOne(query);

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      status: "success",
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  // For development, log the token
  logger.info(`Password reset token for ${user.email}: ${resetToken}`);

  res.json({
    status: "success",
    message: "If an account with that email exists, a password reset link has been sent.",
    ...(process.env.NODE_ENV === "development" && { resetToken }),
  });
});

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password/:token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  logger.info(`Password reset for user: ${user.email}`);

  res.json({
    status: "success",
    message: "Password has been reset successfully. Please log in with your new password.",
  });
});

/**
 * Verify email
 * GET /api/v1/auth/verify-email/:token
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired verification token");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for user: ${user.email}`);

  res.json({
    status: "success",
    message: "Email verified successfully",
  });
});

/**
 * Resend verification email
 * POST /api/v1/auth/resend-verification
 */
const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) {
    throw new BadRequestError("Email is already verified");
  }

  const verificationToken = req.user.createEmailVerificationToken();
  await req.user.save({ validateBeforeSave: false });

  // TODO: Send email
  logger.info(`Verification email resent for: ${req.user.email}`);

  res.json({
    status: "success",
    message: "Verification email sent",
    ...(process.env.NODE_ENV === "development" && { verificationToken }),
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
