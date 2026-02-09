const { Coupon } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const logger = require("../utils/logger");

/**
 * Get all coupons (Admin)
 * GET /api/v1/store/:tenantSlug/admin/coupons
 */
const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive } = req.query;
  const filter = { tenant: req.tenant._id };
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const skip = (page - 1) * limit;
  const [coupons, total] = await Promise.all([Coupon.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)), Coupon.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      coupons,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * Create a coupon (Admin)
 * POST /api/v1/store/:tenantSlug/admin/coupons
 */
const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, type, value, minOrderAmount, maxDiscountAmount, usageLimit, perUserLimit, startDate, endDate, isActive, isPublic, applicableCategories, applicableProducts } = req.body;

  // Check for duplicate code
  const existing = await Coupon.findOne({ tenant: req.tenant._id, code: code.toUpperCase() });
  if (existing) throw new BadRequestError("Coupon code already exists");

  const coupon = await Coupon.create({
    tenant: req.tenant._id,
    code: code.toUpperCase(),
    description,
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount,
    usageLimit,
    perUserLimit: perUserLimit || 1,
    startDate: startDate || new Date(),
    endDate,
    isActive: isActive !== false,
    isPublic: isPublic || false,
    applicableCategories: applicableCategories || [],
    applicableProducts: applicableProducts || [],
  });

  logger.info(`Coupon created: ${coupon.code} for tenant ${req.tenant.slug}`);

  res.status(201).json({ status: "success", message: "Coupon created", data: { coupon } });
});

/**
 * Update a coupon (Admin)
 * PATCH /api/v1/store/:tenantSlug/admin/coupons/:id
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!coupon) throw new NotFoundError("Coupon not found");

  const allowedFields = ["description", "type", "value", "minOrderAmount", "maxDiscountAmount", "usageLimit", "perUserLimit", "startDate", "endDate", "isActive", "isPublic", "applicableCategories", "applicableProducts"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) coupon[field] = req.body[field];
  });

  await coupon.save();

  res.json({ status: "success", data: { coupon } });
});

/**
 * Delete a coupon (Admin)
 * DELETE /api/v1/store/:tenantSlug/admin/coupons/:id
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, tenant: req.tenant._id });
  if (!coupon) throw new NotFoundError("Coupon not found");

  res.json({ status: "success", message: "Coupon deleted" });
});

/**
 * Validate a coupon code (Public/Customer)
 * POST /api/v1/store/:tenantSlug/coupons/validate
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || typeof code !== "string") {
    throw new BadRequestError("Coupon code is required");
  }

  const coupon = await Coupon.findOne({ tenant: req.tenant._id, code: code.toUpperCase() });
  if (!coupon) throw new NotFoundError("Invalid coupon code");

  const validation = coupon.isValid(orderAmount || 0, req.user?._id);
  if (!validation.valid) throw new BadRequestError(validation.reason);

  const discount = coupon.calculateDiscount(orderAmount || 0);

  res.json({
    status: "success",
    data: {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description,
    },
  });
});

/**
 * Get public/active coupons for the storefront
 * GET /api/v1/store/:tenantSlug/coupons/public
 */
const getPublicCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    tenant: req.tenant._id,
    isActive: true,
    isPublic: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .select("code description type value minOrderAmount endDate")
    .sort("-createdAt");

  res.json({ status: "success", data: { coupons } });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon, getPublicCoupons };
