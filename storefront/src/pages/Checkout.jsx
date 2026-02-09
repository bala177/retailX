import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import api, { couponAPI } from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Truck, Shield, Loader2, Check, User, MapPin, Phone, Mail, Lock, Package, Clock, ChevronRight, Tag, Gift, AlertCircle, Store, Calendar, BadgeCheck, Sparkles, LogIn, Home, PhoneCall, MessageCircle } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart, itemCount } = useCart();
  const { store, isServiceBased, terminology, features, bookingSettings } = useStore();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState("");

  // Check if coming from direct booking flow
  const fromBooking = location.state?.fromBooking || false;
  const bookingServiceName = location.state?.serviceName || "";

  // Feature flags determine checkout behavior
  const paymentEnabled = features?.paymentEnabled ?? true;
  const cartEnabled = features?.cartEnabled ?? true;
  const bookingEnabled = features?.bookingEnabled ?? false;

  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    saveAddress: true,
  });

  // Auto-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = (user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setShippingData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  const [billingData, setBillingData] = useState({
    sameAsShipping: true,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
  });

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Shipping options
  // Dynamic shipping options from store settings
  const freeShippingThreshold = store?.shipping?.freeShippingThreshold || 50;
  const storeShippingMethods = store?.shipping?.methods;
  const currencySymbol = store?.settings?.currencySymbol || "$";

  const shippingOptions =
    storeShippingMethods && storeShippingMethods.length > 0
      ? storeShippingMethods.map((m) => ({
          id: m.id || m.name?.toLowerCase().replace(/\s+/g, "-") || "standard",
          name: m.name,
          price: m.name?.toLowerCase().includes("free") || m.price === 0 ? 0 : subtotal >= freeShippingThreshold && m.id === "standard" ? 0 : m.price || 0,
          time: m.estimatedDays || m.time || "5-7 business days",
          icon: m.name?.toLowerCase().includes("overnight") ? Clock : m.name?.toLowerCase().includes("express") ? Package : Truck,
        }))
      : [
          { id: "standard", name: "Standard Shipping", price: subtotal >= freeShippingThreshold ? 0 : 9.99, time: "5-7 business days", icon: Truck },
          { id: "express", name: "Express Shipping", price: 14.99, time: "2-3 business days", icon: Package },
          { id: "overnight", name: "Overnight Shipping", price: 29.99, time: "Next business day", icon: Clock },
        ];

  const selectedShipping = shippingOptions.find((s) => s.id === shippingMethod) || shippingOptions[0];
  const discount = promoApplied ? promoDiscount : 0;
  const afterDiscount = subtotal - discount;
  const shippingCost = isServiceBased ? 0 : selectedShipping?.price || 0;
  // Dynamic tax rate from store settings (default 8%)
  const taxRate = store?.settings?.taxRate != null ? store.settings.taxRate / 100 : 0.08;
  const tax = afterDiscount * taxRate;
  const total = afterDiscount + shippingCost + tax;

  // Apply promo code via API
  const applyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    try {
      const res = await couponAPI.validate(promoCode.trim(), subtotal);
      const couponData = res.data?.data;
      if (couponData) {
        const discountAmount = couponData.discountAmount || (couponData.discountType === "percentage" ? subtotal * (couponData.discountValue / 100) : couponData.discountValue) || 0;
        setPromoDiscount(discountAmount);
        setPromoLabel(couponData.discountType === "percentage" ? `${couponData.discountValue}%` : `${currencySymbol}${couponData.discountValue}`);
        setPromoApplied(true);
        toast.success(`Promo code applied! ${currencySymbol}${discountAmount.toFixed(2)} off`);
      }
    } catch (error) {
      // Fallback: try hardcoded WELCOME20
      if (promoCode.toUpperCase() === "WELCOME20") {
        const d = subtotal * 0.2;
        setPromoDiscount(d);
        setPromoLabel("20%");
        setPromoApplied(true);
        toast.success("Promo code applied! 20% off your order.");
      } else {
        toast.error(error.response?.data?.message || "Invalid promo code");
      }
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/order-confirmation/${data.data.orderNumber}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;

    // Format card number
    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    // Format expiry date
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
    }

    // Format CVV
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setPaymentData({ ...paymentData, [name]: value });
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      // For services, only validate contact info (no shipping address required)
      if (isServiceBased || !paymentEnabled) {
        if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || !shippingData.phone) {
          toast.error("Please fill in all required contact fields");
          return false;
        }
      } else {
        // For retail, validate full shipping address
        if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || !shippingData.phone || !shippingData.address || !shippingData.city || !shippingData.state || !shippingData.zipCode) {
          toast.error("Please fill in all required fields");
          return false;
        }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    // Only validate payment if payment is enabled
    if (currentStep === 2 && paymentEnabled) {
      if (!paymentData.cardHolder || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        toast.error("Please fill in all payment details");
        return false;
      }
      if (paymentData.cardNumber.replace(/\s/g, "").length !== 16) {
        toast.error("Please enter a valid card number");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    // For non-payment flow, step 1 goes directly to step 2 (confirmation page)
    // and step 2 is the final step (no order creation, just display call info)
    if (!paymentEnabled) {
      if (step === 1) {
        setStep(2);
        window.scrollTo(0, 0);
        return;
      }
      // Step 2 for non-payment is just informational (call to confirm)
      // No order creation needed - user will call to confirm
      return;
    }

    // Standard payment flow
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Prepare order data - match backend expectations
    const orderData = {
      items: items.map((item) => ({
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      customerInfo: {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        email: shippingData.email,
        phone: shippingData.phone,
      },
      shippingAddress: {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        street: shippingData.address,
        apartment: shippingData.apartment,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
        country: shippingData.country,
        phone: shippingData.phone,
      },
      billingAddress: billingData.sameAsShipping
        ? {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            street: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            zipCode: shippingData.zipCode,
            country: shippingData.country,
            sameAsShipping: true,
          }
        : {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            street: billingData.address,
            city: billingData.city,
            state: billingData.state,
            zipCode: billingData.zipCode,
            country: billingData.country,
            sameAsShipping: false,
          },
      paymentMethod: "stripe", // Demo payment - simulates Stripe payment
      shippingMethod: shippingMethod,
    };

    createOrderMutation.mutate(orderData);
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate(isServiceBased ? "/" : "/cart");
    }
  }, [items, navigate, isServiceBased]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {isServiceBased && fromBooking ? (
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          ) : (
            <Link to="/cart" className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {isServiceBased ? "Bookings" : "Cart"}
            </Link>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Store className="w-4 h-4" />
            <span>
              {isServiceBased ? "Booking at" : "Shopping at"} <span className="font-semibold text-gray-900">{store?.name}</span>
            </span>
          </div>
        </div>

        {/* Booking Confirmation Banner - Only for direct booking flow */}
        {isServiceBased && fromBooking && (
          <div className="mb-8 p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Appointment Selected!</h3>
                <p className="text-sm text-green-700">Complete payment to confirm your booking{bookingServiceName ? ` for ${bookingServiceName}` : ""}</p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-green-700">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Almost Done</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps - Simplified for non-payment flow */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {paymentEnabled
              ? // Full payment flow steps
                [
                  { num: 1, label: isServiceBased ? "Details" : "Shipping", icon: isServiceBased ? User : Truck },
                  { num: 2, label: "Payment", icon: CreditCard },
                  { num: 3, label: isServiceBased ? "Confirm" : "Review", icon: Check },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center">
                    <button
                      onClick={() => s.num < step && setStep(s.num)}
                      disabled={s.num > step}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${step >= s.num ? "text-white shadow-lg" : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}
                      style={step >= s.num ? { backgroundColor: brandColors.primary } : {}}
                    >
                      {step > s.num ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                    </button>
                    <span className={`ml-3 font-semibold hidden sm:block ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                    {idx < 2 && <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full transition-colors ${step > s.num ? "" : "bg-gray-200"}`} style={step > s.num ? { backgroundColor: brandColors.primary } : {}} />}
                  </div>
                ))
              : // Simplified booking-only flow (no payment)
                [
                  { num: 1, label: "Your Details", icon: User },
                  { num: 2, label: "Confirm Booking", icon: PhoneCall },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center">
                    <button
                      onClick={() => s.num < step && setStep(s.num)}
                      disabled={s.num > step}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${step >= s.num ? "text-white shadow-lg" : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}
                      style={step >= s.num ? { backgroundColor: brandColors.primary } : {}}
                    >
                      {step > s.num ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                    </button>
                    <span className={`ml-3 font-semibold hidden sm:block ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                    {idx < 1 && <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full transition-colors ${step > s.num ? "" : "bg-gray-200"}`} style={step > s.num ? { backgroundColor: brandColors.primary } : {}} />}
                  </div>
                ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Step */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Sign In Prompt for Non-Authenticated Users */}
                  {!isAuthenticated && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <LogIn className="w-6 h-6" style={{ color: brandColors.primary }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Have an account?</h3>
                            <p className="text-sm text-gray-600">Sign in for faster checkout and to track your orders</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => openAuthModal("login")} className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: brandColors.primary }}>
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Signed In User Info */}
                  {isAuthenticated && user && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border-2 border-green-200">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Signed in as {user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                        <User className="w-5 h-5" style={{ color: brandColors.primary }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                        <input type="text" name="firstName" value={shippingData.firstName} onChange={handleShippingChange} required placeholder="John" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                        <input type="text" name="lastName" value={shippingData.lastName} onChange={handleShippingChange} required placeholder="Doe" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={shippingData.email}
                            onChange={handleShippingChange}
                            required
                            placeholder="john@example.com"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={shippingData.phone}
                            onChange={handleShippingChange}
                            required
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address / Location Section - optional for services */}
                  {!isServiceBased && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                          <MapPin className="w-5 h-5" style={{ color: brandColors.primary }} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                          <input type="text" name="address" value={shippingData.address} onChange={handleShippingChange} required placeholder="123 Main Street" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Apartment, suite, etc. (optional)</label>
                          <input type="text" name="apartment" value={shippingData.apartment} onChange={handleShippingChange} placeholder="Apt 4B" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                            <input type="text" name="city" value={shippingData.city} onChange={handleShippingChange} required placeholder="New York" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                            <input type="text" name="state" value={shippingData.state} onChange={handleShippingChange} required placeholder="NY" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
                            <input type="text" name="zipCode" value={shippingData.zipCode} onChange={handleShippingChange} required placeholder="10001" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                          <select name="country" value={shippingData.country} onChange={handleShippingChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white">
                            <option>United States</option>
                            <option>Canada</option>
                            <option>United Kingdom</option>
                            <option>Australia</option>
                          </select>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={shippingData.saveAddress} onChange={(e) => setShippingData({ ...shippingData, saveAddress: e.target.checked })} className="w-5 h-5 rounded focus:ring-indigo-500" style={{ accentColor: brandColors.primary }} />
                          <span className="ml-3 text-sm text-gray-700">Save this address for future orders</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Shipping Method - Only for retail */}
                  {!isServiceBased && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                          <Truck className="w-5 h-5" style={{ color: brandColors.primary }} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Shipping Method</h2>
                      </div>

                      <div className="space-y-3">
                        {shippingOptions.map((option) => (
                          <label key={option.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === option.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <input type="radio" name="shippingMethod" value={option.id} checked={shippingMethod === option.id} onChange={(e) => setShippingMethod(e.target.value)} className="w-5 h-5" style={{ accentColor: brandColors.primary }} />
                            <option.icon className={`w-6 h-6 mx-4 ${shippingMethod === option.id ? "text-indigo-600" : "text-gray-400"}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{option.name}</p>
                              <p className="text-sm text-gray-500">{option.time}</p>
                            </div>
                            <span className={`font-bold ${option.price === 0 ? "text-green-600" : "text-gray-900"}`}>{option.price === 0 ? "FREE" : `$${option.price.toFixed(2)}`}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full py-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                    {paymentEnabled ? "Continue to Payment" : "Continue to Confirmation"}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Payment Step - Only show if payment is enabled */}
              {step === 2 && paymentEnabled && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                        <CreditCard className="w-5 h-5" style={{ color: brandColors.primary }} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                    </div>

                    {/* Card Icons */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">VISA</div>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">MC</div>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">AMEX</div>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700">DISC</div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={paymentData.cardHolder}
                          onChange={handlePaymentChange}
                          required
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number *</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentData.cardNumber}
                            onChange={handlePaymentChange}
                            required
                            placeholder="4242 4242 4242 4242"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date *</label>
                          <input type="text" name="expiryDate" value={paymentData.expiryDate} onChange={handlePaymentChange} required placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
                          <div className="relative">
                            <input type="text" name="cvv" value={paymentData.cvv} onChange={handlePaymentChange} required placeholder="123" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 group cursor-help">
                              <AlertCircle className="w-5 h-5 text-gray-400" />
                              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">The 3 or 4 digit security code on the back of your card</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={billingData.sameAsShipping} onChange={(e) => setBillingData({ ...billingData, sameAsShipping: e.target.checked })} className="w-5 h-5 rounded focus:ring-indigo-500" style={{ accentColor: brandColors.primary }} />
                          <span className="ml-3 text-sm text-gray-700">Billing address same as shipping</span>
                        </label>
                      </div>

                      {/* Security Notice */}
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Your payment is secure</p>
                          <p className="text-xs text-green-700 mt-1">We use industry-standard 256-bit SSL encryption to protect your payment information.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                    <button type="submit" className="flex-1 py-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                      Review Order
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Call-to-Confirm Step - For booking without payment */}
              {step === 2 && !paymentEnabled && (
                <div className="space-y-6">
                  {/* Booking Summary Card */}
                  <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl border-2 border-teal-200 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Your Booking is Almost Ready!</h2>
                        <p className="text-gray-600">Please call us to confirm your appointment</p>
                      </div>
                    </div>

                    {/* Selected Services */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Selected {terminology?.product || "Service"}(s):</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            {item.duration && (
                              <span className="text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {item.duration} min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Details Recap */}
                    <div className="bg-white rounded-xl p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Your Contact Details:</h3>
                      <p className="text-gray-700">
                        {shippingData.firstName} {shippingData.lastName}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {shippingData.email} • {shippingData.phone}
                      </p>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center space-x-3 bg-teal-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                        <PhoneCall className="w-6 h-6" />
                        <span className="text-2xl font-bold tracking-wide">{bookingSettings?.phoneNumber || store?.contact?.phone || "+1 (555) 000-0000"}</span>
                      </div>
                      <p className="text-gray-600 text-sm">Our team is available during business hours to assist you</p>
                    </div>
                  </div>

                  {/* Confirmation Message */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {bookingSettings?.confirmationMessage || `Thank you for choosing ${store?.name}! Please call us at the number above to confirm your booking. Our friendly staff will help you find the perfect time slot and answer any questions you may have.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours (if available) */}
                  {bookingSettings?.workingHours && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-500" />
                        Our Business Hours
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(bookingSettings.workingHours).map(([day, hours]) => (
                          <div key={day} className={`p-3 rounded-lg ${hours.isOpen ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                            <p className="font-semibold text-sm capitalize text-gray-900">{day}</p>
                            <p className={`text-xs ${hours.isOpen ? "text-green-700" : "text-gray-500"}`}>{hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                    <Link to="/" className="flex-1 py-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                      <Home className="w-5 h-5 mr-2" />
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Shipping Review */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                          {isServiceBased ? <User className="w-5 h-5" style={{ color: brandColors.primary }} /> : <MapPin className="w-5 h-5" style={{ color: brandColors.primary }} />}
                        </div>
                        <h3 className="font-bold text-gray-900">{isServiceBased ? "Contact Information" : "Shipping Address"}</h3>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold hover:underline" style={{ color: brandColors.primary }}>
                        Edit
                      </button>
                    </div>
                    <div className="ml-13 pl-13 text-gray-600 leading-relaxed">
                      <p className="font-semibold text-gray-900">
                        {shippingData.firstName} {shippingData.lastName}
                      </p>
                      {!isServiceBased && (
                        <>
                          <p>
                            {shippingData.address}
                            {shippingData.apartment && `, ${shippingData.apartment}`}
                          </p>
                          <p>
                            {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                          </p>
                          <p>{shippingData.country}</p>
                        </>
                      )}
                      <p className={isServiceBased ? "" : "mt-2 text-sm"}>
                        {shippingData.email} • {shippingData.phone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Method Review - Only for retail */}
                  {!isServiceBased && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                            <Truck className="w-5 h-5" style={{ color: brandColors.primary }} />
                          </div>
                          <h3 className="font-bold text-gray-900">Shipping Method</h3>
                        </div>
                        <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold hover:underline" style={{ color: brandColors.primary }}>
                          Edit
                        </button>
                      </div>
                      <div className="ml-13 pl-13 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{selectedShipping?.name}</p>
                          <p className="text-sm text-gray-500">{selectedShipping?.time}</p>
                        </div>
                        <span className={`font-bold ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Review */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                          <CreditCard className="w-5 h-5" style={{ color: brandColors.primary }} />
                        </div>
                        <h3 className="font-bold text-gray-900">Payment Method</h3>
                      </div>
                      <button type="button" onClick={() => setStep(2)} className="text-sm font-semibold hover:underline" style={{ color: brandColors.primary }}>
                        Edit
                      </button>
                    </div>
                    <div className="ml-13 pl-13 flex items-center">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 mr-4">{paymentData.cardNumber.startsWith("4") ? "VISA" : paymentData.cardNumber.startsWith("5") ? "MC" : "CARD"}</div>
                      <div>
                        <p className="font-semibold text-gray-900">•••• •••• •••• {paymentData.cardNumber.slice(-4)}</p>
                        <p className="text-sm text-gray-500">Expires {paymentData.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                        <Package className="w-5 h-5" style={{ color: brandColors.primary }} />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        {isServiceBased ? "Bookings" : "Order Items"} ({itemCount})
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-xl">
                          <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                            {item.bookingDetails ? (
                              <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                <p className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                  {new Date(item.bookingDetails.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </p>
                                <p className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                                  {(() => {
                                    const [hours, minutes] = item.bookingDetails.time.split(":");
                                    const hour = parseInt(hours);
                                    const ampm = hour >= 12 ? "PM" : "AM";
                                    const displayHour = hour % 12 || 12;
                                    return `${displayHour}:${minutes} ${ampm}`;
                                  })()}
                                </p>
                                {item.bookingDetails.staff && <p>with {item.bookingDetails.staff.name}</p>}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            )}
                          </div>
                          <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="flex-1 py-4 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          {isServiceBased ? `Confirm Booking - $${total.toFixed(2)}` : `Place Order - $${total.toFixed(2)}`}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{isServiceBased ? "Booking Summary" : "Order Summary"}</h2>

              {/* Items Preview */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="relative flex-shrink-0">
                      <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.bookingDetails ? (
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.bookingDetails.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                          <p className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {(() => {
                              const [hours, minutes] = item.bookingDetails.time.split(":");
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? "PM" : "AM";
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes} ${ampm}`;
                            })()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Promo Code</label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" disabled={promoApplied} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                  </div>
                  <button type="button" onClick={applyPromo} disabled={promoApplied || !promoCode} className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    {promoCode.toUpperCase()} applied! ({promoLabel} off)
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Discount ({promoLabel})
                    </span>
                    <span className="text-green-600 font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                {!isServiceBased && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span style={{ color: brandColors.primary }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges - Different for services vs retail */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-500 mr-3" />
                  <span>SSL Encrypted Checkout</span>
                </div>
                {isServiceBased ? (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <BadgeCheck className="w-5 h-5 text-blue-500 mr-3" />
                      <span>Certified Professionals</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-5 h-5 text-purple-500 mr-3" />
                      <span>Easy Rescheduling</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-blue-500 mr-3" />
                      <span>Free Returns within 30 days</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="w-5 h-5 text-purple-500 mr-3" />
                      <span>Order Tracking Available</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
