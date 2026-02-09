const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantController, productController, categoryController, orderController, cartController, uploadController, reviewController, couponController, bookingController, contactController } = require("../controllers");
const { authenticate, optionalAuth, storeAdminOnly, storeStaffOnly, requireTenant, upload, optimizeImage } = require("../middleware");
const { productValidation, categoryValidation, orderValidation, cartValidation } = require("../middleware/validators");

// All routes require tenant context
router.use(requireTenant);

/**
 * Store Info Routes
 */
router.get("/info", tenantController.getCurrentTenant);
router.patch("/settings", authenticate, storeAdminOnly, tenantController.updateCurrentTenantSettings);

/**
 * Category Routes - Public
 */
router.get("/categories", categoryController.getCategories);
router.get("/categories/menu", categoryController.getMenuCategories);
router.get("/categories/homepage", categoryController.getHomepageCategories);
router.get("/categories/:slug", categoryController.getCategoryBySlug);
router.get("/categories/id/:id", optionalAuth, categoryController.getCategoryById);

/**
 * Category Routes - Admin
 */
router.post("/categories", authenticate, storeStaffOnly, categoryValidation.create, categoryController.createCategory);
router.patch("/categories/:id", authenticate, storeStaffOnly, categoryValidation.update, categoryController.updateCategory);
router.delete("/categories/:id", authenticate, storeAdminOnly, categoryController.deleteCategory);
router.patch("/categories/reorder", authenticate, storeStaffOnly, categoryController.reorderCategories);

/**
 * Product Routes - Public
 */
router.get("/products", optionalAuth, productController.getProducts);
router.get("/products/search", productController.searchProducts);
router.get("/products/featured", productController.getFeaturedProducts);
router.get("/products/new-arrivals", productController.getNewArrivals);
router.get("/products/on-sale", productController.getOnSaleProducts);
router.get("/products/:slug", optionalAuth, productController.getProductBySlug);
router.get("/products/id/:id", optionalAuth, productController.getProductById);
router.get("/products/:id/related", productController.getRelatedProducts);

/**
 * Product Routes - Admin
 */
router.post("/products", authenticate, storeStaffOnly, productValidation.create, productController.createProduct);
router.patch("/products/:id", authenticate, storeStaffOnly, productValidation.update, productController.updateProduct);
router.delete("/products/:id", authenticate, storeAdminOnly, productController.deleteProduct);
router.patch("/products/bulk/update", authenticate, storeStaffOnly, productController.bulkUpdateProducts);
router.delete("/products/bulk/delete", authenticate, storeAdminOnly, productController.bulkDeleteProducts);

/**
 * Cart Routes
 */
router.get("/cart", optionalAuth, cartController.getCart);
router.get("/cart/count", optionalAuth, cartController.getCartCount);
router.post("/cart/items", optionalAuth, cartValidation.addItem, cartController.addToCart);
router.patch("/cart/items/:productId", optionalAuth, cartValidation.updateQuantity, cartController.updateCartItem);
router.delete("/cart/items/:productId", optionalAuth, cartController.removeFromCart);
router.delete("/cart", optionalAuth, cartController.clearCart);
router.post("/cart/discount", optionalAuth, cartController.applyDiscount);
router.delete("/cart/discount", optionalAuth, cartController.removeDiscount);
router.post("/cart/merge", authenticate, cartController.mergeCart);

/**
 * Order Routes - Public/Customer
 */
router.post("/orders", optionalAuth, orderValidation.create, orderController.createOrder);
router.get("/orders/my-orders", authenticate, orderController.getMyOrders);
router.get("/orders/number/:orderNumber", optionalAuth, orderController.getOrderByNumber);
router.post("/orders/:id/cancel", authenticate, orderController.cancelOrder);

/**
 * Order Routes - Admin
 */
router.get("/orders", authenticate, storeStaffOnly, orderController.getOrders);
router.get("/orders/stats", authenticate, storeStaffOnly, orderController.getOrderStats);
router.get("/orders/:id", authenticate, orderController.getOrderById);
router.patch("/orders/:id/status", authenticate, storeStaffOnly, orderValidation.updateStatus, orderController.updateOrderStatus);
router.patch("/orders/:id/tracking", authenticate, storeStaffOnly, orderController.addTracking);
router.post("/orders/:id/refund", authenticate, storeAdminOnly, orderController.processRefund);

/**
 * File Upload Routes
 */
router.post("/upload/:type", authenticate, storeStaffOnly, upload.single("image"), optimizeImage, uploadController.uploadImage);
router.post("/upload/:type/multiple", authenticate, storeStaffOnly, upload.array("images", 10), optimizeImage, uploadController.uploadMultipleImages);
router.delete("/upload/:type/:filename", authenticate, storeStaffOnly, uploadController.deleteImage);

/**
 * Review Routes - Public
 */
router.get("/products/:productId/reviews", reviewController.getProductReviews);
router.post("/products/:productId/reviews", authenticate, reviewController.createReview);
router.patch("/reviews/:id", authenticate, reviewController.updateReview);
router.delete("/reviews/:id", authenticate, reviewController.deleteReview);
router.post("/reviews/:id/helpful", optionalAuth, reviewController.markHelpful);

/**
 * Review Routes - Admin
 */
router.get("/admin/reviews", authenticate, storeStaffOnly, reviewController.getAllReviews);
router.patch("/admin/reviews/:id/status", authenticate, storeStaffOnly, reviewController.updateReviewStatus);

/**
 * Coupon Routes - Public
 */
router.get("/coupons/public", couponController.getPublicCoupons);
router.post("/coupons/validate", optionalAuth, couponController.validateCoupon);

/**
 * Coupon Routes - Admin
 */
router.get("/admin/coupons", authenticate, storeStaffOnly, couponController.getCoupons);
router.post("/admin/coupons", authenticate, storeAdminOnly, couponController.createCoupon);
router.patch("/admin/coupons/:id", authenticate, storeAdminOnly, couponController.updateCoupon);
router.delete("/admin/coupons/:id", authenticate, storeAdminOnly, couponController.deleteCoupon);

/**
 * Staff Routes - Public
 */
router.get("/staff", bookingController.getStaff);
router.get("/staff/:id", bookingController.getStaffById);

/**
 * Staff Routes - Admin
 */
router.post("/staff", authenticate, storeAdminOnly, bookingController.createStaff);
router.patch("/staff/:id", authenticate, storeAdminOnly, bookingController.updateStaff);
router.delete("/staff/:id", authenticate, storeAdminOnly, bookingController.deleteStaff);

/**
 * Booking Routes - Public/Customer
 */
router.get("/bookings/availability", bookingController.getAvailability);
router.post("/bookings", optionalAuth, bookingController.createBooking);
router.get("/bookings/my-bookings", authenticate, bookingController.getMyBookings);
router.post("/bookings/:id/cancel", authenticate, bookingController.cancelBooking);

/**
 * Booking Routes - Admin
 */
router.get("/admin/bookings", authenticate, storeStaffOnly, bookingController.getAllBookings);
router.patch("/admin/bookings/:id/status", authenticate, storeStaffOnly, bookingController.updateBookingStatus);

/**
 * Contact Form Routes
 */
router.post("/contact", contactController.submitContactForm);
router.get("/admin/contacts", authenticate, storeStaffOnly, contactController.getContactSubmissions);
router.patch("/admin/contacts/:id", authenticate, storeStaffOnly, contactController.updateContactSubmission);

/**
 * Newsletter Routes
 */
router.post("/newsletter", contactController.subscribeNewsletter);
router.post("/newsletter/unsubscribe", contactController.unsubscribeNewsletter);
router.get("/admin/newsletter", authenticate, storeStaffOnly, contactController.getSubscribers);

module.exports = router;
