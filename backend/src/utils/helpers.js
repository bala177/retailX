/**
 * Async handler wrapper to eliminate try-catch blocks in controllers
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Slugify a string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Paginate query results
 * @param {Object} query - Mongoose query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const paginate = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([query.skip(skip).limit(limit), query.model.countDocuments(query.getQuery())]);

  return {
    data: results,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

/**
 * Filter object to include only allowed fields
 * @param {Object} obj - Source object
 * @param  {...string} allowedFields - Fields to include
 * @returns {Object} Filtered object
 */
const filterObject = (obj, ...allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

/**
 * Remove undefined/null values from object
 * @param {Object} obj - Source object
 * @returns {Object} Cleaned object
 */
const cleanObject = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v !== ""));
};

/**
 * Format price for display
 * @param {number} price - Price in cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price / 100);
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
const deepMerge = (target, source) => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
};

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} Is object
 */
const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Generate order number
 * @param {string} prefix - Order prefix
 * @returns {string} Order number
 */
const generateOrderNumber = (prefix = "ORD") => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeHtml = (str) => {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

module.exports = {
  asyncHandler,
  generateRandomString,
  slugify,
  paginate,
  filterObject,
  cleanObject,
  formatPrice,
  calculatePercentage,
  deepMerge,
  isObject,
  generateOrderNumber,
  sanitizeHtml,
};
