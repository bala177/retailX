import { Request, Response } from 'express';
import Tenant from '../models/Tenant';

export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating tenant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    
    const tenants = await Tenant.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tenants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tenants',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tenant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: tenant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating tenant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tenant deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tenant',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
