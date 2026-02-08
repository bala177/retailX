const mongoose = require("mongoose");
const { generateOrderNumber } = require("../utils/helpers");

/**
 * Order Schema
 * Complete order lifecycle with tenant isolation
 */
const orderSchema = new mongoose.Schema(
  {
    // Tenant Association (REQUIRED for data isolation)
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
      index: true,
    },

    // Order Identification
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // Customer Information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customerInfo: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
      },
      phone: String,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },

    // Order Items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productSnapshot: {
          name: String,
          slug: String,
          sku: String,
          image: String,
        },
        variant: {
          options: {
            type: Map,
            of: String,
          },
          sku: String,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        tax: {
          type: Number,
          default: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Addresses
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      apartment: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    billingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      apartment: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
      sameAsShipping: {
        type: Boolean,
        default: true,
      },
    },

    // Pricing Summary
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      discountCode: String,
      discountDescription: String,
      shipping: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
    },

    // Shipping
    shipping: {
      method: String,
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      shippedAt: Date,
    },

    // Payment
    payment: {
      method: {
        type: String,
        enum: ["stripe", "paypal", "razorpay", "cod", "bank_transfer"],
      },
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "refunded", "partially_refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      refundedAmount: {
        type: Number,
        default: 0,
      },
      refundedAt: Date,
      paymentDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },

    // Order Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "on_hold"],
      default: "pending",
      index: true,
    },

    // Status History
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Notes
    customerNotes: String,
    internalNotes: String,

    // Fulfillment
    fulfillment: {
      status: {
        type: String,
        enum: ["unfulfilled", "partial", "fulfilled"],
        default: "unfulfilled",
      },
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantityFulfilled: Number,
          fulfilledAt: Date,
        },
      ],
    },

    // Source
    source: {
      type: String,
      enum: ["web", "mobile", "admin", "api"],
      default: "web",
    },
    userAgent: String,
    ipAddress: String,

    // Flags
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPriority: {
      type: Boolean,
      default: false,
    },

    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // Cancellation
    cancellation: {
      reason: String,
      note: String,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancelledAt: Date,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes
orderSchema.index({ tenant: 1, orderNumber: 1 });
orderSchema.index({ tenant: 1, customer: 1 });
orderSchema.index({ tenant: 1, status: 1, createdAt: -1 });
orderSchema.index({ tenant: 1, "payment.status": 1 });
orderSchema.index({ tenant: 1, createdAt: -1 });
orderSchema.index({ "customerInfo.email": 1 });

// Virtual for item count
orderSchema.virtual("itemCount").get(function () {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    // Get tenant slug for prefix
    const Tenant = mongoose.model("Tenant");
    const tenant = await Tenant.findById(this.tenant);
    const prefix = tenant?.slug?.substring(0, 3).toUpperCase() || "ORD";
    this.orderNumber = generateOrderNumber(prefix);
  }
  next();
});

// Pre-save middleware to add status to history
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      createdAt: new Date(),
    });
  }
  next();
});

// Post-save middleware to update tenant stats
orderSchema.post("save", async function () {
  if (this.status === "delivered" && this.payment?.status === "completed") {
    const Tenant = mongoose.model("Tenant");
    await Tenant.findByIdAndUpdate(this.tenant, {
      $inc: {
        "stats.totalOrders": 1,
        "stats.totalRevenue": this.pricing.total,
      },
    });
  }
});

// Instance method to update status
orderSchema.methods.updateStatus = async function (newStatus, note, userId) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy: userId,
    createdAt: new Date(),
  });

  // Update related timestamps
  switch (newStatus) {
    case "shipped":
      this.shipping.shippedAt = new Date();
      break;
    case "delivered":
      this.shipping.actualDelivery = new Date();
      this.fulfillment.status = "fulfilled";
      break;
    case "cancelled":
      this.cancellation.cancelledAt = new Date();
      this.cancellation.cancelledBy = userId;
      break;
  }

  return this.save();
};

// Instance method to add tracking
orderSchema.methods.addTracking = async function (trackingNumber, carrier, trackingUrl) {
  this.shipping.trackingNumber = trackingNumber;
  this.shipping.carrier = carrier;
  this.shipping.trackingUrl = trackingUrl;
  return this.save();
};

// Instance method to process refund
orderSchema.methods.processRefund = async function (amount, reason, userId) {
  this.payment.refundedAmount = (this.payment.refundedAmount || 0) + amount;
  this.payment.refundedAt = new Date();

  if (this.payment.refundedAmount >= this.pricing.total) {
    this.payment.status = "refunded";
    this.status = "refunded";
  } else {
    this.payment.status = "partially_refunded";
  }

  this.statusHistory.push({
    status: `Refund: $${amount}`,
    note: reason,
    updatedBy: userId,
    createdAt: new Date(),
  });

  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getStats = async function (tenantId, dateRange = {}) {
  const matchStage = {
    tenant: tenantId,
    deletedAt: null,
  };

  if (dateRange.startDate) {
    matchStage.createdAt = { $gte: new Date(dateRange.startDate) };
  }
  if (dateRange.endDate) {
    matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(dateRange.endDate) };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ["$payment.status", "completed"] }, "$pricing.total", 0],
          },
        },
        averageOrderValue: {
          $avg: {
            $cond: [{ $eq: ["$payment.status", "completed"] }, "$pricing.total", null],
          },
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    }
  );
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function (tenantId, status) {
  return this.find({
    tenant: tenantId,
    status,
    deletedAt: null,
  })
    .sort("-createdAt")
    .populate("customer", "firstName lastName email");
};

// Soft delete
orderSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.isArchived = true;
  return this.save();
};

// Query middleware to exclude soft deleted
orderSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
