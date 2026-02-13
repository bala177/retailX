import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, Truck, Shield, ArrowRight, Sparkles, Clock, Calendar, Cake, MapPin, Package } from "lucide-react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount, deliveryInfo, deliveryFee, taxAmount, grandTotal, hasCustomizedItems } = useCart();
  const { store, terminology, isServiceBased, storeSlug } = useStore();

  // Bakery detection
  const isBakeryStore = (() => {
    const slug = (storeSlug || "").toLowerCase();
    const name = (store?.name || "").toLowerCase();
    const combined = slug + " " + name;
    return (
      combined.includes("bake") ||
      combined.includes("bakery") ||
      combined.includes("cake") ||
      combined.includes("sweet") ||
      combined.includes("pastry") ||
      combined.includes("patisserie") ||
      combined.includes("confection") ||
      combined.includes("cupcake") ||
      combined.includes("dessert") ||
      combined.includes("cookie") ||
      combined.includes("donut") ||
      combined.includes("chocolate")
    );
  })();

  const brandColors = {
    primary: isBakeryStore ? "#d97706" : store?.branding?.primaryColor || "#6366f1",
    secondary: isBakeryStore ? "#ea580c" : store?.branding?.secondaryColor || "#4f46e5",
  };

  // Dynamic free shipping threshold from store settings
  const freeShippingThreshold = store?.shipping?.freeShippingThreshold || store?.settings?.freeShippingThreshold || 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const currencySymbol = store?.settings?.currencySymbol || "$";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">{isServiceBased ? <Calendar className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}</div>
            <div>
              <h2 className="text-lg font-bold">{isServiceBased ? "Your Bookings" : "Shopping Cart"}</h2>
              <p className="text-sm text-white/80">
                {itemCount} {itemCount === 1 ? (isServiceBased ? "service" : "item") : isServiceBased ? "services" : "items"}
              </p>
            </div>
          </div>
          <button onClick={closeCart} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress - Only for product stores */}
        {!isServiceBased && items.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-amber-500" />
                    Add <strong className="text-gray-900 mx-1">${remainingForFreeShipping.toFixed(2)}</strong> for FREE shipping
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                      backgroundColor: brandColors.primary,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-green-600 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                🎉 You've unlocked FREE shipping!
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColors.primary}15` }}>
                {isServiceBased ? <Calendar className="w-12 h-12" style={{ color: brandColors.primary }} /> : <ShoppingBag className="w-12 h-12" style={{ color: brandColors.primary }} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{isServiceBased ? "No services booked" : "Your cart is empty"}</h3>
              <p className="text-gray-500 mb-6">{isServiceBased ? "Browse our services and book your appointment!" : "Discover amazing products and start shopping!"}</p>
              <button onClick={closeCart} className="px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{ backgroundColor: brandColors.primary }}>
                {isServiceBased ? "Browse Services" : "Start Shopping"}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Link to={`/products/${item.slug}`} onClick={closeCart} className="flex-shrink-0">
                    <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.name} className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} onClick={closeCart} className="text-sm font-semibold text-gray-900 hover:underline block leading-tight">
                      {item.name}
                    </Link>
                    {item.variant && <p className="text-xs text-gray-500 mt-1">{item.variant}</p>}

                    {/* Bakery Customization Details */}
                    {item.customization && (
                      <div className="mt-2 text-xs space-y-1 bg-amber-50 rounded-lg p-2 border border-amber-100">
                        {item.customization.sizeLabel && (
                          <p className="flex items-center text-amber-800">
                            <Cake className="w-3 h-3 mr-1.5 text-amber-500" />
                            {item.customization.sizeLabel}
                          </p>
                        )}
                        {item.customization.flavorLabel && (
                          <p className="flex items-center text-amber-800">
                            <Sparkles className="w-3 h-3 mr-1.5 text-amber-500" />
                            {item.customization.flavorLabel}
                          </p>
                        )}
                        {item.customization.message && <p className="flex items-center text-purple-700 italic">💬 "{item.customization.message}"</p>}
                        {item.customization.customImage && <p className="flex items-center text-blue-700">📷 Photo cake</p>}
                      </div>
                    )}

                    {/* Booking Details */}
                    {item.bookingDetails && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 rounded-lg p-2">
                        <p className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                          {new Date(item.bookingDetails.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="flex items-center">
                          <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                          {(() => {
                            const [hours, minutes] = item.bookingDetails.time.split(":");
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          })()}
                        </p>
                      </div>
                    )}

                    {!item.bookingDetails && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-base font-bold" style={{ color: brandColors.primary }}>
                          ${item.price.toFixed(2)}
                        </span>
                        {item.originalPrice > item.price && <span className="text-xs text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>}
                      </div>
                    )}

                    {item.bookingDetails && (
                      <div className="mt-2">
                        <span className="text-base font-bold" style={{ color: brandColors.primary }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.maxQuantity || 99)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Item total:</span>
                      <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {/* Promo Hint */}
            <div className="flex items-center text-sm text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <Tag className="w-4 h-4 mr-2 text-amber-600" />
              <span>
                Use code <strong className="text-amber-700">WELCOME20</strong> for 20% off!
              </span>
            </div>

            {/* Delivery Info for Bakery */}
            {isBakeryStore && deliveryInfo && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-800 flex items-center">
                  {deliveryInfo.type === "pickup" ? (
                    <>
                      <Package className="w-3.5 h-3.5 mr-1.5" /> Store Pickup
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5 mr-1.5" /> {deliveryInfo.typeLabel || "Delivery"}
                    </>
                  )}
                </p>
                {deliveryInfo.dateFormatted && (
                  <p className="text-xs text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                    {deliveryInfo.dateFormatted}
                  </p>
                )}
                {deliveryInfo.slotTime && (
                  <p className="text-xs text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                    {deliveryInfo.slotTime}
                  </p>
                )}
              </div>
            )}

            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal ({itemCount} items)</span>
                <span className="text-gray-900 font-medium">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              {/* Bakery: Delivery fee & Tax breakdown */}
              {isBakeryStore && hasCustomizedItems && (
                <>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Truck className="w-3.5 h-3.5 mr-1.5" />
                      Delivery Fee
                    </span>
                    <span className={deliveryFee === 0 ? "text-emerald-600 font-medium" : "text-gray-900 font-medium"}>{deliveryFee === 0 ? "FREE" : `${currencySymbol}${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Tax (est.)</span>
                    <span className="text-gray-900 font-medium">
                      {currencySymbol}
                      {taxAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">{isBakeryStore && hasCustomizedItems ? "Grand Total" : "Estimated Total"}</span>
                <span className="text-xl font-bold" style={{ color: brandColors.primary }}>
                  {currencySymbol}
                  {isBakeryStore && hasCustomizedItems ? grandTotal.toFixed(2) : subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {isServiceBased ? "Final confirmation at checkout" : isBakeryStore ? "Inclusive of all charges" : "Shipping & taxes calculated at checkout"}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link to="/checkout" onClick={closeCart} className="flex items-center justify-center w-full py-4 text-white text-center rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" style={{ backgroundColor: brandColors.primary }}>
                {isServiceBased ? "Confirm Booking" : "Proceed to Checkout"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/cart" onClick={closeCart} className="block w-full py-3 bg-gray-100 text-gray-700 text-center rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                {isServiceBased ? "View All Bookings" : "View Full Cart"}
              </Link>
            </div>

            {/* Trust Badges - different for services */}
            <div className="flex items-center justify-center space-x-4 pt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-green-500" />
                Secure
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center">
                {isServiceBased ? (
                  <>
                    <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Easy Reschedule
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Free Returns
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
