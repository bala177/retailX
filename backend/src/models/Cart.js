const mongoose = require("mongoose");

/**
 * Cart Schema
 * Shopping cart with tenant isolation
 */
const cartSchema = new mongoose.Schema(
  {
    // Tenant Association (REQUIRED for data isolation)
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
      index: true,
    },

    // User or Session
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },

    // Cart Items
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
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
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Discount
    discountCode: String,
    discount: {
      type: Number,
      default: 0,
    },

    // Totals (denormalized for performance)
    subtotal: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    itemCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "abandoned", "converted", "merged"],
      default: "active",
    },

    // Conversion tracking
    convertedToOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    convertedAt: Date,

    // Abandonment tracking
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    abandonedAt: Date,
    recoveryEmailSent: {
      type: Boolean,
      default: false,
    },

    // Metadata
    notes: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes
cartSchema.index({ tenant: 1, user: 1 });
cartSchema.index({ tenant: 1, sessionId: 1 });
cartSchema.index({ tenant: 1, status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to calculate totals
cartSchema.pre("save", function (next) {
  if (this.isModified("items") || this.isModified("discount")) {
    let subtotal = 0;
    let itemCount = 0;

    this.items.forEach((item) => {
      subtotal += item.price * item.quantity;
      itemCount += item.quantity;
    });

    this.subtotal = Math.round(subtotal * 100) / 100;
    this.itemCount = itemCount;
    this.total = Math.round((subtotal - (this.discount || 0)) * 100) / 100;
    this.lastActivity = new Date();
  }
  next();
});

// Instance method to add item
cartSchema.methods.addItem = async function (productId, quantity = 1, variant = null, price) {
  const existingIndex = this.items.findIndex((item) => {
    const sameProduct = item.product.toString() === productId.toString();
    if (!variant) return sameProduct && !item.variant?.sku;
    return sameProduct && item.variant?.sku === variant.sku;
  });

  if (existingIndex > -1) {
    this.items[existingIndex].quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      variant,
      quantity,
      price,
      addedAt: new Date(),
    });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity, variantSku = null) {
  const item = this.items.find((item) => {
    const sameProduct = item.product.toString() === productId.toString();
    if (!variantSku) return sameProduct && !item.variant?.sku;
    return sameProduct && item.variant?.sku === variantSku;
  });

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, variantSku);
    }
    item.quantity = quantity;
    return this.save();
  }

  return this;
};

// Instance method to remove item
cartSchema.methods.removeItem = async function (productId, variantSku = null) {
  this.items = this.items.filter((item) => {
    const sameProduct = item.product.toString() === productId.toString();
    if (!variantSku) return !sameProduct || item.variant?.sku;
    return !(sameProduct && item.variant?.sku === variantSku);
  });

  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.discount = 0;
  this.discountCode = null;
  return this.save();
};

// Instance method to apply discount
cartSchema.methods.applyDiscount = async function (code, amount) {
  this.discountCode = code;
  this.discount = amount;
  return this.save();
};

// Instance method to merge carts (when guest logs in)
cartSchema.methods.mergeWith = async function (otherCart) {
  otherCart.items.forEach((otherItem) => {
    const existingItem = this.items.find((item) => item.product.toString() === otherItem.product.toString() && item.variant?.sku === otherItem.variant?.sku);

    if (existingItem) {
      existingItem.quantity += otherItem.quantity;
    } else {
      this.items.push(otherItem);
    }
  });

  // Mark the other cart as merged
  otherCart.status = "merged";
  await otherCart.save();

  return this.save();
};

// Instance method to convert to order
cartSchema.methods.markConverted = async function (orderId) {
  this.status = "converted";
  this.convertedToOrder = orderId;
  this.convertedAt = new Date();
  return this.save();
};

// Static method to find or create cart
cartSchema.statics.findOrCreate = async function (tenantId, userId = null, sessionId = null) {
  const query = { tenant: tenantId, status: "active" };

  if (userId) {
    query.user = userId;
  } else if (sessionId) {
    query.sessionId = sessionId;
  } else {
    throw new Error("Either userId or sessionId is required");
  }

  let cart = await this.findOne(query);

  if (!cart) {
    cart = await this.create({
      tenant: tenantId,
      user: userId,
      sessionId,
      items: [],
    });
  }

  return cart;
};

// Static method to find abandoned carts
cartSchema.statics.findAbandoned = function (tenantId, hoursAgo = 24) {
  const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  return this.find({
    tenant: tenantId,
    status: "active",
    "items.0": { $exists: true }, // Has items
    lastActivity: { $lt: cutoffDate },
    recoveryEmailSent: false,
  }).populate("user", "email firstName lastName");
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
