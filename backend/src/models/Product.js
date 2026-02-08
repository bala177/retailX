const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Product Schema
 * Generic, extensible product model with tenant isolation
 * Supports all retail domains without code changes
 */
const productSchema = new mongoose.Schema(
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
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    // Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // Brand (optional feature)
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand cannot exceed 100 characters"],
    },

    // Media
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
        displayOrder: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Pricing
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base price is required"],
        min: [0, "Price cannot be negative"],
      },
      salePrice: {
        type: Number,
        min: [0, "Sale price cannot be negative"],
      },
      costPrice: {
        type: Number,
        min: [0, "Cost price cannot be negative"],
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
      taxable: {
        type: Boolean,
        default: true,
      },
      taxClass: {
        type: String,
        default: "standard",
      },
    },

    // Inventory
    inventory: {
      sku: {
        type: String,
        trim: true,
        uppercase: true,
      },
      barcode: String,
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
      trackQuantity: {
        type: Boolean,
        default: true,
      },
      allowBackorder: {
        type: Boolean,
        default: false,
      },
      stockStatus: {
        type: String,
        enum: ["in_stock", "out_of_stock", "low_stock", "backorder"],
        default: "in_stock",
      },
    },

    // Physical Attributes
    physical: {
      weight: {
        value: Number,
        unit: {
          type: String,
          enum: ["kg", "g", "lb", "oz"],
          default: "kg",
        },
      },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
          type: String,
          enum: ["cm", "in", "m"],
          default: "cm",
        },
      },
      requiresShipping: {
        type: Boolean,
        default: true,
      },
    },

    // Variants (flexible key-value structure)
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variantOptions: [
      {
        name: {
          type: String,
          required: true,
        },
        values: [String],
      },
    ],
    variants: [
      {
        sku: String,
        name: String,
        options: {
          type: Map,
          of: String,
        },
        price: Number,
        salePrice: Number,
        quantity: {
          type: Number,
          default: 0,
        },
        image: String,
        barcode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],

    // Tags
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
    },

    // Extended Attributes (flexible key-value for domain-specific data)
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Fashion specific (enabled per tenant)
    fashion: {
      sizes: [String],
      colors: [
        {
          name: String,
          code: String,
          image: String,
        },
      ],
      material: String,
      careInstructions: String,
      gender: {
        type: String,
        enum: ["men", "women", "unisex", "kids", "baby"],
      },
      season: String,
    },

    // Grocery specific (enabled per tenant)
    grocery: {
      expiryDate: Date,
      manufacturingDate: Date,
      shelfLife: String,
      storageInstructions: String,
      nutrition: {
        servingSize: String,
        calories: Number,
        protein: String,
        carbohydrates: String,
        fat: String,
        fiber: String,
        sodium: String,
        sugar: String,
      },
      allergens: [String],
      dietary: [
        {
          type: String,
          enum: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "organic", "halal", "kosher"],
        },
      ],
    },

    // Electronics specific (enabled per tenant)
    electronics: {
      type: {
        warranty: {
          type: {
            duration: String,
            warrantyType: String,
            description: String,
          },
        },
        specifications: {
          type: Map,
          of: String,
        },
        powerRequirements: String,
        compatibility: [String],
        modelNumber: String,
        releaseDate: Date,
      },
    },

    // Cosmetics specific (enabled per tenant)
    cosmetics: {
      type: {
        ingredients: [String],
        howToUse: String,
        skinType: [
          {
            type: String,
            enum: ["normal", "dry", "oily", "combination", "sensitive", "all"],
          },
        ],
        concerns: [String],
        volume: {
          type: {
            value: Number,
            unit: {
              type: String,
              enum: ["ml", "oz", "g"],
            },
          },
        },
        fragrance: String,
        expiryPeriod: String,
      },
    },

    // Reviews & Ratings
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },

    // Visibility & Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["visible", "hidden", "featured"],
      default: "visible",
    },
    publishedAt: Date,

    // Flags
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },

    // Related Products
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Statistics
    stats: {
      views: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
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

// Compound indexes for tenant isolation and common queries
productSchema.index({ tenant: 1, slug: 1 }, { unique: true });
productSchema.index({ tenant: 1, category: 1, status: 1 });
productSchema.index({ tenant: 1, status: 1, createdAt: -1 });
productSchema.index({ tenant: 1, "inventory.sku": 1 });
productSchema.index({ tenant: 1, tags: 1 });
productSchema.index({ tenant: 1, isFeatured: 1 });
productSchema.index({ tenant: 1, "pricing.basePrice": 1 });

// Text index for search
productSchema.index(
  {
    name: "text",
    description: "text",
    brand: "text",
    tags: "text",
  },
  {
    weights: {
      name: 10,
      brand: 5,
      tags: 3,
      description: 1,
    },
  },
);

// Virtual for primary image
productSchema.virtual("primaryImage").get(function () {
  const primary = this.images?.find((img) => img.isPrimary);
  return primary?.url || this.images?.[0]?.url || null;
});

// Virtual for current price (sale or base)
productSchema.virtual("currentPrice").get(function () {
  if (this.pricing?.salePrice && this.pricing.salePrice < this.pricing.basePrice) {
    return this.pricing.salePrice;
  }
  return this.pricing?.basePrice;
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.pricing?.salePrice && this.pricing.salePrice < this.pricing.basePrice) {
    return Math.round(((this.pricing.basePrice - this.pricing.salePrice) / this.pricing.basePrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual("inStock").get(function () {
  if (!this.inventory?.trackQuantity) return true;
  return this.inventory.quantity > 0 || this.inventory.allowBackorder;
});

// Pre-save middleware to generate slug
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });

    // Check for existing slug within the same tenant
    const existingProduct = await this.constructor.findOne({
      tenant: this.tenant,
      slug: baseSlug,
      _id: { $ne: this._id },
    });

    if (existingProduct) {
      this.slug = `${baseSlug}-${Date.now()}`;
    } else {
      this.slug = baseSlug;
    }
  }
  next();
});

// Pre-save middleware to update stock status
productSchema.pre("save", function (next) {
  if (this.isModified("inventory.quantity") && this.inventory?.trackQuantity) {
    const qty = this.inventory.quantity;
    const threshold = this.inventory.lowStockThreshold || 5;

    if (qty <= 0) {
      this.inventory.stockStatus = this.inventory.allowBackorder ? "backorder" : "out_of_stock";
    } else if (qty <= threshold) {
      this.inventory.stockStatus = "low_stock";
    } else {
      this.inventory.stockStatus = "in_stock";
    }
  }
  next();
});

// Pre-save middleware to update isOnSale flag
productSchema.pre("save", function (next) {
  if (this.isModified("pricing.salePrice") || this.isModified("pricing.basePrice")) {
    this.isOnSale = this.pricing?.salePrice && this.pricing.salePrice < this.pricing.basePrice;
  }
  next();
});

// Static method to search products
productSchema.statics.searchProducts = async function (tenantId, searchQuery, filters = {}) {
  const query = {
    tenant: tenantId,
    status: "active",
    deletedAt: null,
  };

  // Text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    query["pricing.basePrice"] = {};
    if (filters.minPrice) query["pricing.basePrice"].$gte = filters.minPrice;
    if (filters.maxPrice) query["pricing.basePrice"].$lte = filters.maxPrice;
  }

  // Brand filter
  if (filters.brand) {
    query.brand = filters.brand;
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // In stock filter
  if (filters.inStock) {
    query["inventory.stockStatus"] = { $in: ["in_stock", "low_stock"] };
  }

  // On sale filter
  if (filters.onSale) {
    query.isOnSale = true;
  }

  // Sorting
  let sort = { createdAt: -1 };
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price_asc":
        sort = { "pricing.basePrice": 1 };
        break;
      case "price_desc":
        sort = { "pricing.basePrice": -1 };
        break;
      case "name_asc":
        sort = { name: 1 };
        break;
      case "name_desc":
        sort = { name: -1 };
        break;
      case "rating":
        sort = { "ratings.average": -1 };
        break;
      case "popularity":
        sort = { "stats.sales": -1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
    }
  }

  // Add text score for relevance if searching
  if (searchQuery) {
    sort = { score: { $meta: "textScore" }, ...sort };
  }

  return { query, sort };
};

// Static method to get related products
productSchema.statics.getRelatedProducts = async function (productId, limit = 4) {
  const product = await this.findById(productId);
  if (!product) return [];

  return this.find({
    tenant: product.tenant,
    _id: { $ne: productId },
    status: "active",
    deletedAt: null,
    $or: [{ category: product.category }, { tags: { $in: product.tags } }, { brand: product.brand }],
  })
    .limit(limit)
    .select("name slug images pricing ratings");
};

// Static method to update product ratings
productSchema.statics.updateRatings = async function (productId) {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { product: productId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count": stats[0].count,
    });
  }
};

// Soft delete
productSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = "archived";
  return this.save();
};

// Query middleware to exclude soft deleted
productSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
