import { Request, Response, NextFunction } from 'express';
import Tenant from '../models/Tenant';

export interface TenantRequest extends Request {
  tenant?: any;
}

/**
 * Middleware to identify and attach tenant to request
 * Supports identification via subdomain, custom domain, or header
 */
export const identifyTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let tenant = null;

    // Method 1: Check for tenant ID in header (useful for API calls)
    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      tenant = await Tenant.findById(tenantHeader);
    }

    // Method 2: Check subdomain (e.g., store1.retailx.com)
    if (!tenant) {
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];
      
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        tenant = await Tenant.findOne({ subdomain, status: 'active' });
      }
    }

    // Method 3: Check custom domain
    if (!tenant) {
      const host = req.headers.host || '';
      tenant = await Tenant.findOne({ domain: host, status: 'active' });
    }

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive',
      });
      return;
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error identifying tenant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Optional middleware - allows requests without tenant identification
 * Used for admin routes or multi-tenant listing endpoints
 */
export const optionalTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      const tenant = await Tenant.findById(tenantHeader);
      if (tenant) {
        req.tenant = tenant;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
