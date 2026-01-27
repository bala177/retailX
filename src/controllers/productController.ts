import { Response } from 'express';
import Product from '../models/Product';
import { TenantRequest } from '../middleware/tenant';

export const createProduct = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const product = new Product({
      ...req.body,
      tenantId: req.tenant._id,
    });
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllProducts = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { category, status, featured, search, page = 1, limit = 20 } = req.query;
    
    const query: any = { tenantId: req.tenant._id };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
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
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProduct = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateProduct = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteProduct = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenant._id,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductsByCategory = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const categories = await Product.aggregate([
      { $match: { tenantId: req.tenant._id, status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
