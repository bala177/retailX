const { Cart, Product } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getTenantFilter } = require("../middleware/tenant");
const logger = require("../utils/logger");

/**
 * Get cart
 * GET /api/v1/store/:tenantSlug/cart
 */
const getCart = asyncHandler(async (req, res) => {
  let cart;

  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    }).populate("items.product", "name slug images pricing inventory");
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    }).populate("items.product", "name slug images pricing inventory");
  }

  if (!cart) {
    cart = {
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0,
    };
  }

  res.json({
    status: "success",
    data: {
      cart,
    },
  });
});

/**
 * Add item to cart
 * POST /api/v1/store/:tenantSlug/cart/items
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  // Validate product
  const product = await Product.findOne({
    _id: productId,
    tenant: req.tenantId,
    status: "active",
    deletedAt: null,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Check stock
  if (product.inventory?.trackQuantity) {
    const availableQty = product.hasVariants && variant?.sku ? product.variants.find((v) => v.sku === variant.sku)?.quantity || 0 : product.inventory.quantity;

    if (availableQty < quantity) {
      throw new BadRequestError("Requested quantity not available");
    }
  }

  // Validate variant if product has variants
  if (product.hasVariants && (!variant || !variant.sku)) {
    throw new BadRequestError("Please select product options");
  }

  // Get price
  const price = product.hasVariants && variant?.sku ? product.variants.find((v) => v.sku === variant.sku)?.price || product.currentPrice : product.currentPrice;

  // Get or create cart
  let cart;
  if (req.user) {
    cart = await Cart.findOrCreate(req.tenantId, req.user._id, null);
  } else {
    // Use session ID for guest cart
    const sessionId = req.sessionId || `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    cart = await Cart.findOrCreate(req.tenantId, null, sessionId);

    // Set session cookie if new
    if (!req.sessionId) {
      res.cookie("cartSession", sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex((item) => {
    const sameProduct = item.product.toString() === productId;
    if (!variant?.sku) return sameProduct && !item.variant?.sku;
    return sameProduct && item.variant?.sku === variant.sku;
  });

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Check stock for new quantity
    if (product.inventory?.trackQuantity) {
      const availableQty = product.hasVariants && variant?.sku ? product.variants.find((v) => v.sku === variant.sku)?.quantity || 0 : product.inventory.quantity;

      if (availableQty < newQuantity) {
        throw new BadRequestError("Requested quantity not available");
      }
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      variant: variant || null,
      quantity,
      price,
      addedAt: new Date(),
    });
  }

  await cart.save();

  // Populate product info for response
  await cart.populate("items.product", "name slug images pricing inventory");

  logger.debug(`Item added to cart: ${product.name}`);

  res.json({
    status: "success",
    message: "Item added to cart",
    data: {
      cart,
    },
  });
});

/**
 * Update cart item quantity
 * PATCH /api/v1/store/:tenantSlug/cart/items/:productId
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, variantSku } = req.body;

  if (quantity < 0) {
    throw new BadRequestError("Quantity cannot be negative");
  }

  // Get cart
  let cart;
  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    });
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    });
  }

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  // Find item
  const itemIndex = cart.items.findIndex((item) => {
    const sameProduct = item.product.toString() === productId;
    if (!variantSku) return sameProduct && !item.variant?.sku;
    return sameProduct && item.variant?.sku === variantSku;
  });

  if (itemIndex === -1) {
    throw new NotFoundError("Item not found in cart");
  }

  if (quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Validate stock
    const product = await Product.findById(productId);
    if (product?.inventory?.trackQuantity) {
      const availableQty = product.hasVariants && variantSku ? product.variants.find((v) => v.sku === variantSku)?.quantity || 0 : product.inventory.quantity;

      if (availableQty < quantity) {
        throw new BadRequestError("Requested quantity not available");
      }
    }

    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product", "name slug images pricing inventory");

  res.json({
    status: "success",
    message: "Cart updated",
    data: {
      cart,
    },
  });
});

/**
 * Remove item from cart
 * DELETE /api/v1/store/:tenantSlug/cart/items/:productId
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantSku } = req.query;

  // Get cart
  let cart;
  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    });
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    });
  }

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  // Remove item
  cart.items = cart.items.filter((item) => {
    const sameProduct = item.product.toString() === productId;
    if (!variantSku) return !sameProduct || item.variant?.sku;
    return !(sameProduct && item.variant?.sku === variantSku);
  });

  await cart.save();
  await cart.populate("items.product", "name slug images pricing inventory");

  res.json({
    status: "success",
    message: "Item removed from cart",
    data: {
      cart,
    },
  });
});

/**
 * Clear cart
 * DELETE /api/v1/store/:tenantSlug/cart
 */
const clearCart = asyncHandler(async (req, res) => {
  let cart;
  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    });
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    });
  }

  if (cart) {
    await cart.clearCart();
  }

  res.json({
    status: "success",
    message: "Cart cleared",
    data: {
      cart: {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      },
    },
  });
});

/**
 * Apply discount code
 * POST /api/v1/store/:tenantSlug/cart/discount
 */
const applyDiscount = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Get cart
  let cart;
  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    });
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    });
  }

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  // TODO: Validate discount code against a Discount/Coupon model
  // For now, just apply a demo discount
  let discount = 0;
  let message = "Invalid discount code";

  if (code.toUpperCase() === "WELCOME10") {
    discount = cart.subtotal * 0.1; // 10% off
    message = "10% discount applied";
  } else if (code.toUpperCase() === "FLAT50") {
    discount = Math.min(50, cart.subtotal); // $50 off max
    message = "$50 discount applied";
  } else {
    throw new BadRequestError("Invalid discount code");
  }

  await cart.applyDiscount(code.toUpperCase(), discount);
  await cart.populate("items.product", "name slug images pricing inventory");

  res.json({
    status: "success",
    message,
    data: {
      cart,
    },
  });
});

/**
 * Remove discount code
 * DELETE /api/v1/store/:tenantSlug/cart/discount
 */
const removeDiscount = asyncHandler(async (req, res) => {
  let cart;
  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    });
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    });
  }

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  cart.discountCode = null;
  cart.discount = 0;
  await cart.save();
  await cart.populate("items.product", "name slug images pricing inventory");

  res.json({
    status: "success",
    message: "Discount removed",
    data: {
      cart,
    },
  });
});

/**
 * Merge guest cart with user cart (after login)
 * POST /api/v1/store/:tenantSlug/cart/merge
 */
const mergeCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!req.user) {
    throw new BadRequestError("User must be logged in to merge carts");
  }

  // Get guest cart
  const guestCart = await Cart.findOne({
    tenant: req.tenantId,
    sessionId,
    status: "active",
  });

  if (!guestCart || guestCart.items.length === 0) {
    // Nothing to merge
    const userCart = await Cart.findOrCreate(req.tenantId, req.user._id, null);
    await userCart.populate("items.product", "name slug images pricing inventory");

    return res.json({
      status: "success",
      message: "No items to merge",
      data: {
        cart: userCart,
      },
    });
  }

  // Get or create user cart
  let userCart = await Cart.findOne({
    tenant: req.tenantId,
    user: req.user._id,
    status: "active",
  });

  if (!userCart) {
    // Transfer guest cart to user
    guestCart.user = req.user._id;
    guestCart.sessionId = null;
    await guestCart.save();
    await guestCart.populate("items.product", "name slug images pricing inventory");

    return res.json({
      status: "success",
      message: "Cart transferred to your account",
      data: {
        cart: guestCart,
      },
    });
  }

  // Merge carts
  await userCart.mergeWith(guestCart);
  await userCart.populate("items.product", "name slug images pricing inventory");

  res.json({
    status: "success",
    message: "Carts merged successfully",
    data: {
      cart: userCart,
    },
  });
});

/**
 * Get cart count (for header)
 * GET /api/v1/store/:tenantSlug/cart/count
 */
const getCartCount = asyncHandler(async (req, res) => {
  let cart;

  if (req.user) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      user: req.user._id,
      status: "active",
    }).select("itemCount");
  } else if (req.sessionId) {
    cart = await Cart.findOne({
      tenant: req.tenantId,
      sessionId: req.sessionId,
      status: "active",
    }).select("itemCount");
  }

  res.json({
    status: "success",
    data: {
      count: cart?.itemCount || 0,
    },
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  mergeCart,
  getCartCount,
};
