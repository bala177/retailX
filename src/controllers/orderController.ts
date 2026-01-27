import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { TenantRequest } from '../middleware/tenant';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { items, customer, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId: req.tenant._id,
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
        return;
      }

      if (product.inventory.trackInventory && product.inventory.quantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory for product: ${product.name}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });

      // Update inventory
      if (product.inventory.trackInventory) {
        product.inventory.quantity -= item.quantity;
        await product.save();
      }
    }

    // Calculate tax and shipping (simplified for demo)
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const order = new Order({
      tenantId: req.tenant._id,
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllOrders = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus, page = 1, limit = 20 } = req.query;
    
    const query: any = { tenantId: req.tenant._id };
    
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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
      message: 'Error fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getOrder = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateOrderStatus = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenant._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getOrderStats = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const stats = await Order.aggregate([
      { $match: { tenantId: req.tenant._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const statusBreakdown = await Order.aggregate([
      { $match: { tenantId: req.tenant._id } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
        statusBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
