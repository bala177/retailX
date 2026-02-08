const { Tenant } = require("../models");
const { NotFoundError } = require("../utils/errors");
const logger = require("../utils/logger");
const config = require("../config");

/**
 * Tenant Resolution Middleware
 * Automatically resolves tenant from subdomain, path, or header
 * Ensures complete tenant isolation
 */
const resolveTenant = async (req, res, next) => {
  try {
    // Skip tenant resolution for public platform routes (no tenant needed)
    const skipTenantPaths = ["/api/v1/stores", "/api/v1/health", "/api/v1/platform", "/api/v1/super-admin", "/api/v1/auth/login", "/api/v1/auth/register"];

    if (skipTenantPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    let tenantIdentifier = null;
    const resolutionMode = config.tenant.resolutionMode;

    // Known store route segments that are NOT tenant slugs
    const knownRouteSegments = ["info", "products", "categories", "cart", "checkout", "orders", "settings"];

    // Method 1: Header-based resolution (x-store-slug header) - HIGHEST PRIORITY
    tenantIdentifier = req.get("x-store-slug") || req.get(config.tenant.headerName);

    // Method 2: Path-based resolution (e.g., /api/v1/store/:tenantSlug/...)
    if (!tenantIdentifier && (resolutionMode === "path" || true)) {
      // First check route params
      if (req.params.tenantSlug && !knownRouteSegments.includes(req.params.tenantSlug)) {
        tenantIdentifier = req.params.tenantSlug;
      } else {
        // Fallback to path regex
        const pathMatch = req.path.match(/\/store\/([^\/]+)/);
        if (pathMatch && !knownRouteSegments.includes(pathMatch[1])) {
          tenantIdentifier = pathMatch[1];
        }
      }
    }

    // Method 3: Subdomain-based resolution (e.g., mystore.retailx.com)
    if (!tenantIdentifier && resolutionMode === "subdomain") {
      const host = req.get("host") || "";
      const hostWithoutPort = host.split(":")[0]; // Remove port
      const parts = hostWithoutPort.split(".");

      // Only extract subdomain if there are enough parts (e.g., store.example.com)
      if (parts.length >= 3) {
        const subdomain = parts[0];

        // Exclude common subdomains
        const excludedSubdomains = ["www", "api", "admin", "localhost"];
        if (subdomain && !excludedSubdomains.includes(subdomain.toLowerCase())) {
          tenantIdentifier = subdomain;
        }
      }
    }

    // Method 4: Query parameter (fallback for development)
    if (!tenantIdentifier && config.env === "development") {
      tenantIdentifier = req.query.tenant;
    }

    // If no tenant identifier found, check if this is a public route
    if (!tenantIdentifier) {
      // Allow certain routes without tenant
      const publicPaths = ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/platform", "/api/v1/tenants", "/api/v1/health", "/health", "/api/v1/store/", "/api/v1/stores", "/api/v1/super-admin"];

      const isPublicPath = publicPaths.some((path) => req.path.startsWith(path));

      if (isPublicPath) {
        return next();
      }

      // For platform admin routes, tenant is optional
      if (req.path.startsWith("/api/v1/admin/platform")) {
        return next();
      }
    }

    // Resolve tenant from database
    if (tenantIdentifier) {
      const tenant = await Tenant.findByDomain(tenantIdentifier);

      if (!tenant) {
        // If it looks like a tenant slug but not found, throw error
        // Otherwise just continue without tenant (requireTenant middleware will catch this)
        if (!knownRouteSegments.includes(tenantIdentifier)) {
          throw new NotFoundError(`Store not found: ${tenantIdentifier}`);
        }
        return next();
      }

      if (tenant.status !== "active") {
        throw new NotFoundError("This store is currently unavailable");
      }

      // Attach tenant to request
      req.tenant = tenant;
      req.tenantId = tenant._id;

      logger.debug(`Tenant resolved: ${tenant.name} (${tenant.slug})`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require Tenant Middleware
 * Use this for routes that MUST have a tenant context
 */
const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    return next(new NotFoundError("Store context is required for this operation"));
  }
  next();
};

/**
 * Tenant Scope Middleware
 * Ensures all database queries are scoped to the current tenant
 * This is a safety net to prevent cross-tenant data access
 */
const tenantScope = (req, res, next) => {
  if (req.tenant) {
    // Override the original query methods to add tenant filter
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Add tenant context to response for debugging in development
      if (config.env === "development") {
        if (typeof data === "object" && data !== null) {
          data._tenant = {
            id: req.tenant._id,
            slug: req.tenant.slug,
          };
        }
      }
      return originalJson(data);
    };
  }
  next();
};

/**
 * Resolve Tenant from Header Only
 * Used for routes that don't have tenant in URL path
 */
const resolveTenantFromHeader = async (req, res, next) => {
  try {
    // Get tenant from header
    const tenantIdentifier = req.get("x-store-slug") || req.get(config.tenant.headerName);

    if (!tenantIdentifier) {
      throw new NotFoundError("Store context is required. Please provide x-store-slug header.");
    }

    // Resolve tenant from database
    const tenant = await Tenant.findByDomain(tenantIdentifier);

    if (!tenant) {
      throw new NotFoundError(`Store not found: ${tenantIdentifier}`);
    }

    if (tenant.status !== "active") {
      throw new NotFoundError("This store is currently unavailable");
    }

    // Attach tenant to request
    req.tenant = tenant;
    req.tenantId = tenant._id;

    logger.debug(`Tenant resolved from header: ${tenant.name} (${tenant.slug})`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Get Tenant Filter Helper
 * Returns a filter object for database queries
 */
const getTenantFilter = (req, additionalFilters = {}) => {
  if (!req.tenantId) {
    return additionalFilters;
  }

  return {
    tenant: req.tenantId,
    ...additionalFilters,
  };
};

/**
 * Validate Tenant Access Helper
 * Checks if a document belongs to the current tenant
 */
const validateTenantAccess = (document, tenantId) => {
  if (!document || !tenantId) return false;

  const docTenantId = document.tenant?._id || document.tenant;
  return docTenantId?.toString() === tenantId.toString();
};

module.exports = {
  resolveTenant,
  resolveTenantFromHeader,
  requireTenant,
  tenantScope,
  getTenantFilter,
  validateTenantAccess,
};
