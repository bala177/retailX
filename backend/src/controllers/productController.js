const { Product, Category, Tenant } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getTenantFilter, validateTenantAccess } = require("../middleware/tenant");
const logger = require("../utils/logger");

/**
 * Get all products for tenant
 * GET /api/v1/store/:tenantSlug/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, search, minPrice, maxPrice, brand, tags, status, inStock, onSale, featured, sort, sortBy = "newest" } = req.query;

  const filter = getTenantFilter(req, { deletedAt: null });

  // Status filter (admin can see all, public sees only active)
  if (req.user?.isStaff?.()) {
    if (status) filter.status = status;
  } else {
    filter.status = "active";
  }

  // Category filter - support both ID and slug
  if (category) {
    // Check if it's a valid ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
    if (isObjectId) {
      filter.category = category;
    } else {
      // It's a slug, find the category first
      const categoryDoc = await Category.findOne({
        tenant: req.tenantId,
        slug: category,
        deletedAt: null,
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // Category not found, return empty results
        return res.json({
          status: "success",
          data: {
            products: [],
            pagination: {
              page: parseInt(page, 10),
              limit: parseInt(limit, 10),
              total: 0,
              pages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    }
  }

  // Search filter
  if (search) {
    // Use regex search instead of $text for more flexibility
    filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }, { brand: { $regex: search, $options: "i" } }, { tags: { $in: [new RegExp(search, "i")] } }];
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter["pricing.basePrice"] = {};
    if (minPrice) filter["pricing.basePrice"].$gte = parseFloat(minPrice);
    if (maxPrice) filter["pricing.basePrice"].$lte = parseFloat(maxPrice);
  }

  // Brand filter
  if (brand) {
    filter.brand = { $regex: brand, $options: "i" };
  }

  // Tags filter
  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }

  // Stock filter
  if (inStock === "true") {
    filter["inventory.stockStatus"] = { $in: ["in_stock", "low_stock"] };
  }

  // Sale filter
  if (onSale === "true") {
    filter.isOnSale = true;
  }

  // Featured filter
  if (featured === "true") {
    filter.isFeatured = true;
  }

  // Sorting - support both sortBy (legacy) and sort (frontend format like "-createdAt")
  let sortObj = { createdAt: -1 };

  // Handle sort parameter from frontend (e.g., "-createdAt", "name", "-pricing.basePrice")
  if (sort) {
    if (sort.startsWith("-")) {
      const field = sort.substring(1);
      sortObj = { [field]: -1 };
    } else {
      sortObj = { [sort]: 1 };
    }
  } else {
    // Fall back to sortBy for legacy support
    switch (sortBy) {
      case "price_asc":
        sortObj = { "pricing.basePrice": 1 };
        break;
      case "price_desc":
        sortObj = { "pricing.basePrice": -1 };
        break;
      case "name_asc":
        sortObj = { name: 1 };
        break;
      case "name_desc":
        sortObj = { name: -1 };
        break;
      case "rating":
        sortObj = { "ratings.average": -1 };
        break;
      case "popularity":
        sortObj = { "stats.sales": -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
    }
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([Product.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit, 10)).populate("category", "name slug").select("-variants -attributes"), Product.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      products,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
});

/**
 * Get single product by slug
 * GET /api/v1/store/:tenantSlug/products/:slug
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    slug: req.params.slug,
    deletedAt: null,
  });

  // Non-admin users can only see active products
  if (!req.user?.isStaff?.()) {
    filter.status = "active";
  }

  const product = await Product.findOne(filter).populate("category", "name slug").populate("subcategory", "name slug").populate("relatedProducts", "name slug images pricing ratings");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, {
    $inc: { "stats.views": 1 },
  });

  res.json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * Get product by ID
 * GET /api/v1/store/:tenantSlug/products/id/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    _id: req.params.id,
    deletedAt: null,
  });

  const product = await Product.findOne(filter).populate("category", "name slug").populate("subcategory", "name slug");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  res.json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * Create product
 * POST /api/v1/store/:tenantSlug/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, shortDescription, category, subcategory, brand, images, pricing, inventory, physical, hasVariants, variantOptions, variants, tags, seo, attributes, fashion, grocery, electronics, cosmetics, status, visibility, isFeatured, isNewArrival, relatedProducts } = req.body;

  // Validate category belongs to tenant
  const categoryDoc = await Category.findOne({
    _id: category,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!categoryDoc) {
    throw new BadRequestError("Invalid category");
  }

  // Create product
  const product = await Product.create({
    tenant: req.tenantId,
    name,
    description,
    shortDescription,
    category,
    subcategory,
    brand,
    images: images || [],
    pricing: pricing || { basePrice: 0 },
    inventory: inventory || {},
    physical: physical || {},
    hasVariants: hasVariants || false,
    variantOptions: variantOptions || [],
    variants: variants || [],
    tags: tags || [],
    seo,
    attributes: attributes || {},
    fashion,
    grocery,
    electronics,
    cosmetics,
    status: status || "draft",
    visibility: visibility || "visible",
    isFeatured: isFeatured || false,
    isNewArrival: isNewArrival || true,
    relatedProducts: relatedProducts || [],
    createdBy: req.user._id,
  });

  // Update category product count
  await Category.updateProductCount(category);

  // Update tenant stats
  await Tenant.findByIdAndUpdate(req.tenantId, {
    $inc: { "stats.totalProducts": 1 },
  });

  logger.info(`Product created: ${product.name} for tenant ${req.tenant.slug}`);

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

/**
 * Update product
 * PATCH /api/v1/store/:tenantSlug/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Allowed fields to update
  const allowedFields = [
    "name",
    "description",
    "shortDescription",
    "category",
    "subcategory",
    "brand",
    "images",
    "pricing",
    "inventory",
    "physical",
    "hasVariants",
    "variantOptions",
    "variants",
    "tags",
    "seo",
    "attributes",
    "fashion",
    "grocery",
    "electronics",
    "cosmetics",
    "status",
    "visibility",
    "isFeatured",
    "isNewArrival",
    "isBestSeller",
    "relatedProducts",
  ];

  const oldCategory = product.category;

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] === "object" && !Array.isArray(req.body[field]) && req.body[field] !== null) {
        product[field] = { ...(product[field]?.toObject?.() || {}), ...req.body[field] };
      } else {
        product[field] = req.body[field];
      }
    }
  });

  product.updatedBy = req.user._id;
  await product.save();

  // Update category counts if category changed
  if (req.body.category && req.body.category !== oldCategory?.toString()) {
    await Promise.all([Category.updateProductCount(oldCategory), Category.updateProductCount(req.body.category)]);
  }

  logger.info(`Product updated: ${product.name}`);

  res.json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

/**
 * Delete product (soft delete)
 * DELETE /api/v1/store/:tenantSlug/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  await product.softDelete();

  // Update category product count
  await Category.updateProductCount(product.category);

  // Update tenant stats
  await Tenant.findByIdAndUpdate(req.tenantId, {
    $inc: { "stats.totalProducts": -1 },
  });

  logger.info(`Product deleted: ${product.name}`);

  res.json({
    status: "success",
    message: "Product deleted successfully",
  });
});

/**
 * Bulk update products
 * PATCH /api/v1/store/:tenantSlug/products/bulk
 */
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, updates } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError("Product IDs are required");
  }

  const allowedBulkFields = ["status", "visibility", "isFeatured", "isNewArrival", "isBestSeller"];
  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedBulkFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const result = await Product.updateMany(
    {
      _id: { $in: ids },
      tenant: req.tenantId,
      deletedAt: null,
    },
    { $set: filteredUpdates },
  );

  logger.info(`Bulk update: ${result.modifiedCount} products updated`);

  res.json({
    status: "success",
    message: `${result.modifiedCount} products updated`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

/**
 * Bulk delete products
 * DELETE /api/v1/store/:tenantSlug/products/bulk
 */
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError("Product IDs are required");
  }

  const result = await Product.updateMany(
    {
      _id: { $in: ids },
      tenant: req.tenantId,
      deletedAt: null,
    },
    {
      $set: {
        deletedAt: new Date(),
        status: "archived",
      },
    },
  );

  logger.info(`Bulk delete: ${result.modifiedCount} products deleted`);

  res.json({
    status: "success",
    message: `${result.modifiedCount} products deleted`,
    data: {
      deletedCount: result.modifiedCount,
    },
  });
});

/**
 * Get featured products
 * GET /api/v1/store/:tenantSlug/products/featured
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find(
    getTenantFilter(req, {
      status: "active",
      isFeatured: true,
      deletedAt: null,
    }),
  )
    .sort("-createdAt")
    .limit(parseInt(limit, 10))
    .populate("category", "name slug")
    .select("name slug images pricing ratings isFeatured isOnSale");

  res.json({
    status: "success",
    data: {
      products,
    },
  });
});

/**
 * Get new arrival products
 * GET /api/v1/store/:tenantSlug/products/new-arrivals
 */
const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find(
    getTenantFilter(req, {
      status: "active",
      isNewArrival: true,
      deletedAt: null,
    }),
  )
    .sort("-createdAt")
    .limit(parseInt(limit, 10))
    .populate("category", "name slug")
    .select("name slug images pricing ratings isNewArrival isOnSale");

  res.json({
    status: "success",
    data: {
      products,
    },
  });
});

/**
 * Get on-sale products
 * GET /api/v1/store/:tenantSlug/products/on-sale
 */
const getOnSaleProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find(
    getTenantFilter(req, {
      status: "active",
      isOnSale: true,
      deletedAt: null,
    }),
  )
    .sort({ "pricing.salePrice": 1 })
    .limit(parseInt(limit, 10))
    .populate("category", "name slug")
    .select("name slug images pricing ratings isOnSale");

  res.json({
    status: "success",
    data: {
      products,
    },
  });
});

/**
 * Get related products
 * GET /api/v1/store/:tenantSlug/products/:id/related
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { limit = 4 } = req.query;

  const product = await Product.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const relatedProducts = await Product.find({
    tenant: req.tenantId,
    _id: { $ne: product._id },
    status: "active",
    deletedAt: null,
    $or: [{ category: product.category }, { tags: { $in: product.tags } }, { brand: product.brand }],
  })
    .limit(parseInt(limit, 10))
    .select("name slug images pricing ratings");

  res.json({
    status: "success",
    data: {
      products: relatedProducts,
    },
  });
});

/**
 * Search products
 * GET /api/v1/store/:tenantSlug/products/search
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new BadRequestError("Search query must be at least 2 characters");
  }

  const filter = getTenantFilter(req, {
    status: "active",
    deletedAt: null,
    $text: { $search: q },
  });

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("category", "name slug")
      .select("name slug images pricing ratings"),
    Product.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    data: {
      products,
      query: q,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts,
  getFeaturedProducts,
  getNewArrivals,
  getOnSaleProducts,
  getRelatedProducts,
  searchProducts,
};
