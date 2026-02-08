const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config");

/**
 * User Schema
 * Supports platform owners, store owners, staff, and customers
 */
const userSchema = new mongoose.Schema(
  {
    // Tenant Association (null for platform owners)
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
    },

    // Authentication
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Profile
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },

    // Role & Permissions
    // Hierarchy: super_admin > store_owner > store_staff > customer
    // super_admin = RetailX platform owner (you/Synexon)
    // store_owner = Customer who purchased RetailX (Tranquil Spa, etc.)
    // store_staff = Employees of your customers
    // customer = End users who book/buy from stores
    role: {
      type: String,
      enum: ["super_admin", "store_owner", "store_staff", "customer"],
      default: "customer",
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          // Product permissions
          "products.view",
          "products.create",
          "products.edit",
          "products.delete",

          // Category permissions
          "categories.view",
          "categories.create",
          "categories.edit",
          "categories.delete",

          // Order permissions
          "orders.view",
          "orders.create",
          "orders.edit",
          "orders.delete",
          "orders.process",

          // Customer permissions
          "customers.view",
          "customers.create",
          "customers.edit",
          "customers.delete",

          // Settings permissions
          "settings.view",
          "settings.edit",

          // Reports permissions
          "reports.view",
          "reports.export",

          // Store management
          "store.settings",
          "store.branding",
          "store.staff",
        ],
      },
    ],

    // Customer specific fields
    addresses: [
      {
        label: {
          type: String,
          default: "Home",
        },
        firstName: String,
        lastName: String,
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
          type: String,
          default: "US",
        },
        phone: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Wishlist (for customers)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Account Status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending_verification"],
      default: "active",
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Security
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    lastLoginIP: String,

    // Refresh Tokens
    refreshTokens: [
      {
        token: String,
        expires: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        userAgent: String,
        ip: String,
      },
    ],

    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for tenant + email uniqueness
userSchema.index({ tenant: 1, email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);

    // Update passwordChangedAt for existing users
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetExpires = Date.now() + config.passwordReset.expiresMinutes * 60 * 1000;

  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Instance method to increment failed login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Instance method to check permission
userSchema.methods.hasPermission = function (permission) {
  // Super admins have all permissions
  if (this.role === "super_admin") return true;

  // Store owners have all store permissions
  if (this.role === "store_owner") return true;

  return this.permissions.includes(permission);
};

// Instance method to check if user is admin (super admin or store owner)
userSchema.methods.isAdmin = function () {
  return ["super_admin", "store_owner"].includes(this.role);
};

// Instance method to check if user is staff (store owner or staff)
userSchema.methods.isStaff = function () {
  return ["super_admin", "store_owner", "store_staff"].includes(this.role);
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password, tenantId = null) {
  const query = { email: email.toLowerCase() };

  if (tenantId) {
    query.tenant = tenantId;
  }

  const user = await this.findOne(query).select("+password");

  if (!user) {
    return null;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return null;
  }

  return user;
};

// Soft delete
userSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

// Query middleware to exclude soft deleted
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
