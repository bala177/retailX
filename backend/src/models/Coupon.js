const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "Coupon expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false, // Public coupons can be shown on storefront
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: unique code per tenant
couponSchema.index({ tenant: 1, code: 1 }, { unique: true });
couponSchema.index({ tenant: 1, isActive: 1, startDate: 1, endDate: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function (orderAmount, userId) {
  const now = new Date();

  if (!this.isActive) return { valid: false, reason: "Coupon is inactive" };
  if (now < this.startDate) return { valid: false, reason: "Coupon is not yet active" };
  if (now > this.endDate) return { valid: false, reason: "Coupon has expired" };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, reason: "Coupon usage limit reached" };
  if (this.minOrderAmount && orderAmount < this.minOrderAmount) return { valid: false, reason: `Minimum order amount is $${this.minOrderAmount}` };

  if (userId && this.perUserLimit) {
    const userUses = this.usedBy.filter((u) => u.user.toString() === userId.toString()).length;
    if (userUses >= this.perUserLimit) return { valid: false, reason: "You have already used this coupon" };
  }

  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.type === "percentage") {
    discount = (orderAmount * this.value) / 100;
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = Math.min(this.value, orderAmount);
  }

  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
