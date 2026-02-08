const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const { authenticate, superAdminOnly } = require("../middleware");

/**
 * Super Admin Routes - RetailX Platform Control
 * Only super_admin role can access these routes
 * These are for platform owners/developers who control the entire RetailX SaaS
 */

// All routes require super admin authentication
router.use(authenticate);
router.use(superAdminOnly);

/**
 * @route   GET /api/v1/super-admin/dashboard
 * @desc    Get platform dashboard statistics
 * @access  Super Admin Only
 */
router.get("/dashboard", superAdminController.getDashboardStats);

/**
 * @route   GET /api/v1/super-admin/settings
 * @desc    Get platform settings
 * @access  Super Admin Only
 */
router.get("/settings", superAdminController.getPlatformSettings);

// ═══════════════════════════════════════════════════════════════════════════
// STORE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/super-admin/stores
 * @desc    Get all stores with pagination and filtering
 * @access  Super Admin Only
 */
router.get("/stores", superAdminController.getAllStores);

/**
 * @route   GET /api/v1/super-admin/stores/:id
 * @desc    Get store details with users, stats, and configuration
 * @access  Super Admin Only
 */
router.get("/stores/:id", superAdminController.getStoreDetails);

/**
 * @route   PATCH /api/v1/super-admin/stores/:id/features
 * @desc    Update store feature toggles (payment, booking, etc.)
 * @access  Super Admin Only
 */
router.patch("/stores/:id/features", superAdminController.updateStoreFeatures);

/**
 * @route   PATCH /api/v1/super-admin/stores/:id/booking-settings
 * @desc    Update store booking settings
 * @access  Super Admin Only
 */
router.patch("/stores/:id/booking-settings", superAdminController.updateStoreBookingSettings);

/**
 * @route   PATCH /api/v1/super-admin/stores/:id/status
 * @desc    Update store status (activate/suspend/deactivate)
 * @access  Super Admin Only
 */
router.patch("/stores/:id/status", superAdminController.updateStoreStatus);

/**
 * @route   PATCH /api/v1/super-admin/stores/:id/plan
 * @desc    Update store subscription plan
 * @access  Super Admin Only
 */
router.patch("/stores/:id/plan", superAdminController.updateStorePlan);

/**
 * @route   POST /api/v1/super-admin/stores/:id/setup-service
 * @desc    Quick setup for service business (booking only, no payment)
 * @access  Super Admin Only
 */
router.post("/stores/:id/setup-service", superAdminController.setupServiceStore);

/**
 * @route   POST /api/v1/super-admin/stores/:id/setup-products
 * @desc    Quick setup for product business (cart, checkout, optional payment)
 * @access  Super Admin Only
 */
router.post("/stores/:id/setup-products", superAdminController.setupProductStore);

/**
 * @route   DELETE /api/v1/super-admin/stores/:id
 * @desc    Permanently delete store and ALL associated data (products, orders, users, etc.)
 * @access  Super Admin Only
 * @body    { confirmSlug: string } - Must match store slug to confirm deletion
 */
router.delete("/stores/:id", superAdminController.deleteStore);

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/super-admin/users
 * @desc    Get all platform users
 * @access  Super Admin Only
 */
router.get("/users", superAdminController.getAllUsers);

/**
 * @route   POST /api/v1/super-admin/users/store-owner
 * @desc    Create a store owner for a customer you sold RetailX to
 * @access  Super Admin Only
 */
router.post("/users/store-owner", superAdminController.createStoreOwner);

/**
 * @route   PATCH /api/v1/super-admin/users/:id/role
 * @desc    Update user role
 * @access  Super Admin Only
 */
router.patch("/users/:id/role", superAdminController.updateUserRole);

/**
 * @route   PATCH /api/v1/super-admin/users/:id/status
 * @desc    Update user status (activate/suspend)
 * @access  Super Admin Only
 */
router.patch("/users/:id/status", superAdminController.updateUserStatus);

module.exports = router;
