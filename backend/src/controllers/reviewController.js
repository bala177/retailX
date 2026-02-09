const { Review, Product } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../utils/errors");
const logger = require("../utils/logger");

/**
 * Get reviews for a product
 * GET /api/v1/store/:tenantSlug/products/:productId/reviews
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt", rating } = req.query;
  const filter = { tenant: req.tenant._id, product: req.params.productId, status: "approved" };

  if (rating) filter.rating = parseInt(rating, 10);

  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([Review.find(filter).sort(sort).skip(skip).limit(parseInt(limit, 10)).populate("user", "firstName lastName"), Review.countDocuments(filter)]);

  // Calculate distribution
  const distribution = await Review.aggregate([{ $match: { tenant: req.tenant._id, product: req.params.productId, status: "approved" } }, { $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: -1 } }]);

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach((d) => {
    dist[d._id] = d.count;
  });

  res.json({
    status: "success",
    data: {
      reviews,
      distribution: dist,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * Create a review
 * POST /api/v1/store/:tenantSlug/products/:productId/reviews
 */
const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  // Check if product exists
  const product = await Product.findOne({ _id: req.params.productId, tenant: req.tenant._id });
  if (!product) throw new NotFoundError("Product not found");

  // Check if already reviewed
  const existing = await Review.findOne({ tenant: req.tenant._id, product: req.params.productId, user: req.user._id });
  if (existing) throw new BadRequestError("You have already reviewed this product");

  const review = await Review.create({
    tenant: req.tenant._id,
    product: req.params.productId,
    user: req.user._id,
    rating,
    title,
    comment,
    status: req.tenant.features?.reviewsEnabled ? "approved" : "pending", // Auto-approve if reviews enabled
  });

  await review.populate("user", "firstName lastName");

  logger.info(`Review created for product ${req.params.productId} by user ${req.user._id}`);

  res.status(201).json({
    status: "success",
    message: "Review submitted successfully",
    data: { review },
  });
});

/**
 * Update a review (user can update their own)
 * PATCH /api/v1/store/:tenantSlug/reviews/:id
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!review) throw new NotFoundError("Review not found");

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "store_owner" && req.user.role !== "super_admin") {
    throw new ForbiddenError("You can only edit your own reviews");
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  await review.save();
  await review.populate("user", "firstName lastName");

  res.json({ status: "success", data: { review } });
});

/**
 * Delete a review
 * DELETE /api/v1/store/:tenantSlug/reviews/:id
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!review) throw new NotFoundError("Review not found");

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "store_owner" && req.user.role !== "super_admin") {
    throw new ForbiddenError("You can only delete your own reviews");
  }

  await Review.findOneAndDelete({ _id: req.params.id });

  res.json({ status: "success", message: "Review deleted" });
});

/**
 * Admin: Get all reviews for the store
 * GET /api/v1/store/:tenantSlug/admin/reviews
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, rating } = req.query;
  const filter = { tenant: req.tenant._id };

  if (status) filter.status = status;
  if (rating) filter.rating = parseInt(rating, 10);

  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([Review.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)).populate("user", "firstName lastName email").populate("product", "name slug images"), Review.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      reviews,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * Admin: Update review status
 * PATCH /api/v1/store/:tenantSlug/admin/reviews/:id/status
 */
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status, adminReply } = req.body;
  const review = await Review.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!review) throw new NotFoundError("Review not found");

  if (status) review.status = status;
  if (adminReply) {
    review.adminReply = { comment: adminReply, repliedAt: new Date() };
  }

  await review.save();

  res.json({ status: "success", data: { review } });
});

/**
 * Mark review as helpful
 * POST /api/v1/store/:tenantSlug/reviews/:id/helpful
 */
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate({ _id: req.params.id, tenant: req.tenant._id }, { $inc: { helpful: 1 } }, { new: true });

  if (!review) throw new NotFoundError("Review not found");

  res.json({ status: "success", data: { helpful: review.helpful } });
});

module.exports = { getProductReviews, createReview, updateReview, deleteReview, getAllReviews, updateReviewStatus, markHelpful };
