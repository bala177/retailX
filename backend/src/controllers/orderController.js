const { Order, Product, Cart, Tenant, User } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getTenantFilter } = require("../middleware/tenant");
const logger = require("../utils/logger");

/**
 * Get all orders for tenant (Admin)
 * GET /api/v1/store/:tenantSlug/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, search, startDate, endDate, sortBy = "newest" } = req.query;

  const filter = getTenantFilter(req, { deletedAt: null });

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Payment status filter
  if (paymentStatus) {
    filter["payment.status"] = paymentStatus;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    filter.$or = [{ orderNumber: { $regex: search, $options: "i" } }, { "customerInfo.email": { $regex: search, $options: "i" } }, { "customerInfo.firstName": { $regex: search, $options: "i" } }, { "customerInfo.lastName": { $regex: search, $options: "i" } }];
  }

  // Sorting
  let sort = { createdAt: -1 };
  switch (sortBy) {
    case "oldest":
      sort = { createdAt: 1 };
      break;
    case "total_high":
      sort = { "pricing.total": -1 };
      break;
    case "total_low":
      sort = { "pricing.total": 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([Order.find(filter).sort(sort).skip(skip).limit(parseInt(limit, 10)).populate("customer", "firstName lastName email").select("-items.productSnapshot -statusHistory"), Order.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      orders,
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
 * Get single order by ID
 * GET /api/v1/store/:tenantSlug/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    _id: req.params.id,
    deletedAt: null,
  });

  // If customer, only show their orders
  if (req.user.role === "customer") {
    filter.customer = req.user._id;
  }

  const order = await Order.findOne(filter).populate("customer", "firstName lastName email phone").populate("items.product", "name slug images").populate("statusHistory.updatedBy", "firstName lastName");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  res.json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * Get order by order number
 * GET /api/v1/store/:tenantSlug/orders/number/:orderNumber
 */
const getOrderByNumber = asyncHandler(async (req, res) => {
  const filter = getTenantFilter(req, {
    orderNumber: req.params.orderNumber,
    deletedAt: null,
  });

  const order = await Order.findOne(filter).populate("items.product", "name slug images");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  res.json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * Create order (Checkout)
 * POST /api/v1/store/:tenantSlug/orders
 */
const createOrder = asyncHandler(async (req, res) => {
  const { items, customerInfo, shippingAddress, billingAddress, shippingMethod, paymentMethod, customerNotes, discountCode } = req.body;

  // Validate items and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.product,
      tenant: req.tenantId,
      status: "active",
      deletedAt: null,
    });

    if (!product) {
      throw new BadRequestError(`Product not found: ${item.product}`);
    }

    // Check stock
    if (product.inventory?.trackQuantity) {
      const availableQty = product.hasVariants && item.variant?.sku ? product.variants.find((v) => v.sku === item.variant.sku)?.quantity || 0 : product.inventory.quantity;

      if (availableQty < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product.name}`);
      }
    }

    // Calculate price
    const unitPrice = product.hasVariants && item.variant?.sku ? product.variants.find((v) => v.sku === item.variant.sku)?.price || product.currentPrice : product.currentPrice;

    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        sku: product.inventory?.sku,
        image: product.primaryImage,
      },
      variant: item.variant || null,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
      tax: 0, // Calculate based on tenant settings
    });
  }

  // Get shipping cost
  const shippingCost = req.tenant.shipping?.methods?.find((m) => m.name === shippingMethod)?.price || 0;

  // Apply discount (simplified - should integrate with discount/coupon system)
  let discount = 0;
  if (discountCode) {
    // TODO: Validate discount code
    discount = 0;
  }

  // Calculate tax
  const taxRate = req.tenant.settings?.taxRate || 0;
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;

  // Calculate total
  const total = subtotal - discount + shippingCost + tax;

  // Create order
  const order = await Order.create({
    tenant: req.tenantId,
    customer: req.user?._id || null,
    customerInfo,
    isGuest: !req.user,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress?.sameAsShipping ? { ...shippingAddress, sameAsShipping: true } : billingAddress,
    pricing: {
      subtotal,
      discount,
      discountCode,
      shipping: shippingCost,
      tax,
      total,
      currency: req.tenant.settings?.currency || "USD",
    },
    shipping: {
      method: shippingMethod,
    },
    payment: {
      method: paymentMethod,
      status: "pending",
    },
    status: "pending",
    customerNotes,
    source: "web",
    userAgent: req.get("User-Agent"),
    ipAddress: req.ip,
  });

  // Update product inventory
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        "inventory.quantity": -item.quantity,
        "stats.sales": item.quantity,
      },
    });
  }

  // Clear cart if user logged in
  if (req.user) {
    await Cart.findOneAndUpdate({ tenant: req.tenantId, user: req.user._id, status: "active" }, { status: "converted", convertedToOrder: order._id, convertedAt: new Date() });
  }

  // Update tenant stats
  await Tenant.findByIdAndUpdate(req.tenantId, {
    $inc: { "stats.totalOrders": 1 },
  });

  logger.info(`Order created: ${order.orderNumber} for tenant ${req.tenant.slug}`);

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: {
      order,
    },
  });
});

/**
 * Update order status
 * PATCH /api/v1/store/:tenantSlug/orders/:id/status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  await order.updateStatus(status, note, req.user._id);

  // If cancelled, restore inventory
  if (status === "cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          "inventory.quantity": item.quantity,
          "stats.sales": -item.quantity,
        },
      });
    }
  }

  // If delivered, update revenue
  if (status === "delivered" && order.payment.status === "completed") {
    await Tenant.findByIdAndUpdate(req.tenantId, {
      $inc: { "stats.totalRevenue": order.pricing.total },
    });
  }

  logger.info(`Order ${order.orderNumber} status updated to ${status}`);

  res.json({
    status: "success",
    message: "Order status updated successfully",
    data: {
      order,
    },
  });
});

/**
 * Add tracking information
 * PATCH /api/v1/store/:tenantSlug/orders/:id/tracking
 */
const addTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, trackingUrl, estimatedDelivery } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  order.shipping.trackingNumber = trackingNumber;
  order.shipping.carrier = carrier;
  order.shipping.trackingUrl = trackingUrl;
  if (estimatedDelivery) {
    order.shipping.estimatedDelivery = new Date(estimatedDelivery);
  }

  await order.save();

  logger.info(`Tracking added to order ${order.orderNumber}`);

  res.json({
    status: "success",
    message: "Tracking information added",
    data: {
      order,
    },
  });
});

/**
 * Process refund
 * POST /api/v1/store/:tenantSlug/orders/:id/refund
 */
const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    tenant: req.tenantId,
    deletedAt: null,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.payment.status !== "completed") {
    throw new BadRequestError("Cannot refund an unpaid order");
  }

  if (amount > order.pricing.total - (order.payment.refundedAmount || 0)) {
    throw new BadRequestError("Refund amount exceeds remaining order value");
  }

  await order.processRefund(amount, reason, req.user._id);

  // TODO: Integrate with payment gateway for actual refund

  logger.info(`Refund of ${amount} processed for order ${order.orderNumber}`);

  res.json({
    status: "success",
    message: "Refund processed successfully",
    data: {
      order,
    },
  });
});

/**
 * Get customer's orders
 * GET /api/v1/store/:tenantSlug/orders/my-orders
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = getTenantFilter(req, {
    customer: req.user._id,
    deletedAt: null,
  });

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([Order.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)).populate("items.product", "name slug images").select("-statusHistory -internalNotes"), Order.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      orders,
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
 * Get order statistics
 * GET /api/v1/store/:tenantSlug/orders/stats
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateRange = {};
  if (startDate) dateRange.startDate = startDate;
  if (endDate) dateRange.endDate = endDate;

  const stats = await Order.getStats(req.tenantId, dateRange);

  // Get orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $match: {
        tenant: req.tenantId,
        deletedAt: null,
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get recent orders
  const recentOrders = await Order.find({
    tenant: req.tenantId,
    deletedAt: null,
  })
    .sort("-createdAt")
    .limit(5)
    .select("orderNumber status pricing.total createdAt customerInfo.firstName customerInfo.lastName");

  res.json({
    status: "success",
    data: {
      stats,
      ordersByStatus,
      recentOrders,
    },
  });
});

/**
 * Cancel order (Customer)
 * POST /api/v1/store/:tenantSlug/orders/:id/cancel
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const filter = getTenantFilter(req, {
    _id: req.params.id,
    deletedAt: null,
  });

  // Customers can only cancel their own orders
  if (req.user.role === "customer") {
    filter.customer = req.user._id;
  }

  const order = await Order.findOne(filter);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Only pending or confirmed orders can be cancelled by customers
  if (req.user.role === "customer" && !["pending", "confirmed"].includes(order.status)) {
    throw new BadRequestError("This order cannot be cancelled");
  }

  order.cancellation = {
    reason,
    cancelledBy: req.user._id,
    cancelledAt: new Date(),
  };

  await order.updateStatus("cancelled", reason, req.user._id);

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        "inventory.quantity": item.quantity,
        "stats.sales": -item.quantity,
      },
    });
  }

  logger.info(`Order ${order.orderNumber} cancelled by ${req.user.email}`);

  res.json({
    status: "success",
    message: "Order cancelled successfully",
    data: {
      order,
    },
  });
});

module.exports = {
  getOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  updateOrderStatus,
  addTracking,
  processRefund,
  getMyOrders,
  getOrderStats,
  cancelOrder,
};
