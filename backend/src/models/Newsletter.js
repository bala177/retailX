const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Unique email per tenant
newsletterSchema.index({ tenant: 1, email: 1 }, { unique: true });

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
module.exports = Newsletter;
