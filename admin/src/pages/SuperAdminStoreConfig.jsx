import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { superAdminAPI } from "../services/api";
import toast from "react-hot-toast";
import { Store, ArrowLeft, Save, RefreshCw, Settings, Users, Package, ShoppingCart, Calendar, CreditCard, CheckCircle, XCircle, Truck, Box, UserCheck, Star, Heart, Tag, Percent, Phone, Clock, AlertCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";

export default function SuperAdminStoreConfig() {
  const { id } = useParams();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [storeUsers, setStoreUsers] = useState([]);
  const [storeStats, setStoreStats] = useState(null);
  const [features, setFeatures] = useState({});
  const [bookingSettings, setBookingSettings] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    payment: true,
    booking: false,
    product: false,
    customer: false,
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied");
      navigate("/");
      return;
    }
    fetchStoreDetails();
  }, [id, isSuperAdmin]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.stores.getById(id);
      const { store: storeData, users, stats } = response.data.data;
      setStore(storeData);
      setStoreUsers(users);
      setStoreStats(stats);
      setFeatures(storeData.features || {});
      setBookingSettings(storeData.bookingSettings || {});
    } catch (error) {
      console.error("Failed to fetch store:", error);
      toast.error("Failed to load store details");
      navigate("/super-admin/stores");
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (key, value) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedFeatureToggle = (parent, key, value) => {
    setFeatures((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [key]: value,
      },
    }));
  };

  const handleBookingSettingChange = (key, value) => {
    setBookingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveFeatures = async () => {
    try {
      setSaving(true);
      await superAdminAPI.stores.updateFeatures(id, features);
      toast.success("Features updated successfully");
    } catch (error) {
      toast.error("Failed to update features");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBookingSettings = async () => {
    try {
      setSaving(true);
      await superAdminAPI.stores.updateBookingSettings(id, bookingSettings);
      toast.success("Booking settings updated successfully");
    } catch (error) {
      toast.error("Failed to update booking settings");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSetup = async (type) => {
    try {
      setSaving(true);
      if (type === "service") {
        await superAdminAPI.stores.setupService(id);
        toast.success("Store configured for service business");
      } else {
        const paymentEnabled = type === "product-with-payment";
        await superAdminAPI.stores.setupProducts(id, paymentEnabled);
        toast.success(`Store configured for product business ${paymentEnabled ? "with" : "without"} payment`);
      }
      fetchStoreDetails();
    } catch (error) {
      toast.error("Failed to configure store");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/super-admin/stores")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-500">
              {store.slug} • {store.industry}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${store.status === "active" ? "bg-green-100 text-green-700" : store.status === "suspended" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{store.status}</span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 capitalize">{store.plan} Plan</span>
        </div>
      </div>

      {/* Quick Setup Cards */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Setup Presets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => handleQuickSetup("service")} disabled={saving} className="p-4 bg-white rounded-xl border-2 border-transparent hover:border-purple-300 transition-all text-left group">
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Service Business</h3>
            <p className="text-sm text-gray-500 mt-1">Booking only, no cart or payment. Perfect for spas, salons, clinics.</p>
          </button>
          <button onClick={() => handleQuickSetup("product-no-payment")} disabled={saving} className="p-4 bg-white rounded-xl border-2 border-transparent hover:border-blue-300 transition-all text-left group">
            <Package className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Product Catalog</h3>
            <p className="text-sm text-gray-500 mt-1">Cart and checkout without payment. Customers call to confirm orders.</p>
          </button>
          <button onClick={() => handleQuickSetup("product-with-payment")} disabled={saving} className="p-4 bg-white rounded-xl border-2 border-transparent hover:border-green-300 transition-all text-left group">
            <CreditCard className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">Full E-commerce</h3>
            <p className="text-sm text-gray-500 mt-1">Complete e-commerce with cart, checkout, and payment processing.</p>
          </button>
        </div>
      </div>

      {/* Store Stats */}
      {storeStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Package className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{storeStats.products}</p>
            <p className="text-sm text-gray-500">Products</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <ShoppingCart className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{storeStats.orders}</p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Users className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{storeStats.customers}</p>
            <p className="text-sm text-gray-500">Customers</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Box className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{storeStats.categories}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </div>
      )}

      {/* Feature Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Core Features Section */}
        <FeatureSection title="Core System Features" icon={Settings} expanded={expandedSections.core} onToggle={() => toggleSection("core")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureToggle label="Payment System" description="Enable online payment processing" icon={CreditCard} enabled={features.paymentEnabled} onChange={(v) => handleFeatureToggle("paymentEnabled", v)} />
            <FeatureToggle label="Shopping Cart" description="Allow customers to add items to cart" icon={ShoppingCart} enabled={features.cartEnabled} onChange={(v) => handleFeatureToggle("cartEnabled", v)} />
            <FeatureToggle label="Booking System" description="Enable appointment booking" icon={Calendar} enabled={features.bookingEnabled} onChange={(v) => handleFeatureToggle("bookingEnabled", v)} />
            <FeatureToggle label="Guest Checkout" description="Allow checkout without account" icon={UserCheck} enabled={features.guestCheckoutEnabled} onChange={(v) => handleFeatureToggle("guestCheckoutEnabled", v)} />
            <FeatureToggle label="Shipping" description="Enable shipping options" icon={Truck} enabled={features.shippingEnabled} onChange={(v) => handleFeatureToggle("shippingEnabled", v)} />
            <FeatureToggle label="Inventory Management" description="Track product stock levels" icon={Box} enabled={features.inventoryEnabled} onChange={(v) => handleFeatureToggle("inventoryEnabled", v)} />
          </div>
        </FeatureSection>

        {/* Booking Features Section */}
        {features.bookingEnabled && (
          <FeatureSection title="Booking Configuration" icon={Calendar} expanded={expandedSections.booking} onToggle={() => toggleSection("booking")}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureToggle label="Require Payment for Booking" description="Customers must pay when booking" icon={CreditCard} enabled={features.bookingRequiresPayment} onChange={(v) => handleFeatureToggle("bookingRequiresPayment", v)} />
                <FeatureToggle label="Allow Cancellation" description="Customers can cancel bookings" icon={XCircle} enabled={features.bookingAllowCancellation} onChange={(v) => handleFeatureToggle("bookingAllowCancellation", v)} />
                <FeatureToggle label="Booking Reminders" description="Send reminder notifications" icon={Clock} enabled={features.bookingReminderEnabled} onChange={(v) => handleFeatureToggle("bookingReminderEnabled", v)} />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Booking Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                    <input type="number" value={bookingSettings.slotDuration || 60} onChange={(e) => handleBookingSettingChange("slotDuration", parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (minutes)</label>
                    <input type="number" value={bookingSettings.bufferTime || 15} onChange={(e) => handleBookingSettingChange("bufferTime", parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Booking Days</label>
                    <input type="number" value={bookingSettings.advanceBookingDays || 30} onChange={(e) => handleBookingSettingChange("advanceBookingDays", parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={bookingSettings.phoneNumber || ""}
                      onChange={(e) => handleBookingSettingChange("phoneNumber", e.target.value)}
                      placeholder="For booking confirmation calls"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Message</label>
                    <textarea
                      value={bookingSettings.confirmationMessage || ""}
                      onChange={(e) => handleBookingSettingChange("confirmationMessage", e.target.value)}
                      rows={3}
                      placeholder="Message shown after booking..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button onClick={handleSaveBookingSettings} disabled={saving} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Booking Settings
                </button>
              </div>
            </div>
          </FeatureSection>
        )}

        {/* Customer Features Section */}
        <FeatureSection title="Customer Features" icon={Users} expanded={expandedSections.customer} onToggle={() => toggleSection("customer")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureToggle label="Customer Accounts" description="Allow customers to create accounts" icon={UserCheck} enabled={features.customerAccountsEnabled} onChange={(v) => handleFeatureToggle("customerAccountsEnabled", v)} />
            <FeatureToggle label="Require Account" description="Require account for checkout" icon={AlertCircle} enabled={features.customerAccountRequired} onChange={(v) => handleFeatureToggle("customerAccountRequired", v)} />
            <FeatureToggle label="Reviews & Ratings" description="Allow product/service reviews" icon={Star} enabled={features.reviewsEnabled} onChange={(v) => handleFeatureToggle("reviewsEnabled", v)} />
            <FeatureToggle label="Wishlist" description="Allow saving items to wishlist" icon={Heart} enabled={features.wishlistEnabled} onChange={(v) => handleFeatureToggle("wishlistEnabled", v)} />
            <FeatureToggle label="Discounts" description="Enable discount pricing" icon={Tag} enabled={features.discountsEnabled} onChange={(v) => handleFeatureToggle("discountsEnabled", v)} />
            <FeatureToggle label="Coupons" description="Enable coupon codes" icon={Percent} enabled={features.couponsEnabled} onChange={(v) => handleFeatureToggle("couponsEnabled", v)} />
          </div>
        </FeatureSection>

        {/* Product Features Section */}
        <FeatureSection title="Product Features" icon={Package} expanded={expandedSections.product} onToggle={() => toggleSection("product")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureToggle label="Product Variants" enabled={features.productVariants} onChange={(v) => handleFeatureToggle("productVariants", v)} small />
            <FeatureToggle label="SKU" enabled={features.productSKU} onChange={(v) => handleFeatureToggle("productSKU", v)} small />
            <FeatureToggle label="Barcode" enabled={features.productBarcode} onChange={(v) => handleFeatureToggle("productBarcode", v)} small />
            <FeatureToggle label="Weight" enabled={features.productWeight} onChange={(v) => handleFeatureToggle("productWeight", v)} small />
            <FeatureToggle label="Dimensions" enabled={features.productDimensions} onChange={(v) => handleFeatureToggle("productDimensions", v)} small />
            <FeatureToggle label="Brand" enabled={features.productBrand} onChange={(v) => handleFeatureToggle("productBrand", v)} small />
            <FeatureToggle label="Tags" enabled={features.productTags} onChange={(v) => handleFeatureToggle("productTags", v)} small />
            <FeatureToggle label="Size (Fashion)" enabled={features.productSize} onChange={(v) => handleFeatureToggle("productSize", v)} small />
            <FeatureToggle label="Color (Fashion)" enabled={features.productColor} onChange={(v) => handleFeatureToggle("productColor", v)} small />
          </div>
        </FeatureSection>

        {/* Save Button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Changes will be applied immediately to the storefront</p>
            <button onClick={handleSaveFeatures} disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Features
            </button>
          </div>
        </div>
      </div>

      {/* Store Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-500" />
          Store Users ({storeUsers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {storeUsers.map((user) => (
                <tr key={user._id}>
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{user.role.replace("_", " ")}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{user.status}</span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FeatureSection({ title, icon: Icon, expanded, onToggle, children }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      {expanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function FeatureToggle({ label, description, icon: Icon, enabled, onChange, small }) {
  return (
    <div className={`flex items-center justify-between ${small ? "p-2" : "p-4 bg-gray-50 rounded-lg"}`}>
      <div className="flex items-center gap-3">
        {Icon && !small && (
          <div className={`p-2 rounded-lg ${enabled ? "bg-indigo-100" : "bg-gray-200"}`}>
            <Icon className={`h-5 w-5 ${enabled ? "text-indigo-600" : "text-gray-400"}`} />
          </div>
        )}
        <div>
          <p className={`font-medium text-gray-900 ${small ? "text-sm" : ""}`}>{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <button onClick={() => onChange(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-indigo-600" : "bg-gray-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
