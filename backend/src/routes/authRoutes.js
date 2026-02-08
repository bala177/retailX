const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, authRateLimiter, passwordResetRateLimiter } = require("../middleware");
const { authValidation } = require("../middleware/validators");

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", authRateLimiter, authValidation.register, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", authRateLimiter, authValidation.login, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", authController.refreshAccessToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   PATCH /api/v1/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch("/me", authenticate, authController.updateMe);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.patch("/change-password", authenticate, authValidation.changePassword, authController.changePassword);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post("/forgot-password", passwordResetRateLimiter, authValidation.forgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password/:token", authValidation.resetPassword, authController.resetPassword);

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verify email
 * @access  Public
 */
router.get("/verify-email/:token", authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post("/resend-verification", authenticate, authController.resendVerification);

module.exports = router;
