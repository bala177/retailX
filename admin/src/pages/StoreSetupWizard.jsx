import { useState } from "react";
import { useTenant } from "../context/TenantContext";
import { Store, ShoppingBag, Calendar, CreditCard, Users, Shield, Sparkles, Check, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const STEPS = [
  { id: 1, title: "Business Type", icon: Store },
  { id: 2, title: "Features", icon: Sparkles },
  { id: 3, title: "Branding", icon: Store },
  { id: 4, title: "Launch", icon: Rocket },
];

export default function StoreSetupWizard({ onComplete }) {
  const { currentTenant, refreshTenant } = useTenant();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    businessType: "products",
    industry: "general",
    features: {
      paymentEnabled: true,
      authEnabled: true,
      bookingEnabled: false,
      reviewsEnabled: true,
      wishlistEnabled: true,
      shippingEnabled: true,
      couponsEnabled: true,
      newsletterEnabled: true,
      contactFormEnabled: true,
    },
    branding: {
      primaryColor: "#4F46E5",
      secondaryColor: "#10B981",
    },
    storeName: currentTenant?.name || "",
    description: currentTenant?.description || "",
  });

  const businessTypes = [
    { id: "products", label: "Product Store", desc: "Sell physical or digital products online", icon: ShoppingBag, color: "#4F46E5" },
    { id: "services", label: "Service Business", desc: "Appointments, bookings & service listings", icon: Calendar, color: "#059669" },
    { id: "hybrid", label: "Hybrid", desc: "Both products and services", icon: Sparkles, color: "#D97706" },
  ];

  const industries = [
    { id: "fashion", label: "Fashion & Apparel" },
    { id: "electronics", label: "Electronics" },
    { id: "cosmetics", label: "Beauty & Cosmetics" },
    { id: "grocery", label: "Grocery & Food" },
    { id: "wellness", label: "Health & Wellness" },
    { id: "healthcare", label: "Healthcare" },
    { id: "general", label: "General Retail" },
    { id: "other", label: "Other" },
  ];

  const featureOptions = [
    { key: "paymentEnabled", label: "Online Payments", desc: "Accept payments via Stripe, PayPal, etc.", icon: CreditCard, recommended: true },
    { key: "authEnabled", label: "Customer Accounts", desc: "Let customers create accounts, track orders", icon: Users, recommended: true },
    { key: "bookingEnabled", label: "Appointment Booking", desc: "Allow customers to book appointments", icon: Calendar, recommended: config.businessType !== "products" },
    { key: "reviewsEnabled", label: "Product Reviews", desc: "Let customers leave ratings & reviews", icon: Sparkles, recommended: true },
    { key: "shippingEnabled", label: "Shipping & Delivery", desc: "Configure shipping methods and rates", icon: ShoppingBag, recommended: config.businessType !== "services" },
    { key: "couponsEnabled", label: "Coupons & Discounts", desc: "Create discount codes for promotions", icon: Sparkles, recommended: true },
    { key: "wishlistEnabled", label: "Wishlist", desc: "Let customers save items for later", icon: Sparkles, recommended: false },
    { key: "newsletterEnabled", label: "Newsletter", desc: "Collect email subscribers", icon: Sparkles, recommended: true },
    { key: "contactFormEnabled", label: "Contact Form", desc: "Receive inquiries from your storefront", icon: Sparkles, recommended: true },
  ];

  const handleBusinessTypeChange = (type) => {
    const newFeatures = { ...config.features };
    if (type === "services") {
      newFeatures.bookingEnabled = true;
      newFeatures.shippingEnabled = false;
    } else if (type === "products") {
      newFeatures.bookingEnabled = false;
      newFeatures.shippingEnabled = true;
    } else {
      newFeatures.bookingEnabled = true;
      newFeatures.shippingEnabled = true;
    }
    setConfig({ ...config, businessType: type, features: newFeatures });
  };

  const toggleFeature = (key) => {
    setConfig((prev) => ({ ...prev, features: { ...prev.features, [key]: !prev.features[key] } }));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const payload = {
        businessType: config.businessType,
        industry: config.industry,
        name: config.storeName || currentTenant?.name,
        description: config.description || currentTenant?.description,
        branding: { ...currentTenant?.branding, primaryColor: config.branding.primaryColor, secondaryColor: config.branding.secondaryColor },
        settings: {
          ...currentTenant?.settings,
          guestCheckout: !config.features.authEnabled,
          reviewsEnabled: config.features.reviewsEnabled,
          wishlistEnabled: config.features.wishlistEnabled,
          shippingEnabled: config.features.shippingEnabled,
        },
        features: {
          ...currentTenant?.features,
          payments: config.features.paymentEnabled,
          auth: config.features.authEnabled,
          bookings: config.features.bookingEnabled,
          reviews: config.features.reviewsEnabled,
          coupons: config.features.couponsEnabled,
          newsletter: config.features.newsletterEnabled,
          contactForm: config.features.contactFormEnabled,
          wishlist: config.features.wishlistEnabled,
          shipping: config.features.shippingEnabled,
        },
        setupCompleted: true,
      };
      await api.patch(`/store/${currentTenant?.slug}/settings`, payload, {
        headers: { "x-store-slug": currentTenant?.slug },
      });
      await refreshTenant?.();
      toast.success("🎉 Store setup complete!");
      onComplete?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Setup failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Store</h1>
          <p className="text-gray-500 mt-2">Configure your store in a few simple steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 h-1 mx-1 rounded ${step > s.id ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">What type of business is this?</h2>
                <p className="text-gray-500 mt-1">This helps us configure the right features for you</p>
              </div>
              <div className="grid gap-4">
                {businessTypes.map((bt) => (
                  <button key={bt.id} onClick={() => handleBusinessTypeChange(bt.id)} className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${config.businessType === bt.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${bt.color}15` }}>
                      <bt.icon className="w-6 h-6" style={{ color: bt.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{bt.label}</p>
                      <p className="text-sm text-gray-500">{bt.desc}</p>
                    </div>
                    {config.businessType === bt.id && <Check className="w-6 h-6 text-indigo-600" />}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setConfig({ ...config, industry: ind.id })}
                      className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${config.industry === ind.id ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose Your Features</h2>
                <p className="text-gray-500 mt-1">Enable or disable features based on your needs. You can always change these later.</p>
              </div>
              <div className="space-y-3">
                {featureOptions.map((feat) => (
                  <label key={feat.key} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${config.features[feat.key] ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" checked={config.features[feat.key]} onChange={() => toggleFeature(feat.key)} className="w-5 h-5 text-indigo-600 rounded" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{feat.label}</p>
                        {feat.recommended && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>}
                      </div>
                      <p className="text-sm text-gray-500">{feat.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> Start simple! You can enable more features later from Settings.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customize Your Branding</h2>
                <p className="text-gray-500 mt-1">Set your store's visual identity</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input type="text" value={config.storeName} onChange={(e) => setConfig({ ...config, storeName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="My Awesome Store" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="Describe your business in a sentence..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={config.branding.primaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, primaryColor: e.target.value } })} className="w-12 h-12 rounded-lg cursor-pointer border-0" />
                    <input type="text" value={config.branding.primaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, primaryColor: e.target.value } })} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={config.branding.secondaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, secondaryColor: e.target.value } })} className="w-12 h-12 rounded-lg cursor-pointer border-0" />
                    <input type="text" value={config.branding.secondaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, secondaryColor: e.target.value } })} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
                <div className="rounded-xl overflow-hidden border">
                  <div className="py-2 text-center text-sm text-white font-medium" style={{ backgroundColor: config.branding.primaryColor }}>
                    {config.storeName || "Your Store"} — Welcome!
                  </div>
                  <div className="p-6 bg-gray-50 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: config.branding.primaryColor }}>
                      {(config.storeName || "S").charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{config.storeName || "Your Store Name"}</h3>
                      <p className="text-sm text-gray-500">{config.description || "Your store description will appear here"}</p>
                    </div>
                  </div>
                  <div className="p-4 flex gap-2">
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: config.branding.primaryColor }}>
                      Primary Button
                    </button>
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: config.branding.secondaryColor }}>
                      Secondary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Launch */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Launch! 🎉</h2>
                <p className="text-gray-500 mt-2">Here's a summary of your store configuration</p>
              </div>
              <div className="text-left bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Store Name</span>
                  <span className="font-medium">{config.storeName || currentTenant?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Business Type</span>
                  <span className="font-medium capitalize">{config.businessType}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-medium capitalize">{config.industry}</span>
                </div>
                <div>
                  <span className="text-gray-500">Enabled Features:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(config.features)
                      .filter(([, v]) => v)
                      .map(([k]) => (
                        <span key={k} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                          {k
                            .replace("Enabled", "")
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </span>
                      ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Disabled Features:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(config.features)
                      .filter(([, v]) => !v)
                      .map(([k]) => (
                        <span key={k} className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-xs font-medium capitalize line-through">
                          {k
                            .replace("Enabled", "")
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold disabled:opacity-50">
                {saving ? "Setting up..." : "🚀 Launch My Store"}
              </button>
            )}
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-sm text-gray-400 hover:text-gray-600">
            Skip setup for now →
          </button>
        </div>
      </div>
    </div>
  );
}
