import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../services/api";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Heart, Gift, Truck, Shield, Tag, CreditCard, Star, Clock, ChevronRight, Calendar, Check } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount, addItem } = useCart();
  const { store, storeSlug, isServiceBased, terminology } = useStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [savedItems, setSavedItems] = useState([]);

  // Fetch recommended products
  const { data: recommendedData } = useQuery({
    queryKey: ["recommended-products", storeSlug],
    queryFn: () => productsAPI.getBestsellers(storeSlug, 4),
    enabled: !!storeSlug,
  });

  const recommendedProducts = recommendedData?.data?.data?.products || [];

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Handle promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME20") {
      setPromoApplied(true);
    }
  };

  // Move item to saved
  const saveForLater = (item) => {
    setSavedItems([...savedItems, item]);
    removeItem(item.id);
  };

  // Move item back to cart
  const moveToCart = (item) => {
    addItem(item);
    setSavedItems(savedItems.filter((i) => i.id !== item.id));
  };

  // Calculate values - no shipping for services
  const discount = promoApplied ? subtotal * 0.2 : 0;
  const afterDiscount = subtotal - discount;
  const shipping = isServiceBased ? 0 : afterDiscount >= 50 ? 0 : 9.99;
  const tax = afterDiscount * 0.08; // 8% tax
  const total = afterDiscount + shipping + tax;

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-20">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">{isServiceBased ? <Calendar className="w-16 h-16 text-gray-300" /> : <ShoppingBag className="w-16 h-16 text-gray-300" />}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{isServiceBased ? "No services booked" : "Your cart is empty"}</h2>
          <p className="text-gray-500 mb-8">{isServiceBased ? "Browse our services and book your first appointment!" : "Looks like you haven't added anything to your cart yet. Explore our products and find something you love!"}</p>
          <Link to="/products" className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl" style={{ backgroundColor: brandColors.primary }}>
            {isServiceBased ? <Calendar className="w-5 h-5 mr-2" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
            {isServiceBased ? "Browse Services" : "Start Shopping"}
          </Link>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16 text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Products</h3>
              <div className="grid grid-cols-2 gap-4">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <Link key={product._id} to={`/products/${product.slug}`} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                    <img src={product.images?.[0]?.url || product.primaryImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-3" />
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: brandColors.primary }}>
                      ${product.pricing?.salePrice || product.pricing?.basePrice}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isServiceBased ? "Your Bookings" : "Shopping Cart"}</h1>
            <p className="text-gray-500 mt-1">
              {itemCount} {itemCount === 1 ? (isServiceBased ? "service" : "item") : isServiceBased ? "services" : "items"} in your {isServiceBased ? "bookings" : "cart"}
            </p>
          </div>
          <Link to="/products" className="mt-4 md:mt-0 flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isServiceBased ? "Browse More Services" : "Continue Shopping"}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping Progress - Only for product stores */}
            {!isServiceBased && subtotal < 50 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!</p>
                    <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isServiceBased && subtotal >= 50 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">🎉 You qualify for FREE shipping!</p>
                  <p className="text-sm text-green-700">Your order will be delivered for free</p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="hidden md:flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <span className="flex-1">{isServiceBased ? "Service" : "Product"}</span>
                <span className="w-28 text-center">Price</span>
                <span className="w-36 text-center">{isServiceBased ? "Sessions" : "Quantity"}</span>
                <span className="w-28 text-center">Total</span>
                <span className="w-24"></span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Product */}
                      <div className="flex items-center flex-1 min-w-0">
                        <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                          <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.name} className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" />
                        </Link>
                        <div className="ml-4 min-w-0 flex-1">
                          <Link to={`/products/${item.slug}`} className="text-base font-semibold text-gray-900 hover:underline block truncate" style={{ color: "inherit" }}>
                            {item.name}
                          </Link>
                          {item.variant && <p className="text-sm text-gray-500 mt-1">Variant: {item.variant}</p>}

                          {/* Booking Details */}
                          {item.bookingDetails && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                {new Date(item.bookingDetails.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                {(() => {
                                  const [hours, minutes] = item.bookingDetails.time.split(":");
                                  const hour = parseInt(hours);
                                  const ampm = hour >= 12 ? "PM" : "AM";
                                  const displayHour = hour % 12 || 12;
                                  return `${displayHour}:${minutes} ${ampm}`;
                                })()}
                              </p>
                              {item.bookingDetails.staff && <p className="text-sm text-gray-600">with {item.bookingDetails.staff.name}</p>}
                            </div>
                          )}

                          {!item.bookingDetails && (
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                              {isServiceBased ? <Check className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                              {isServiceBased ? "Available" : "In Stock"}
                            </p>
                          )}

                          {/* Mobile Price */}
                          <div className="mt-2 md:hidden">
                            <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                            {item.originalPrice > item.price && <span className="ml-2 text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Price - Desktop */}
                      <div className="hidden md:block w-28 text-center">
                        <span className="text-base font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                        {item.originalPrice > item.price && <span className="block text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center md:justify-center w-full md:w-36">
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.maxQuantity || 99)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="hidden md:block w-28 text-center">
                        <span className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between md:justify-end w-full md:w-24 gap-2">
                        <span className="text-lg font-bold text-gray-900 md:hidden">Total: ${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => saveForLater(item)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Save for later">
                            <Heart className="w-5 h-5" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-medium flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </button>
                <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate("/products")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Saved for Later ({savedItems.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {savedItems.map((item) => (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: brandColors.primary }}>
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button onClick={() => moveToCart(item)} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-amber-500" />
                    Frequently Bought Together
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedProducts.slice(0, 4).map((product) => (
                    <Link key={product._id} to={`/products/${product.slug}`} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 border border-gray-100 group-hover:border-gray-300 transition-colors">
                        <img src={product.images?.[0]?.url || product.primaryImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:underline">{product.name}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: brandColors.primary }}>
                        ${product.pricing?.salePrice || product.pricing?.basePrice}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                  <span className="text-gray-900 font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Discount (20%)
                    </span>
                    <span className="text-green-600 font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}

                {!isServiceBased && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? <span className="text-green-600">FREE</span> : <span className="text-gray-900">${shipping.toFixed(2)}</span>}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimated Tax</span>
                  <span className="text-gray-900 font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span style={{ color: brandColors.primary }}>${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Have a promo code?</label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" disabled={promoApplied} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                  </div>
                  <button onClick={applyPromo} disabled={promoApplied || !promoCode} className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Code WELCOME20 applied! You saved ${discount.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">Try: WELCOME20</p>
              </div>

              <Link to="/checkout" className="flex items-center justify-center w-full px-6 py-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl" style={{ backgroundColor: brandColors.primary }}>
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
                {isServiceBased ? (
                  <>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span>Easy rescheduling available</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Check className="w-5 h-5 text-purple-500" />
                      <span>Satisfaction guaranteed</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <span>Free returns within 30 days</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <CreditCard className="w-5 h-5 text-purple-500" />
                      <span>All major credit cards accepted</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Icons */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center mb-3">Secure payment with</p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">VISA</div>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">MC</div>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">AMEX</div>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">PayPal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
