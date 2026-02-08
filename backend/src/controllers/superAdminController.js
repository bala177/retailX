const { Tenant, User, Order, Product, Category } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const logger = require("../utils/logger");

/**
 * Get Platform Dashboard Stats
 * GET /api/v1/super-admin/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalStores, activeStores, totalUsers, totalOrders, totalRevenue, recentStores, storesByIndustry, storesByPlan, usersByRole] = await Promise.all([
    Tenant.countDocuments({}),
    Tenant.countDocuments({ status: "active" }),
    User.countDocuments({}),
    Order.countDocuments({}),
    Order.aggregate([{ $match: { status: { $in: ["delivered", "completed"] } } }, { $group: { _id: null, total: { $sum: "$totals.total" } } }]),
    Tenant.find({}).sort("-createdAt").limit(5).select("name slug industry status createdAt stats"),
    Tenant.aggregate([{ $group: { _id: "$industry", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Tenant.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);

  res.json({
    status: "success",
    data: {
      overview: {
        totalStores,
        activeStores,
        inactiveStores: totalStores - activeStores,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentStores,
      storesByIndustry,
      storesByPlan,
      usersByRole,
    },
  });
});

/**
 * Get All Stores (Enhanced)
 * GET /api/v1/super-admin/stores
 */
const getAllStores = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, industry, businessType, plan, search, sortBy = "-createdAt" } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (industry) filter.industry = industry;
  if (businessType) filter.businessType = businessType;
  if (plan) filter.plan = plan;
  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }, { "contact.email": { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [stores, total] = await Promise.all([Tenant.find(filter).sort(sortBy).skip(skip).limit(parseInt(limit, 10)).populate("createdBy", "firstName lastName email"), Tenant.countDocuments(filter)]);

  // Get store owners for each store
  const storeIds = stores.map((s) => s._id);
  const storeOwners = await User.find({
    tenant: { $in: storeIds },
    role: "store_owner",
  }).select("firstName lastName email tenant");

  // Map owners to stores
  const storesWithOwners = stores.map((store) => {
    const owner = storeOwners.find((o) => o.tenant?.toString() === store._id.toString());
    return {
      ...store.toObject(),
      owner: owner
        ? {
            id: owner._id,
            name: `${owner.firstName} ${owner.lastName}`,
            email: owner.email,
          }
        : null,
    };
  });

  res.json({
    status: "success",
    data: {
      stores: storesWithOwners,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Get Store Details with Full Configuration
 * GET /api/v1/super-admin/stores/:id
 */
const getStoreDetails = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id).populate("createdBy", "firstName lastName email");

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  // Get store users
  const users = await User.find({ tenant: store._id }).select("firstName lastName email role status createdAt lastLogin");

  // Get store stats
  const [productCount, categoryCount, orderCount, customerCount, recentOrders] = await Promise.all([
    Product.countDocuments({ tenant: store._id }),
    Category.countDocuments({ tenant: store._id }),
    Order.countDocuments({ tenant: store._id }),
    User.countDocuments({ tenant: store._id, role: "customer" }),
    Order.find({ tenant: store._id }).sort("-createdAt").limit(5).select("orderNumber status totals createdAt"),
  ]);

  res.json({
    status: "success",
    data: {
      store,
      users,
      stats: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        customers: customerCount,
      },
      recentOrders,
    },
  });
});

/**
 * Update Store Features (Toggle Features On/Off)
 * PATCH /api/v1/super-admin/stores/:id/features
 */
const updateStoreFeatures = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  const { features } = req.body;

  if (!features || typeof features !== "object") {
    throw new BadRequestError("Features object is required");
  }

  // Merge features
  store.features = {
    ...(store.features?.toObject?.() || store.features || {}),
    ...features,
  };

  await store.save();

  logger.info(`Store features updated: ${store.name} (${store.slug}) by super admin`);

  res.json({
    status: "success",
    message: "Store features updated successfully",
    data: {
      store,
    },
  });
});

/**
 * Update Store Booking Settings
 * PATCH /api/v1/super-admin/stores/:id/booking-settings
 */
const updateStoreBookingSettings = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  const { bookingSettings } = req.body;

  if (!bookingSettings || typeof bookingSettings !== "object") {
    throw new BadRequestError("Booking settings object is required");
  }

  // Merge booking settings
  store.bookingSettings = {
    ...(store.bookingSettings?.toObject?.() || store.bookingSettings || {}),
    ...bookingSettings,
  };

  await store.save();

  logger.info(`Store booking settings updated: ${store.name} by super admin`);

  res.json({
    status: "success",
    message: "Booking settings updated successfully",
    data: {
      store,
    },
  });
});

/**
 * Update Store Status (Activate/Suspend/Deactivate)
 * PATCH /api/v1/super-admin/stores/:id/status
 */
const updateStoreStatus = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  const { status, reason } = req.body;

  if (!["active", "inactive", "suspended", "pending"].includes(status)) {
    throw new BadRequestError("Invalid status");
  }

  const previousStatus = store.status;
  store.status = status;
  await store.save();

  logger.info(`Store status changed: ${store.name} from ${previousStatus} to ${status}. Reason: ${reason || "Not specified"}`);

  res.json({
    status: "success",
    message: `Store ${status === "active" ? "activated" : status === "suspended" ? "suspended" : "deactivated"} successfully`,
    data: {
      store,
    },
  });
});

/**
 * Update Store Plan
 * PATCH /api/v1/super-admin/stores/:id/plan
 */
const updateStorePlan = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  const { plan, expiresAt } = req.body;

  if (!["free", "starter", "professional", "enterprise"].includes(plan)) {
    throw new BadRequestError("Invalid plan");
  }

  const previousPlan = store.plan;
  store.plan = plan;
  if (expiresAt) {
    store.planExpiresAt = new Date(expiresAt);
  }
  await store.save();

  logger.info(`Store plan changed: ${store.name} from ${previousPlan} to ${plan}`);

  res.json({
    status: "success",
    message: "Store plan updated successfully",
    data: {
      store,
    },
  });
});

/**
 * Get All Platform Users
 * GET /api/v1/super-admin/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search, tenantId } = req.query;

  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (tenantId) filter.tenant = tenantId;
  if (search) {
    filter.$or = [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([User.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)).populate("tenant", "name slug").select("-password -refreshTokens"), User.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      users,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Create Store Owner (when you sell RetailX to a new customer)
 * POST /api/v1/super-admin/users/store-owner
 */
const createStoreOwner = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, tenantId } = req.body;

  if (!tenantId) {
    throw new BadRequestError("Store (tenant) ID is required to create a store owner");
  }

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new NotFoundError("Store not found");
  }

  // Check if user already exists for this tenant
  const existingUser = await User.findOne({ email: email.toLowerCase(), tenant: tenantId });
  if (existingUser) {
    throw new BadRequestError("A user with this email already exists for this store");
  }

  // Check if store already has an owner
  const existingOwner = await User.findOne({ tenant: tenantId, role: "store_owner" });
  if (existingOwner) {
    throw new BadRequestError(`This store already has an owner: ${existingOwner.email}`);
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: "store_owner",
    tenant: tenantId,
    status: "active",
    emailVerified: true,
  });

  logger.info(`Store owner created: ${user.email} for store ${tenant.name} by super admin`);

  res.status(201).json({
    status: "success",
    message: `Store owner created for ${tenant.name}`,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
        },
      },
    },
  });
});

/**
 * Update User Role
 * PATCH /api/v1/super-admin/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Cannot modify super_admin role
  if (user.role === "super_admin") {
    throw new BadRequestError("Cannot modify super admin role");
  }

  const { role, tenantId } = req.body;

  if (!["store_owner", "store_staff", "customer"].includes(role)) {
    throw new BadRequestError("Invalid role. Must be store_owner, store_staff, or customer");
  }

  // All store-level roles require tenant
  if (!tenantId && !user.tenant) {
    throw new BadRequestError("Tenant ID is required for store-level roles");
  }

  const previousRole = user.role;
  user.role = role;

  if (tenantId) {
    user.tenant = tenantId;
  }

  await user.save();

  logger.info(`User role changed: ${user.email} from ${previousRole} to ${role}`);

  res.json({
    status: "success",
    message: "User role updated successfully",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
    },
  });
});

/**
 * Suspend/Activate User
 * PATCH /api/v1/super-admin/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Cannot modify super_admin
  if (user.role === "super_admin") {
    throw new BadRequestError("Cannot modify super admin status");
  }

  const { status, reason } = req.body;

  if (!["active", "inactive", "suspended"].includes(status)) {
    throw new BadRequestError("Invalid status");
  }

  const previousStatus = user.status;
  user.status = status;
  await user.save();

  logger.info(`User status changed: ${user.email} from ${previousStatus} to ${status}. Reason: ${reason || "Not specified"}`);

  res.json({
    status: "success",
    message: `User ${status === "active" ? "activated" : status === "suspended" ? "suspended" : "deactivated"} successfully`,
    data: {
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    },
  });
});

/**
 * Get Platform Settings
 * GET /api/v1/super-admin/settings
 */
const getPlatformSettings = asyncHandler(async (req, res) => {
  // This could be stored in a separate Settings collection
  // For now, return configurable defaults
  res.json({
    status: "success",
    data: {
      settings: {
        platformName: "RetailX",
        allowNewStoreRegistration: true,
        defaultStorePlan: "free",
        defaultStoreFeatures: {
          paymentEnabled: true,
          cartEnabled: true,
          bookingEnabled: false,
          shippingEnabled: true,
          inventoryEnabled: true,
          customerAccountsEnabled: true,
        },
        supportedIndustries: ["fashion", "grocery", "cosmetics", "electronics", "stationery", "general", "wellness", "healthcare", "other"],
        supportedBusinessTypes: ["products", "services", "hybrid"],
        availablePlans: [
          { id: "free", name: "Free", maxProducts: 50, maxOrders: 100, price: 0 },
          { id: "starter", name: "Starter", maxProducts: 500, maxOrders: 1000, price: 29 },
          { id: "professional", name: "Professional", maxProducts: 5000, maxOrders: 10000, price: 79 },
          { id: "enterprise", name: "Enterprise", maxProducts: -1, maxOrders: -1, price: 199 },
        ],
      },
    },
  });
});

/**
 * Quick Setup Store for Service Business (e.g., Spa)
 * POST /api/v1/super-admin/stores/:id/setup-service
 */
const setupServiceStore = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  // Configure for service business with booking and no payment
  store.businessType = "services";
  store.features = {
    ...(store.features?.toObject?.() || {}),
    // Disable payment and cart for simple booking flow
    paymentEnabled: false,
    cartEnabled: false,
    guestCheckoutEnabled: false,
    shippingEnabled: false,

    // Enable booking
    bookingEnabled: true,
    bookingRequiresPayment: false,
    bookingAllowCancellation: true,
    bookingReminderEnabled: true,

    // Enable customer accounts
    customerAccountsEnabled: true,
    customerAccountRequired: false,

    // Disable product-specific features
    productVariants: false,
    productSKU: false,
    productWeight: false,
    productDimensions: false,
    inventoryEnabled: false,

    // Keep basic features
    reviewsEnabled: true,
    wishlistEnabled: false,
    discountsEnabled: false,
    couponsEnabled: false,
  };

  // Set default booking settings
  store.bookingSettings = {
    workingHours: store.bookingSettings?.workingHours || {
      monday: { start: "09:00", end: "18:00", enabled: true },
      tuesday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      thursday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
      saturday: { start: "10:00", end: "16:00", enabled: true },
      sunday: { start: "10:00", end: "14:00", enabled: false },
    },
    slotDuration: 60,
    bufferTime: 15,
    advanceBookingDays: 30,
    minAdvanceHours: 24,
    cancellationHours: 24,
    confirmationRequired: true,
    phoneNumber: store.contact?.phone || "",
    confirmationMessage: "Thank you for your booking! Please call us to confirm your appointment.",
  };

  await store.save();

  logger.info(`Store configured for service business: ${store.name}`);

  res.json({
    status: "success",
    message: "Store configured for service business (booking only, no payment)",
    data: {
      store,
    },
  });
});

/**
 * Quick Setup Store for Product Business
 * POST /api/v1/super-admin/stores/:id/setup-products
 */
const setupProductStore = asyncHandler(async (req, res) => {
  const store = await Tenant.findById(req.params.id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  const { paymentEnabled = true } = req.body;

  // Configure for product business
  store.businessType = "products";
  store.features = {
    ...(store.features?.toObject?.() || {}),
    // Enable payment and cart
    paymentEnabled,
    cartEnabled: true,
    guestCheckoutEnabled: true,
    shippingEnabled: true,

    // Disable booking
    bookingEnabled: false,

    // Enable inventory
    inventoryEnabled: true,

    // Enable customer accounts
    customerAccountsEnabled: true,
    customerAccountRequired: false,

    // Enable product features
    productVariants: true,
    productSKU: true,
    productWeight: true,

    // Enable commerce features
    reviewsEnabled: true,
    wishlistEnabled: true,
    discountsEnabled: true,
    couponsEnabled: true,
  };

  await store.save();

  logger.info(`Store configured for product business: ${store.name}`);

  res.json({
    status: "success",
    message: `Store configured for product business ${paymentEnabled ? "with" : "without"} payment`,
    data: {
      store,
    },
  });
});

const Cart = require("../models/Cart");

/**
 * Delete Store Completely
 * DELETE /api/v1/super-admin/stores/:id
 * This will permanently delete the store and ALL associated data:
 * - All products
 * - All categories
 * - All orders
 * - All users (customers, staff, owner)
 * - All carts
 * - The store/tenant record itself
 */
const deleteStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { confirmSlug } = req.body;

  const store = await Tenant.findById(id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  // Require confirmation by typing the store slug
  if (!confirmSlug || confirmSlug !== store.slug) {
    throw new BadRequestError(`To confirm deletion, please provide the store slug: "${store.slug}"`);
  }

  const storeName = store.name;
  const storeSlug = store.slug;

  logger.warn(`Starting complete deletion of store: ${storeName} (${storeSlug}) by super admin`);

  // Delete all related data in parallel for efficiency
  const deletionResults = await Promise.all([
    // Delete all products for this store
    Product.deleteMany({ tenant: id }),
    // Delete all categories for this store
    Category.deleteMany({ tenant: id }),
    // Delete all orders for this store
    Order.deleteMany({ tenant: id }),
    // Delete all users associated with this store (customers, staff, owner)
    User.deleteMany({ tenant: id }),
    // Delete all carts for this store
    Cart.deleteMany({ tenant: id }),
  ]);

  const [productsDeleted, categoriesDeleted, ordersDeleted, usersDeleted, cartsDeleted] = deletionResults;

  // Finally, delete the store/tenant record itself
  await Tenant.findByIdAndDelete(id);

  const summary = {
    store: { name: storeName, slug: storeSlug },
    deleted: {
      products: productsDeleted.deletedCount,
      categories: categoriesDeleted.deletedCount,
      orders: ordersDeleted.deletedCount,
      users: usersDeleted.deletedCount,
      carts: cartsDeleted.deletedCount,
    },
  };

  logger.warn(`Store completely deleted: ${storeName} (${storeSlug}). Summary: ${JSON.stringify(summary.deleted)}`);

  res.json({
    status: "success",
    message: `Store "${storeName}" and all its data have been permanently deleted`,
    data: summary,
  });
});

module.exports = {
  getDashboardStats,
  getAllStores,
  getStoreDetails,
  updateStoreFeatures,
  updateStoreBookingSettings,
  updateStoreStatus,
  updateStorePlan,
  getAllUsers,
  createStoreOwner,
  updateUserRole,
  updateUserStatus,
  getPlatformSettings,
  setupServiceStore,
  setupProductStore,
  deleteStore,
};
