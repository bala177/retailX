const { Category } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getTenantFilter } = require("../middleware/tenant");
const logger = require("../utils/logger");

/**
 * Get all categories for tenant
 * GET /api/v1/store/:tenantSlug/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, parent, status, flat = false } = req.query;

  const filter = getTenantFilter(req, { deletedAt: null });

  // Status filter
  if (status) {
    filter.status = status;
  } else if (!req.user?.isStaff?.()) {
    filter.status = "active";
  }

  // Parent filter
  if (parent === "null" || parent === "root") {
    filter.parent = null;
  } else if (parent) {
    filter.parent = parent;
  }

  // Return flat list or tree structure
  if (flat === "true" || flat === true) {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([Category.find(filter).sort("displayOrder name").skip(skip).limit(parseInt(limit, 10)).populate("parent", "name slug"), Category.countDocuments(filter)]);

    return res.json({
      status: "success",
      data: {
        categories,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }

  // Return tree structure
  const categories = await Category.getCategoryTree(req.tenantId, status || "active");

  res.json({
    status: "success",
    data: {
      categories,
    },
  });
});

/**
 * Get single category by slug
 * GET /api/v1/store/:tenantSlug/categories/:slug
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    slug: req.params.slug,
    deletedAt: null,
  });

  if (!req.user?.isStaff?.()) {
    filter.status = "active";
  }

  const category = await Category.findOne(filter)
    .populate("parent", "name slug")
    .populate({
      path: "children",
      match: { status: "active", deletedAt: null },
      options: { sort: { displayOrder: 1 } },
    });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  res.json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * Get category by ID
 * GET /api/v1/store/:tenantSlug/categories/id/:id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    _id: req.params.id,
    deletedAt: null,
  });

  const category = await Category.findOne(filter)
    .populate("parent", "name slug")
    .populate({
      path: "children",
      match: { deletedAt: null },
      options: { sort: { displayOrder: 1 } },
    });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  res.json({
    status: "success",
    data: {
      category,
    },
  });
});

/**
 * Create category
 * POST /api/v1/store/:tenantSlug/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, image, icon, seo, displayOrder, showInMenu, showInHomepage, status } = req.body;

  // Validate parent category if provided
  if (parent) {
    const parentCategory = await Category.findOne({
      _id: parent,
      tenant: req.tenantId,
      deletedAt: null,
    });

    if (!parentCategory) {
      throw new BadRequestError("Invalid parent category");
    }
  }

  const category = await Category.create({
    tenant: req.tenantId,
    name,
    description,
    parent: parent || null,
    image,
    icon,
    seo,
    displayOrder: displayOrder || 0,
    showInMenu: showInMenu !== false,
    showInHomepage: showInHomepage || false,
    status: status || "active",
    createdBy: req.user._id,
  });

  logger.info(`Category created: ${category.name} for tenant ${req.tenant.slug}`);

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: {
      category,
    },
  });
});

/**
 * Update category
 * PATCH /api/v1/store/:tenantSlug/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const allowedFields = ["name", "description", "parent", "image", "icon", "seo", "displayOrder", "showInMenu", "showInHomepage", "featuredImage", "status"];

  // Validate parent if changing
  if (req.body.parent !== undefined) {
    if (req.body.parent === null) {
      category.parent = null;
    } else {
      // Cannot set self as parent
      if (req.body.parent === req.params.id) {
        throw new BadRequestError("Category cannot be its own parent");
      }

      const parentCategory = await Category.findOne({
        _id: req.body.parent,
        tenant: req.tenantId,
        deletedAt: null,
      });

      if (!parentCategory) {
        throw new BadRequestError("Invalid parent category");
      }

      // Cannot set a descendant as parent (prevent circular reference)
      const descendants = await Category.getDescendants(req.params.id);
      if (descendants.some((d) => d._id.toString() === req.body.parent)) {
        throw new BadRequestError("Cannot set a child category as parent");
      }

      category.parent = req.body.parent;
    }
  }

  allowedFields.forEach((field) => {
    if (field !== "parent" && req.body[field] !== undefined) {
      if (typeof req.body[field] === "object" && !Array.isArray(req.body[field])) {
        category[field] = { ...(category[field]?.toObject?.() || {}), ...req.body[field] };
      } else {
        category[field] = req.body[field];
      }
    }
  });

  await category.save();

  logger.info(`Category updated: ${category.name}`);

  res.json({
    status: "success",
    message: "Category updated successfully",
    data: {
      category,
    },
  });
});

/**
 * Delete category (soft delete)
 * DELETE /api/v1/store/:tenantSlug/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if category has children
  const childCount = await Category.countDocuments({
    parent: category._id,
    deletedAt: null,
  });

  if (childCount > 0) {
    throw new BadRequestError("Cannot delete category with subcategories. Delete or move subcategories first.");
  }

  // Check if category has products
  const Product = require("../models/Product");
  const productCount = await Product.countDocuments({
    category: category._id,
    deletedAt: null,
  });

  if (productCount > 0) {
    throw new BadRequestError("Cannot delete category with products. Move or delete products first.");
  }

  await category.softDelete();

  logger.info(`Category deleted: ${category.name}`);

  res.json({
    status: "success",
    message: "Category deleted successfully",
  });
});

/**
 * Reorder categories
 * PATCH /api/v1/store/:tenantSlug/categories/reorder
 */
const reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;

  if (!categories || !Array.isArray(categories)) {
    throw new BadRequestError("Categories array is required");
  }

  const bulkOps = categories.map((cat, index) => ({
    updateOne: {
      filter: { _id: cat.id, tenant: req.tenantId },
      update: {
        $set: {
          displayOrder: cat.displayOrder ?? index,
          parent: cat.parent || null,
        },
      },
    },
  }));

  await Category.bulkWrite(bulkOps);

  logger.info(`Categories reordered for tenant ${req.tenant.slug}`);

  res.json({
    status: "success",
    message: "Categories reordered successfully",
  });
});

/**
 * Get menu categories
 * GET /api/v1/store/:tenantSlug/categories/menu
 */
const getMenuCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find(
    getTenantFilter(req, {
      status: "active",
      showInMenu: true,
      parent: null,
      deletedAt: null,
    }),
  )
    .sort("displayOrder name")
    .populate({
      path: "children",
      match: { status: "active", showInMenu: true, deletedAt: null },
      options: { sort: { displayOrder: 1 } },
      populate: {
        path: "children",
        match: { status: "active", showInMenu: true, deletedAt: null },
        options: { sort: { displayOrder: 1 } },
      },
    })
    .select("name slug image icon productCount children");

  res.json({
    status: "success",
    data: {
      categories,
    },
  });
});

/**
 * Get homepage categories
 * GET /api/v1/store/:tenantSlug/categories/homepage
 */
const getHomepageCategories = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const categories = await Category.find(
    getTenantFilter(req, {
      status: "active",
      showInHomepage: true,
      deletedAt: null,
    }),
  )
    .sort("displayOrder")
    .limit(parseInt(limit, 10))
    .select("name slug image featuredImage productCount");

  res.json({
    status: "success",
    data: {
      categories,
    },
  });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getMenuCategories,
  getHomepageCategories,
};
