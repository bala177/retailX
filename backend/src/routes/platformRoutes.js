const express = require("express");
const router = express.Router();
const { tenantController } = require("../controllers");
const { authenticate, superAdminOnly } = require("../middleware");
const { tenantValidation } = require("../middleware/validators");

/**
 * Platform Admin Routes - Super Admin Only
 */

/**
 * @route   GET /api/v1/platform/tenants
 * @desc    Get all tenants
 * @access  Super Admin
 */
router.get("/tenants", authenticate, superAdminOnly, tenantController.getAllTenants);

/**
 * @route   GET /api/v1/platform/tenants/:id
 * @desc    Get tenant by ID
 * @access  Super Admin
 */
router.get("/tenants/:id", authenticate, superAdminOnly, tenantController.getTenantById);

/**
 * @route   POST /api/v1/platform/tenants
 * @desc    Create new tenant
 * @access  Super Admin
 */
router.post("/tenants", authenticate, superAdminOnly, tenantValidation.create, tenantController.createTenant);

/**
 * @route   PATCH /api/v1/platform/tenants/:id
 * @desc    Update tenant
 * @access  Super Admin
 */
router.patch("/tenants/:id", authenticate, superAdminOnly, tenantValidation.update, tenantController.updateTenant);

/**
 * @route   DELETE /api/v1/platform/tenants/:id
 * @desc    Delete tenant (soft delete)
 * @access  Super Admin
 */
router.delete("/tenants/:id", authenticate, superAdminOnly, tenantController.deleteTenant);

/**
 * @route   GET /api/v1/platform/tenants/:id/stats
 * @desc    Get tenant statistics
 * @access  Super Admin
 */
router.get("/tenants/:id/stats", authenticate, superAdminOnly, tenantController.getTenantStats);

/**
 * @route   GET /api/v1/platform/templates
 * @desc    Get available store templates
 * @access  Public
 */
router.get("/templates", tenantController.getStoreTemplates);

module.exports = router;
