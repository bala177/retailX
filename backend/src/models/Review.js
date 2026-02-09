const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: 2000,
    },
    images: [String],
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminReply: {
      comment: String,
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index: one review per user per product per tenant
reviewSchema.index({ tenant: 1, product: 1, user: 1 }, { unique: true });
reviewSchema.index({ tenant: 1, status: 1, createdAt: -1 });

// Static: get average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId, tenantId) {
  const stats = await this.aggregate([
    { $match: { product: productId, tenant: tenantId, status: "approved" } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
        distribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (stats.length > 0) {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats[0].distribution.forEach((r) => {
      dist[r]++;
    });

    await mongoose.model("Product").findByIdAndUpdate(productId, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count": stats[0].numReviews,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      "ratings.average": 0,
      "ratings.count": 0,
    });
  }
};

// Update product rating after save/remove
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product, this.tenant);
});

reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.product, doc.tenant);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
