const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Tenant (Store) Schema
 * Each tenant represents an independent online store
 */
const tenantSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    // Domain Configuration
    domains: {
      subdomain: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
      },
      customDomain: {
        type: String,
        unique: true,
        sparse: true,
      },
    },

    // Store Type / Industry
    industry: {
      type: String,
      enum: ["fashion", "grocery", "food", "cosmetics", "electronics", "stationery", "general", "wellness", "healthcare", "other"],
      default: "general",
    },

    // Business Type - Products vs Services
    businessType: {
      type: String,
      enum: ["products", "services", "hybrid"],
      default: "products",
    },

    // Service-specific settings (for service-based businesses)
    serviceSettings: {
      appointmentRequired: { type: Boolean, default: false },
      bookingLeadTime: { type: Number, default: 24 }, // Hours in advance
      cancellationPolicy: { type: String, default: "" },
      sessionBased: { type: Boolean, default: false },
      durationUnit: { type: String, enum: ["minutes", "hours", "sessions"], default: "minutes" },
    },

    // Branding
    branding: {
      logo: {
        type: String,
        default: null,
      },
      favicon: {
        type: String,
        default: null,
      },
      heroBanner: {
        type: String,
        default: null,
        description: "Main hero/banner image for store homepage (1920x600px recommended)",
      },
      heroBannerAlt: {
        type: String,
        default: null,
        description: "Alternative hero banner for seasonal campaigns",
      },
      primaryColor: {
        type: String,
        default: "#3B82F6",
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"],
      },
      secondaryColor: {
        type: String,
        default: "#1E40AF",
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"],
      },
      accentColor: {
        type: String,
        default: "#F59E0B",
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"],
      },
      fontFamily: {
        type: String,
        default: "Inter",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },

    // Contact Information
    contact: {
      email: {
        type: String,
        lowercase: true,
      },
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
          type: String,
          default: "US",
        },
      },
    },

    // Store Settings
    settings: {
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
      currencySymbol: {
        type: String,
        default: "$",
      },
      timezone: {
        type: String,
        default: "America/New_York",
      },
      locale: {
        type: String,
        default: "en-US",
      },
      taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      shippingEnabled: {
        type: Boolean,
        default: true,
      },
      guestCheckout: {
        type: Boolean,
        default: true,
      },
      inventoryTracking: {
        type: Boolean,
        default: true,
      },
      reviewsEnabled: {
        type: Boolean,
        default: true,
      },
      wishlistEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // Feature Toggles - Enable/Disable optional product fields per tenant
    features: {
      // ═══════════════════════════════════════════════════════════════════
      // CORE SYSTEM FEATURES - Controlled by Super Admin
      // ═══════════════════════════════════════════════════════════════════

      // Payment System
      paymentEnabled: { type: Boolean, default: true },
      paymentProviders: {
        stripe: { type: Boolean, default: false },
        paypal: { type: Boolean, default: false },
        razorpay: { type: Boolean, default: false },
        cod: { type: Boolean, default: true }, // Cash on delivery
        bankTransfer: { type: Boolean, default: false },
      },

      // Booking/Appointment System (for service businesses)
      bookingEnabled: { type: Boolean, default: false },
      bookingRequiresPayment: { type: Boolean, default: false },
      bookingAllowCancellation: { type: Boolean, default: true },
      bookingReminderEnabled: { type: Boolean, default: true },

      // Cart & Checkout
      cartEnabled: { type: Boolean, default: true },
      guestCheckoutEnabled: { type: Boolean, default: true },

      // Shipping (for product businesses)
      shippingEnabled: { type: Boolean, default: true },

      // Inventory Management
      inventoryEnabled: { type: Boolean, default: true },

      // Customer Accounts
      customerAccountsEnabled: { type: Boolean, default: true },
      customerAccountRequired: { type: Boolean, default: false },

      // ═══════════════════════════════════════════════════════════════════
      // PRODUCT FEATURES
      // ═══════════════════════════════════════════════════════════════════
      productVariants: { type: Boolean, default: true },
      productSKU: { type: Boolean, default: true },
      productBarcode: { type: Boolean, default: false },
      productWeight: { type: Boolean, default: true },
      productDimensions: { type: Boolean, default: false },
      productBrand: { type: Boolean, default: true },
      productTags: { type: Boolean, default: true },
      productSEO: { type: Boolean, default: true },

      // Fashion specific
      productSize: { type: Boolean, default: false },
      productColor: { type: Boolean, default: false },
      productMaterial: { type: Boolean, default: false },

      // Grocery specific
      productExpiryDate: { type: Boolean, default: false },
      productNutrition: { type: Boolean, default: false },

      // Electronics specific
      productWarranty: { type: Boolean, default: false },
      productSpecifications: { type: Boolean, default: false },

      // Cosmetics specific
      productIngredients: { type: Boolean, default: false },
      productSkinType: { type: Boolean, default: false },

      // Order features
      orderNotes: { type: Boolean, default: true },
      orderTracking: { type: Boolean, default: true },

      // Customer features
      customerGroups: { type: Boolean, default: false },
      loyaltyProgram: { type: Boolean, default: false },

      // Review & Rating
      reviewsEnabled: { type: Boolean, default: true },

      // Wishlist
      wishlistEnabled: { type: Boolean, default: true },

      // Discounts & Coupons
      discountsEnabled: { type: Boolean, default: true },
      couponsEnabled: { type: Boolean, default: true },
    },

    // Booking Settings (for service-based businesses like spas, salons)
    bookingSettings: {
      workingHours: {
        monday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
        tuesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
        wednesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
        thursday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
        friday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
        saturday: { start: { type: String, default: "10:00" }, end: { type: String, default: "16:00" }, enabled: { type: Boolean, default: true } },
        sunday: { start: { type: String, default: "10:00" }, end: { type: String, default: "14:00" }, enabled: { type: Boolean, default: false } },
      },
      slotDuration: { type: Number, default: 60 }, // minutes
      bufferTime: { type: Number, default: 15 }, // minutes between appointments
      advanceBookingDays: { type: Number, default: 30 }, // How far in advance can book
      minAdvanceHours: { type: Number, default: 24 }, // Minimum hours before appointment
      cancellationHours: { type: Number, default: 24 }, // Hours before appointment for free cancellation
      confirmationRequired: { type: Boolean, default: true },
      phoneNumber: { type: String, default: "" }, // Phone for confirmation calls
      confirmationMessage: { type: String, default: "Thank you for your booking! Please call us to confirm your appointment." },
    },

    // SEO Settings
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String,
    },

    // About Page Content (dynamic, not hardcoded)
    aboutContent: {
      headline: { type: String, default: "" },
      description: { type: String, default: "" },
      story: { type: String, default: "" },
      mission: { type: String, default: "" },
      images: [String],
      values: [
        {
          icon: String,
          title: String,
          description: String,
        },
      ],
      stats: [
        {
          label: String,
          value: String,
        },
      ],
      features: [
        {
          title: String,
          description: String,
        },
      ],
    },

    // Promo Banner (dynamic)
    promoBanner: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "" },
      link: { type: String, default: "" },
      backgroundColor: { type: String, default: "#4F46E5" },
      textColor: { type: String, default: "#FFFFFF" },
    },

    // Social Links
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      linkedin: String,
      tiktok: String,
    },

    // Payment Settings
    payment: {
      providers: [
        {
          name: {
            type: String,
            enum: ["stripe", "paypal", "razorpay", "cod", "bank_transfer"],
          },
          enabled: {
            type: Boolean,
            default: false,
          },
          config: {
            type: Map,
            of: String,
          },
        },
      ],
    },

    // Shipping Configuration
    shipping: {
      methods: [
        {
          name: String,
          description: String,
          price: Number,
          estimatedDays: String,
          enabled: {
            type: Boolean,
            default: true,
          },
        },
      ],
      freeShippingThreshold: {
        type: Number,
        default: 0,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "active",
      index: true,
    },

    // Subscription/Plan (for future monetization)
    plan: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
    },
    planExpiresAt: Date,

    // Statistics (denormalized for performance)
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalCustomers: { type: Number, default: 0 },
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

// Indexes
tenantSchema.index({ status: 1, createdAt: -1 });
tenantSchema.index({ industry: 1 });

// Pre-save middleware to generate slug
tenantSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for full store URL
tenantSchema.virtual("storeUrl").get(function () {
  if (this.domains?.customDomain) {
    return `https://${this.domains.customDomain}`;
  }
  if (this.domains?.subdomain) {
    return `https://${this.domains.subdomain}.retailx.com`;
  }
  return `https://retailx.com/store/${this.slug}`;
});

// Instance method to check if feature is enabled
tenantSchema.methods.isFeatureEnabled = function (featureName) {
  return this.features?.[featureName] === true;
};

// Instance method to get enabled features
tenantSchema.methods.getEnabledFeatures = function () {
  const enabled = [];
  if (this.features) {
    Object.entries(this.features.toObject()).forEach(([key, value]) => {
      if (value === true) enabled.push(key);
    });
  }
  return enabled;
};

// Static method to find by domain
tenantSchema.statics.findByDomain = function (domain) {
  return this.findOne({
    $or: [{ "domains.subdomain": domain }, { "domains.customDomain": domain }, { slug: domain }],
    status: "active",
  });
};

// Static method to find active tenants
tenantSchema.statics.findActive = function () {
  return this.find({ status: "active", deletedAt: null });
};

// Soft delete
tenantSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
