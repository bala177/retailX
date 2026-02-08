const { body, param, query, validationResult } = require("express-validator");
const { ValidationError } = require("../utils/errors");

/**
 * Handle Validation Errors
 * Middleware to check for validation errors and return proper response
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError("Validation failed", formattedErrors);
  }

  next();
};

/**
 * Common Validators
 */
const validators = {
  // MongoDB ObjectId
  objectId: (field, location = "param") => {
    const validator = location === "param" ? param(field) : body(field);
    return validator.trim().isMongoId().withMessage(`Invalid ${field} ID format`);
  },

  // Email
  email: (field = "email") => body(field).trim().toLowerCase().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),

  // Password
  password: (field = "password") =>
    body(field)
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  // Name
  name: (field, minLength = 1, maxLength = 100) => body(field).trim().isLength({ min: minLength, max: maxLength }).withMessage(`${field} must be between ${minLength} and ${maxLength} characters`).escape(),

  // Optional Name
  optionalName: (field, minLength = 1, maxLength = 100) => body(field).optional().trim().isLength({ min: minLength, max: maxLength }).withMessage(`${field} must be between ${minLength} and ${maxLength} characters`).escape(),

  // Slug
  slug: (field = "slug") =>
    body(field)
      .optional()
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage("Slug must be lowercase alphanumeric with hyphens"),

  // URL
  url: (field) =>
    body(field)
      .optional()
      .trim()
      .isURL({ protocols: ["http", "https"] })
      .withMessage(`${field} must be a valid URL`),

  // Price
  price: (field) => body(field).isFloat({ min: 0 }).withMessage(`${field} must be a positive number`).toFloat(),

  // Optional Price
  optionalPrice: (field) => body(field).optional().isFloat({ min: 0 }).withMessage(`${field} must be a positive number`).toFloat(),

  // Quantity
  quantity: (field) => body(field).isInt({ min: 0 }).withMessage(`${field} must be a non-negative integer`).toInt(),

  // Optional Quantity
  optionalQuantity: (field) => body(field).optional().isInt({ min: 0 }).withMessage(`${field} must be a non-negative integer`).toInt(),

  // Phone
  phone: (field = "phone") =>
    body(field)
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/)
      .withMessage("Please provide a valid phone number"),

  // Color (hex)
  hexColor: (field) =>
    body(field)
      .optional()
      .trim()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage(`${field} must be a valid hex color`),

  // Enum
  enum: (field, values) =>
    body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(", ")}`),

  // Optional Enum
  optionalEnum: (field, values) =>
    body(field)
      .optional()
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(", ")}`),

  // Boolean
  boolean: (field) => body(field).optional().isBoolean().withMessage(`${field} must be a boolean`).toBoolean(),

  // Date
  date: (field) => body(field).optional().isISO8601().withMessage(`${field} must be a valid date`).toDate(),

  // Array
  array: (field) => body(field).optional().isArray().withMessage(`${field} must be an array`),

  // Non-empty Array
  nonEmptyArray: (field) => body(field).isArray({ min: 1 }).withMessage(`${field} must be a non-empty array`),

  // Pagination
  pagination: () => [query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(), query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt()],

  // Search
  search: () => query("search").optional().trim().isLength({ min: 1, max: 100 }).withMessage("Search query must be between 1 and 100 characters").escape(),

  // Sort
  sort: (allowedFields) =>
    query("sort")
      .optional()
      .trim()
      .custom((value) => {
        const field = value.startsWith("-") ? value.slice(1) : value;
        if (!allowedFields.includes(field)) {
          throw new Error(`Sort field must be one of: ${allowedFields.join(", ")}`);
        }
        return true;
      }),
};

/**
 * Auth Validation Rules
 */
const authValidation = {
  register: [validators.email(), validators.password(), validators.name("firstName", 1, 50), validators.name("lastName", 1, 50), validators.phone(), handleValidation],

  login: [validators.email(), body("password").notEmpty().withMessage("Password is required"), handleValidation],

  changePassword: [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    validators.password("newPassword"),
    body("confirmPassword")
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage("Passwords do not match"),
    handleValidation,
  ],

  forgotPassword: [validators.email(), handleValidation],

  resetPassword: [
    param("token").notEmpty().withMessage("Reset token is required"),
    validators.password("password"),
    body("confirmPassword")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
    handleValidation,
  ],
};

/**
 * Tenant Validation Rules
 */
const tenantValidation = {
  create: [
    validators.name("name", 2, 100),
    validators.slug(),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
    validators.optionalEnum("industry", ["fashion", "grocery", "cosmetics", "electronics", "stationery", "general", "other"]),
    validators.email("contact.email"),
    validators.phone("contact.phone"),
    validators.hexColor("branding.primaryColor"),
    validators.hexColor("branding.secondaryColor"),
    validators.hexColor("branding.accentColor"),
    handleValidation,
  ],

  update: [
    validators.objectId("id"),
    validators.optionalName("name", 2, 100),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
    validators.hexColor("branding.primaryColor"),
    validators.hexColor("branding.secondaryColor"),
    validators.hexColor("branding.accentColor"),
    handleValidation,
  ],
};

/**
 * Product Validation Rules
 */
const productValidation = {
  create: [
    validators.name("name", 1, 200),
    body("description").optional().trim().isLength({ max: 5000 }).withMessage("Description cannot exceed 5000 characters"),
    validators.objectId("category", "body"),
    validators.price("pricing.basePrice"),
    validators.optionalPrice("pricing.salePrice"),
    validators.optionalPrice("pricing.costPrice"),
    validators.optionalQuantity("inventory.quantity"),
    body("inventory.sku").optional().trim().toUpperCase().isLength({ max: 50 }).withMessage("SKU cannot exceed 50 characters"),
    validators.array("images"),
    validators.array("tags"),
    validators.optionalEnum("status", ["draft", "active", "inactive", "archived"]),
    handleValidation,
  ],

  update: [
    validators.objectId("id"),
    validators.optionalName("name", 1, 200),
    body("description").optional().trim().isLength({ max: 5000 }).withMessage("Description cannot exceed 5000 characters"),
    validators.optionalPrice("pricing.basePrice"),
    validators.optionalPrice("pricing.salePrice"),
    validators.optionalQuantity("inventory.quantity"),
    validators.optionalEnum("status", ["draft", "active", "inactive", "archived"]),
    handleValidation,
  ],

  list: [
    ...validators.pagination(),
    validators.search(),
    validators.sort(["name", "price", "createdAt", "rating", "sales"]),
    query("category").optional().isMongoId().withMessage("Invalid category ID"),
    query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be a positive number"),
    query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be a positive number"),
    query("status").optional().isIn(["draft", "active", "inactive", "archived"]).withMessage("Invalid status"),
    query("inStock").optional().isBoolean().withMessage("inStock must be a boolean"),
    handleValidation,
  ],
};

/**
 * Category Validation Rules
 */
const categoryValidation = {
  create: [
    validators.name("name", 1, 100),
    validators.slug(),
    body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
    body("parent").optional().isMongoId().withMessage("Invalid parent category ID"),
    validators.optionalQuantity("displayOrder"),
    validators.boolean("showInMenu"),
    validators.boolean("showInHomepage"),
    validators.optionalEnum("status", ["active", "inactive"]),
    handleValidation,
  ],

  update: [
    validators.objectId("id"),
    validators.optionalName("name", 1, 100),
    body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
    body("parent")
      .optional({ nullable: true })
      .custom((value) => value === null || /^[a-f\d]{24}$/i.test(value))
      .withMessage("Invalid parent category ID"),
    validators.optionalQuantity("displayOrder"),
    validators.boolean("showInMenu"),
    validators.boolean("showInHomepage"),
    validators.optionalEnum("status", ["active", "inactive"]),
    handleValidation,
  ],
};

/**
 * Order Validation Rules
 */
const orderValidation = {
  create: [
    validators.nonEmptyArray("items"),
    body("items.*.product").isMongoId().withMessage("Invalid product ID"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validators.name("customerInfo.firstName", 1, 50),
    validators.name("customerInfo.lastName", 1, 50),
    validators.email("customerInfo.email"),
    validators.phone("customerInfo.phone"),
    body("shippingAddress.street").notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode").notEmpty().withMessage("Zip code is required"),
    body("shippingAddress.country").notEmpty().withMessage("Country is required"),
    body("customerNotes").optional().trim().isLength({ max: 500 }).withMessage("Customer notes cannot exceed 500 characters"),
    handleValidation,
  ],

  updateStatus: [validators.objectId("id"), validators.enum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "on_hold"]), body("note").optional().trim().isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters"), handleValidation],

  list: [
    ...validators.pagination(),
    query("status").optional().isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "on_hold"]).withMessage("Invalid status"),
    query("paymentStatus").optional().isIn(["pending", "processing", "completed", "failed", "refunded"]).withMessage("Invalid payment status"),
    validators.sort(["createdAt", "total", "status"]),
    handleValidation,
  ],
};

/**
 * Cart Validation Rules
 */
const cartValidation = {
  addItem: [validators.objectId("productId", "body"), validators.quantity("quantity"), body("variant").optional().isObject().withMessage("Variant must be an object"), handleValidation],

  updateQuantity: [validators.objectId("productId", "body"), validators.quantity("quantity"), handleValidation],

  removeItem: [validators.objectId("productId"), handleValidation],
};

module.exports = {
  handleValidation,
  validators,
  authValidation,
  tenantValidation,
  productValidation,
  categoryValidation,
  orderValidation,
  cartValidation,
};
