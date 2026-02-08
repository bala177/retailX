const { Tenant, User } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../utils/errors");
const logger = require("../utils/logger");
const slugify = require("slugify");

/**
 * Get all tenants (Platform Owner only)
 * GET /api/v1/platform/tenants
 */
const getAllTenants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, industry, search } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (industry) filter.industry = industry;
  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }, { "contact.email": { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [tenants, total] = await Promise.all([Tenant.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)).populate("createdBy", "firstName lastName email"), Tenant.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      tenants,
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
 * Get single tenant by ID
 * GET /api/v1/platform/tenants/:id
 */
const getTenantById = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).populate("createdBy", "firstName lastName email");

  if (!tenant) {
    throw new NotFoundError("Store not found");
  }

  res.json({
    status: "success",
    data: {
      tenant,
    },
  });
});

/**
 * Create new tenant (Store)
 * POST /api/v1/platform/tenants
 */
const createTenant = asyncHandler(async (req, res) => {
  const { name, description, industry, contact, branding, settings, features, seo, socialLinks, ownerEmail, ownerPassword, ownerFirstName, ownerLastName } = req.body;

  // Generate slug
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (await Tenant.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create tenant
  const tenant = await Tenant.create({
    name,
    slug,
    description,
    industry: industry || "general",
    contact,
    branding: branding || {},
    settings: settings || {},
    features: features || {},
    seo,
    socialLinks,
    domains: {
      subdomain: slug,
    },
    status: "active",
    createdBy: req.user._id,
  });

  // Create store owner if credentials provided
  let storeOwner = null;
  if (ownerEmail && ownerPassword) {
    storeOwner = await User.create({
      email: ownerEmail,
      password: ownerPassword,
      firstName: ownerFirstName || "Store",
      lastName: ownerLastName || "Owner",
      role: "store_owner",
      tenant: tenant._id,
      status: "active",
    });
  }

  logger.info(`New tenant created: ${tenant.name} (${tenant.slug})`);

  res.status(201).json({
    status: "success",
    message: "Store created successfully",
    data: {
      tenant,
      storeOwner: storeOwner
        ? {
            id: storeOwner._id,
            email: storeOwner.email,
            firstName: storeOwner.firstName,
            lastName: storeOwner.lastName,
          }
        : null,
    },
  });
});

/**
 * Update tenant
 * PATCH /api/v1/platform/tenants/:id
 */
const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    throw new NotFoundError("Store not found");
  }

  // Fields that can be updated
  const allowedFields = ["name", "description", "industry", "contact", "branding", "settings", "features", "seo", "socialLinks", "payment", "shipping", "status", "plan"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
        // Merge nested objects
        tenant[field] = { ...(tenant[field]?.toObject?.() || {}), ...req.body[field] };
      } else {
        tenant[field] = req.body[field];
      }
    }
  });

  await tenant.save();

  logger.info(`Tenant updated: ${tenant.name} (${tenant.slug})`);

  res.json({
    status: "success",
    message: "Store updated successfully",
    data: {
      tenant,
    },
  });
});

/**
 * Delete tenant (soft delete)
 * DELETE /api/v1/platform/tenants/:id
 */
const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    throw new NotFoundError("Store not found");
  }

  await tenant.softDelete();

  logger.info(`Tenant deleted: ${tenant.name} (${tenant.slug})`);

  res.json({
    status: "success",
    message: "Store deleted successfully",
  });
});

/**
 * Get current tenant info (for store context)
 * GET /api/v1/store/info
 */
const getCurrentTenant = asyncHandler(async (req, res) => {
  if (!req.tenant) {
    throw new NotFoundError("Store not found");
  }

  // Return public tenant info
  const publicInfo = {
    id: req.tenant._id,
    name: req.tenant.name,
    slug: req.tenant.slug,
    description: req.tenant.description,
    industry: req.tenant.industry,
    businessType: req.tenant.businessType || "products",
    serviceSettings: req.tenant.serviceSettings || {},
    branding: req.tenant.branding,
    settings: {
      currency: req.tenant.settings.currency,
      currencySymbol: req.tenant.settings.currencySymbol,
      locale: req.tenant.settings.locale,
      guestCheckout: req.tenant.settings.guestCheckout,
      reviewsEnabled: req.tenant.settings.reviewsEnabled,
      wishlistEnabled: req.tenant.settings.wishlistEnabled,
    },
    contact: {
      email: req.tenant.contact?.email,
      phone: req.tenant.contact?.phone,
      address: req.tenant.contact?.address,
    },
    seo: req.tenant.seo,
    socialLinks: req.tenant.socialLinks,
    shipping: req.tenant.shipping,
    features: req.tenant.features,
  };

  res.json({
    status: "success",
    data: {
      store: publicInfo,
    },
  });
});

/**
 * Update current tenant settings (Store Owner only)
 * PATCH /api/v1/store/settings
 */
const updateCurrentTenantSettings = asyncHandler(async (req, res) => {
  if (!req.tenant) {
    throw new NotFoundError("Store not found");
  }

  // Verify user is store owner of this tenant
  if (req.user.role !== "super_admin" && (req.user.role !== "store_owner" || req.user.tenant.toString() !== req.tenant._id.toString())) {
    throw new ForbiddenError("You do not have permission to update this store");
  }

  const allowedFields = ["name", "description", "contact", "branding", "settings", "features", "seo", "socialLinks", "shipping"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
        req.tenant[field] = { ...(req.tenant[field]?.toObject?.() || {}), ...req.body[field] };
      } else {
        req.tenant[field] = req.body[field];
      }
    }
  });

  await req.tenant.save();

  logger.info(`Store settings updated: ${req.tenant.name}`);

  res.json({
    status: "success",
    message: "Store settings updated successfully",
    data: {
      store: req.tenant,
    },
  });
});

/**
 * Get tenant statistics
 * GET /api/v1/platform/tenants/:id/stats
 */
const getTenantStats = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    throw new NotFoundError("Store not found");
  }

  // Get counts
  const [userCount, productCount, orderCount] = await Promise.all([User.countDocuments({ tenant: tenant._id, status: "active" }), mongoose.model("Product").countDocuments({ tenant: tenant._id, status: "active" }), mongoose.model("Order").countDocuments({ tenant: tenant._id })]);

  res.json({
    status: "success",
    data: {
      stats: {
        ...tenant.stats,
        totalUsers: userCount,
        totalProducts: productCount,
        totalOrders: orderCount,
      },
    },
  });
});

/**
 * Get list of available store templates/industries
 * GET /api/v1/platform/templates
 */
const getStoreTemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      id: "fashion",
      name: "Fashion & Clothing",
      description: "Perfect for clothing, accessories, and fashion brands",
      features: {
        productSize: true,
        productColor: true,
        productMaterial: true,
        productVariants: true,
      },
      branding: {
        primaryColor: "#000000",
        secondaryColor: "#333333",
        accentColor: "#E91E63",
      },
    },
    {
      id: "grocery",
      name: "Grocery & Food",
      description: "Ideal for grocery stores and food products",
      features: {
        productExpiryDate: true,
        productNutrition: true,
        productWeight: true,
      },
      branding: {
        primaryColor: "#4CAF50",
        secondaryColor: "#388E3C",
        accentColor: "#FF9800",
      },
    },
    {
      id: "cosmetics",
      name: "Cosmetics & Beauty",
      description: "Designed for beauty products and skincare",
      features: {
        productIngredients: true,
        productSkinType: true,
        productVariants: true,
      },
      branding: {
        primaryColor: "#E91E63",
        secondaryColor: "#C2185B",
        accentColor: "#9C27B0",
      },
    },
    {
      id: "electronics",
      name: "Electronics & Gadgets",
      description: "Built for electronics and tech products",
      features: {
        productWarranty: true,
        productSpecifications: true,
        productBrand: true,
      },
      branding: {
        primaryColor: "#2196F3",
        secondaryColor: "#1976D2",
        accentColor: "#FF5722",
      },
    },
    {
      id: "stationery",
      name: "Stationery & Office",
      description: "For office supplies and stationery products",
      features: {
        productSKU: true,
        productBrand: true,
        productTags: true,
      },
      branding: {
        primaryColor: "#607D8B",
        secondaryColor: "#455A64",
        accentColor: "#FFC107",
      },
    },
    {
      id: "general",
      name: "General Store",
      description: "Flexible template for any product type",
      features: {
        productVariants: true,
        productSKU: true,
        productBrand: true,
        productTags: true,
      },
      branding: {
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
        accentColor: "#F59E0B",
      },
    },
  ];

  res.json({
    status: "success",
    data: {
      templates,
    },
  });
});

/**
 * Get all active stores for public display (Store Selector)
 * GET /api/v1/stores
 * This is a PUBLIC endpoint - no auth required
 */
const getPublicStores = asyncHandler(async (req, res) => {
  // Only fetch active stores
  const stores = await Tenant.find({ status: "active" }).select("name slug description industry businessType features branding").sort("name");

  // Transform to public-safe format
  const publicStores = stores.map((store) => ({
    id: store._id,
    slug: store.slug,
    name: store.name,
    description: store.description || "",
    industry: store.industry || "general",
    businessType: store.businessType || "products",
    features: {
      bookingEnabled: store.features?.bookingEnabled || false,
      paymentEnabled: store.features?.paymentEnabled || false,
      cartEnabled: store.features?.cartEnabled || false,
    },
    branding: {
      primaryColor: store.branding?.primaryColor || "#6366f1",
      logo: store.branding?.logo || null,
    },
  }));

  res.json({
    status: "success",
    data: {
      stores: publicStores,
      count: publicStores.length,
    },
  });
});

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getCurrentTenant,
  updateCurrentTenantSettings,
  getTenantStats,
  getStoreTemplates,
  getPublicStores,
};
