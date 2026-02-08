const express = require("express");
const authRoutes = require("./authRoutes");
const platformRoutes = require("./platformRoutes");
const storeRoutes = require("./storeRoutes");
const superAdminRoutes = require("./superAdminRoutes");
const { tenantController } = require("../controllers");

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "RetailX API is running",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
  });
});

// Public endpoint - Get all active stores (for store selector)
router.get("/stores", tenantController.getPublicStores);

// Auth routes
router.use("/auth", authRoutes);

// Super Admin routes (RetailX platform control - highest level)
router.use("/super-admin", superAdminRoutes);

// Platform admin routes (for managing all tenants)
router.use("/platform", platformRoutes);

// Store routes - supports both header-based (/store/products with x-store-slug header)
// and path-based (/store/urban-fashion/products) tenant resolution
router.use("/store/:tenantSlug", storeRoutes);
router.use("/store", storeRoutes);

module.exports = router;
