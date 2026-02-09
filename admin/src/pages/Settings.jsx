import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Save, Store, Globe, Mail, Phone, MapPin, Palette, CreditCard, Truck, Image as ImageIcon, Upload, X, Clock, Megaphone, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export default function Settings() {
  const { currentTenant, refreshTenant } = useTenant();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState(getDefaultFormData());
  const [uploading, setUploading] = useState({});
  const fileInputRefs = {
    logo: useRef(null),
    favicon: useRef(null),
    heroBanner: useRef(null),
    heroBannerAlt: useRef(null),
    aboutImage: useRef(null),
  };

  function getDefaultFormData() {
    return {
      name: "",
      description: "",
      industry: "general",
      businessType: "products",
      branding: { logo: "", favicon: "", heroBanner: "", heroBannerAlt: "", primaryColor: "#4F46E5", secondaryColor: "#10B981", accentColor: "#F59E0B" },
      contact: { email: "", phone: "", address: { street: "", city: "", state: "", country: "", zipCode: "" } },
      socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "", tiktok: "" },
      settings: { currency: "USD", currencySymbol: "$", timezone: "America/New_York", taxRate: 0, shippingEnabled: true, guestCheckout: true, reviewsEnabled: true, wishlistEnabled: true },
      shipping: { methods: [], freeShippingThreshold: 0 },
      bookingSettings: {
        workingHours: {
          monday: { start: "09:00", end: "18:00", enabled: true },
          tuesday: { start: "09:00", end: "18:00", enabled: true },
          wednesday: { start: "09:00", end: "18:00", enabled: true },
          thursday: { start: "09:00", end: "18:00", enabled: true },
          friday: { start: "09:00", end: "18:00", enabled: true },
          saturday: { start: "10:00", end: "16:00", enabled: true },
          sunday: { start: "10:00", end: "14:00", enabled: false },
        },
        slotDuration: 60,
        bufferTime: 15,
      },
      aboutContent: { headline: "", description: "", story: "", mission: "", images: [], values: [], stats: [], features: [] },
      promoBanner: { enabled: false, text: "", link: "", backgroundColor: "#4F46E5", textColor: "#FFFFFF" },
      seo: { metaTitle: "", metaDescription: "" },
    };
  }

  function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        out[key] = deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined && source[key] !== null) {
        out[key] = source[key];
      }
    }
    return out;
  }

  useEffect(() => {
    if (currentTenant) {
      setFormData((prev) =>
        deepMerge(prev, {
          name: currentTenant.name || "",
          description: currentTenant.description || "",
          industry: currentTenant.industry || "general",
          businessType: currentTenant.businessType || "products",
          branding: currentTenant.branding || {},
          contact: currentTenant.contact || {},
          socialLinks: currentTenant.socialLinks || {},
          settings: currentTenant.settings || {},
          shipping: currentTenant.shipping || {},
          bookingSettings: currentTenant.bookingSettings || {},
          aboutContent: currentTenant.aboutContent || {},
          promoBanner: currentTenant.promoBanner || {},
          seo: currentTenant.seo || {},
        }),
      );
    }
  }, [currentTenant]);

  const handleFileUpload = async (field, type) => {
    const input = fileInputRefs[field]?.current;
    if (!input?.files?.[0]) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB");
      return;
    }
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/store/${currentTenant.slug}/upload/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const result = await res.json();
      if (result.status === "success") {
        const url = result.data.url;
        if (field === "aboutImage") {
          setFormData((p) => ({ ...p, aboutContent: { ...p.aboutContent, images: [...(p.aboutContent.images || []), url] } }));
        } else {
          setFormData((p) => ({ ...p, branding: { ...p.branding, [field]: url } }));
        }
        toast.success("Image uploaded!");
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
      if (input) input.value = "";
    }
  };

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const parts = path.split(".");
      const newData = JSON.parse(JSON.stringify(prev));
      let cur = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/store/${currentTenant?.slug}/settings`, data, { headers: { "x-store-slug": currentTenant?.slug } }),
    onSuccess: () => {
      toast.success("Settings saved!");
      refreshTenant?.();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Save failed"),
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    updateMutation.mutate(formData);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "commerce", label: "Commerce", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "hours", label: "Business Hours", icon: Clock },
    { id: "about", label: "About Page", icon: Info },
    { id: "promo", label: "Promo Banner", icon: Megaphone },
    { id: "seo", label: "SEO", icon: Globe },
  ];

  const ImageUploadField = ({ label, field, type, previewClass = "w-24 h-24" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {formData.branding?.[field] ? (
          <div className="relative">
            <img src={formData.branding[field]} alt={label} className={`${previewClass} object-cover border rounded-lg`} />
            <button type="button" onClick={() => handleChange(`branding.${field}`, "")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className={`${previewClass} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input type="file" ref={fileInputRefs[field]} accept="image/*" className="hidden" onChange={() => handleFileUpload(field, type)} />
          <button type="button" onClick={() => fileInputRefs[field]?.current?.click()} disabled={uploading[field]} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {uploading[field] ? <span className="animate-spin">⏳</span> : <Upload className="w-4 h-4" />}
            <span>{uploading[field] ? "Uploading..." : "Upload"}</span>
          </button>
          <p className="text-xs text-gray-500">or paste URL:</p>
          <input type="url" value={formData.branding?.[field] || ""} onChange={(e) => handleChange(`branding.${field}`, e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="https://..." />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store configuration</p>
        </div>
        <button onClick={handleSubmit} disabled={updateMutation.isPending} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
          <Save className="w-5 h-5" />
          <span>{updateMutation.isPending ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-sm ${activeTab === tab.id ? "bg-primary-50 text-primary-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {activeTab === "general" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option value="general">General</option>
                      <option value="fashion">Fashion</option>
                      <option value="electronics">Electronics</option>
                      <option value="cosmetics">Cosmetics</option>
                      <option value="grocery">Grocery</option>
                      <option value="wellness">Wellness</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select value={formData.businessType} onChange={(e) => handleChange("businessType", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option value="products">Products (eCommerce)</option>
                      <option value="services">Services (Appointments)</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select value={formData.settings.currency} onChange={(e) => handleChange("settings.currency", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select value={formData.settings.timezone} onChange={(e) => handleChange("settings.timezone", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input type="email" value={formData.contact.email} onChange={(e) => handleChange("contact.email", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <input type="text" value={formData.contact.phone} onChange={(e) => handleChange("contact.phone", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Street
                  </label>
                  <input type="text" value={formData.contact.address?.street} onChange={(e) => handleChange("contact.address.street", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={formData.contact.address?.city} onChange={(e) => handleChange("contact.address.city", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" value={formData.contact.address?.state} onChange={(e) => handleChange("contact.address.state", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" value={formData.contact.address?.country} onChange={(e) => handleChange("contact.address.country", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input type="text" value={formData.contact.address?.zipCode} onChange={(e) => handleChange("contact.address.zipCode", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Social Media
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"].map((p) => (
                      <div key={p}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{p}</label>
                        <input type="url" value={formData.socialLinks[p] || ""} onChange={(e) => handleChange(`socialLinks.${p}`, e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder={`https://${p}.com/...`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
                <div className="grid grid-cols-2 gap-8">
                  <ImageUploadField label="Logo" field="logo" type="logos" />
                  <ImageUploadField label="Favicon" field="favicon" type="logos" previewClass="w-12 h-12" />
                </div>
                <ImageUploadField label="Hero Banner (1920×600)" field="heroBanner" type="heroes" previewClass="w-full h-32" />
                <ImageUploadField label="Alt Hero Banner (seasonal)" field="heroBannerAlt" type="heroes" previewClass="w-full h-32" />
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Theme Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["primaryColor", "Primary"],
                      ["secondaryColor", "Secondary"],
                      ["accentColor", "Accent"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={formData.branding[key] || "#000000"} onChange={(e) => handleChange(`branding.${key}`, e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                          <input type="text" value={formData.branding[key] || ""} onChange={(e) => handleChange(`branding.${key}`, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "commerce" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Commerce Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input type="number" value={formData.settings.taxRate} onChange={(e) => handleChange("settings.taxRate", parseFloat(e.target.value) || 0)} step="0.01" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                    <input type="text" value={formData.settings.currencySymbol} onChange={(e) => handleChange("settings.currencySymbol", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["settings.guestCheckout", "Guest Checkout"],
                    ["settings.reviewsEnabled", "Product Reviews"],
                    ["settings.wishlistEnabled", "Wishlist"],
                    ["settings.shippingEnabled", "Shipping"],
                  ].map(([path, label]) => {
                    const parts = path.split(".");
                    const val = parts.reduce((o, k) => o?.[k], formData);
                    return (
                      <label key={path} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={val || false} onChange={(e) => handleChange(path, e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ({formData.settings.currencySymbol})</label>
                  <input type="number" value={formData.shipping.freeShippingThreshold} onChange={(e) => handleChange("shipping.freeShippingThreshold", parseFloat(e.target.value) || 0)} step="0.01" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 to disable free shipping</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Shipping Methods</h3>
                    <button type="button" onClick={() => handleChange("shipping.methods", [...(formData.shipping.methods || []), { name: "", description: "", price: 0, estimatedDays: "", enabled: true }])} className="text-sm text-primary-600 hover:text-primary-700">
                      + Add Method
                    </button>
                  </div>
                  {formData.shipping.methods?.map((m, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center">
                      <input
                        type="text"
                        value={m.name}
                        placeholder="Name"
                        onChange={(e) => {
                          const ms = [...formData.shipping.methods];
                          ms[i] = { ...ms[i], name: e.target.value };
                          handleChange("shipping.methods", ms);
                        }}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        value={m.price}
                        placeholder="Price"
                        step="0.01"
                        onChange={(e) => {
                          const ms = [...formData.shipping.methods];
                          ms[i] = { ...ms[i], price: parseFloat(e.target.value) || 0 };
                          handleChange("shipping.methods", ms);
                        }}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={m.estimatedDays}
                        placeholder="Est. days"
                        onChange={(e) => {
                          const ms = [...formData.shipping.methods];
                          ms[i] = { ...ms[i], estimatedDays: e.target.value };
                          handleChange("shipping.methods", ms);
                        }}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={m.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const ms = [...formData.shipping.methods];
                          ms[i] = { ...ms[i], description: e.target.value };
                          handleChange("shipping.methods", ms);
                        }}
                        className="px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "shipping.methods",
                            formData.shipping.methods.filter((_, j) => j !== i),
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "hours" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Business Hours</h2>
                <p className="text-sm text-gray-500">Shown on storefront and used for booking availability.</p>
                <div className="space-y-3">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                    const h = formData.bookingSettings?.workingHours?.[day] || { start: "09:00", end: "18:00", enabled: false };
                    return (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                        <label className="flex items-center gap-2 w-32">
                          <input type="checkbox" checked={h.enabled} onChange={(e) => handleChange(`bookingSettings.workingHours.${day}.enabled`, e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                          <span className="text-sm font-medium capitalize">{day}</span>
                        </label>
                        {h.enabled ? (
                          <>
                            <input type="time" value={h.start} onChange={(e) => handleChange(`bookingSettings.workingHours.${day}.start`, e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" />
                            <span className="text-gray-400">to</span>
                            <input type="time" value={h.end} onChange={(e) => handleChange(`bookingSettings.workingHours.${day}.end`, e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" />
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
                    <input type="number" value={formData.bookingSettings.slotDuration} onChange={(e) => handleChange("bookingSettings.slotDuration", parseInt(e.target.value) || 60)} min="15" step="15" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (min)</label>
                    <input type="number" value={formData.bookingSettings.bufferTime} onChange={(e) => handleChange("bookingSettings.bufferTime", parseInt(e.target.value) || 0)} min="0" step="5" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">About Page Content</h2>
                <p className="text-sm text-gray-500">Customize your storefront About page — replaces placeholder content.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                  <input type="text" value={formData.aboutContent.headline} onChange={(e) => handleChange("aboutContent.headline", e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Our Story" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.aboutContent.description} onChange={(e) => handleChange("aboutContent.description", e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Our Story</label>
                  <textarea value={formData.aboutContent.story} onChange={(e) => handleChange("aboutContent.story", e.target.value)} rows={5} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                  <textarea value={formData.aboutContent.mission} onChange={(e) => handleChange("aboutContent.mission", e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                {/* About Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                  <div className="flex gap-3 flex-wrap mb-2">
                    {formData.aboutContent.images?.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() =>
                            handleChange(
                              "aboutContent.images",
                              formData.aboutContent.images.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input type="file" ref={fileInputRefs.aboutImage} accept="image/*" className="hidden" onChange={() => handleFileUpload("aboutImage", "about")} />
                  <button type="button" onClick={() => fileInputRefs.aboutImage?.current?.click()} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                    <Upload className="w-4 h-4" /> Add Image
                  </button>
                </div>
                {/* Stats */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Stats</h3>
                    <button type="button" onClick={() => handleChange("aboutContent.stats", [...(formData.aboutContent.stats || []), { label: "", value: "" }])} className="text-sm text-primary-600">
                      + Add
                    </button>
                  </div>
                  {formData.aboutContent.stats?.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={s.value}
                        placeholder="Value (15+)"
                        onChange={(e) => {
                          const st = [...formData.aboutContent.stats];
                          st[i] = { ...st[i], value: e.target.value };
                          handleChange("aboutContent.stats", st);
                        }}
                        className="w-32 px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={s.label}
                        placeholder="Label (Years)"
                        onChange={(e) => {
                          const st = [...formData.aboutContent.stats];
                          st[i] = { ...st[i], label: e.target.value };
                          handleChange("aboutContent.stats", st);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "aboutContent.stats",
                            formData.aboutContent.stats.filter((_, j) => j !== i),
                          )
                        }
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Values */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Core Values</h3>
                    <button type="button" onClick={() => handleChange("aboutContent.values", [...(formData.aboutContent.values || []), { icon: "⭐", title: "", description: "" }])} className="text-sm text-primary-600">
                      + Add
                    </button>
                  </div>
                  {formData.aboutContent.values?.map((v, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={v.icon}
                        onChange={(e) => {
                          const vs = [...formData.aboutContent.values];
                          vs[i] = { ...vs[i], icon: e.target.value };
                          handleChange("aboutContent.values", vs);
                        }}
                        className="w-16 px-3 py-2 border rounded-lg text-sm text-center"
                      />
                      <input
                        type="text"
                        value={v.title}
                        placeholder="Title"
                        onChange={(e) => {
                          const vs = [...formData.aboutContent.values];
                          vs[i] = { ...vs[i], title: e.target.value };
                          handleChange("aboutContent.values", vs);
                        }}
                        className="w-40 px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={v.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const vs = [...formData.aboutContent.values];
                          vs[i] = { ...vs[i], description: e.target.value };
                          handleChange("aboutContent.values", vs);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "aboutContent.values",
                            formData.aboutContent.values.filter((_, j) => j !== i),
                          )
                        }
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "promo" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Promotional Banner</h2>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.promoBanner.enabled} onChange={(e) => handleChange("promoBanner.enabled", e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm font-medium">Enable Promo Banner</span>
                </label>
                {formData.promoBanner.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                      <input type="text" value={formData.promoBanner.text} onChange={(e) => handleChange("promoBanner.text", e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="🎉 Free shipping on orders over $50!" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                      <input type="text" value={formData.promoBanner.link} onChange={(e) => handleChange("promoBanner.link", e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                        <div className="flex gap-2">
                          <input type="color" value={formData.promoBanner.backgroundColor} onChange={(e) => handleChange("promoBanner.backgroundColor", e.target.value)} className="w-10 h-10 rounded" />
                          <input type="text" value={formData.promoBanner.backgroundColor} onChange={(e) => handleChange("promoBanner.backgroundColor", e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={formData.promoBanner.textColor} onChange={(e) => handleChange("promoBanner.textColor", e.target.value)} className="w-10 h-10 rounded" />
                          <input type="text" value={formData.promoBanner.textColor} onChange={(e) => handleChange("promoBanner.textColor", e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <div className="py-2 px-4 text-center text-sm rounded-lg" style={{ backgroundColor: formData.promoBanner.backgroundColor, color: formData.promoBanner.textColor }}>
                        {formData.promoBanner.text || "Your promo text here..."}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "seo" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input type="text" value={formData.seo.metaTitle} onChange={(e) => handleChange("seo.metaTitle", e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea value={formData.seo.metaDescription} onChange={(e) => handleChange("seo.metaDescription", e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
