const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Category Schema
 * Hierarchical category structure with tenant isolation
 */
const categorySchema = new mongoose.Schema(
  {
    // Tenant Association (REQUIRED for data isolation)
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
      index: true,
    },

    // Basic Information
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Hierarchy
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    ancestors: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        name: String,
        slug: String,
      },
    ],
    level: {
      type: Number,
      default: 0,
    },

    // Media
    image: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },

    // Display
    displayOrder: {
      type: Number,
      default: 0,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    showInHomepage: {
      type: Boolean,
      default: false,
    },
    featuredImage: String,

    // Status
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    // Statistics
    productCount: {
      type: Number,
      default: 0,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for tenant isolation
categorySchema.index({ tenant: 1, slug: 1 }, { unique: true });
categorySchema.index({ tenant: 1, parent: 1 });
categorySchema.index({ tenant: 1, status: 1, displayOrder: 1 });

// Virtual for children categories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Pre-save middleware to generate slug
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });

    // Check for existing slug within the same tenant
    const existingCategory = await this.constructor.findOne({
      tenant: this.tenant,
      slug: baseSlug,
      _id: { $ne: this._id },
    });

    if (existingCategory) {
      this.slug = `${baseSlug}-${Date.now()}`;
    } else {
      this.slug = baseSlug;
    }
  }
  next();
});

// Pre-save middleware to update ancestors
categorySchema.pre("save", async function (next) {
  if (this.isModified("parent")) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.ancestors = [
          ...parentCategory.ancestors,
          {
            _id: parentCategory._id,
            name: parentCategory.name,
            slug: parentCategory.slug,
          },
        ];
        this.level = parentCategory.level + 1;
      }
    } else {
      this.ancestors = [];
      this.level = 0;
    }
  }
  next();
});

// Static method to get category tree for a tenant
categorySchema.statics.getCategoryTree = async function (tenantId, status = "active") {
  const categories = await this.find({
    tenant: tenantId,
    status,
    parent: null,
    deletedAt: null,
  })
    .sort("displayOrder")
    .populate({
      path: "children",
      match: { status, deletedAt: null },
      options: { sort: { displayOrder: 1 } },
      populate: {
        path: "children",
        match: { status, deletedAt: null },
        options: { sort: { displayOrder: 1 } },
      },
    });

  return categories;
};

// Static method to get all descendants
categorySchema.statics.getDescendants = async function (categoryId) {
  const descendants = await this.find({
    "ancestors._id": categoryId,
    deletedAt: null,
  });
  return descendants;
};

// Static method to update product count
categorySchema.statics.updateProductCount = async function (categoryId) {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    category: categoryId,
    status: "active",
    deletedAt: null,
  });

  await this.findByIdAndUpdate(categoryId, { productCount: count });
};

// Soft delete
categorySchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

// Query middleware to exclude soft deleted
categorySchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
