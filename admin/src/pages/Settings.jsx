import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Save, Store, Globe, Mail, Phone, MapPin, Palette, CreditCard, Truck, Bell, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { currentTenant, storeAPI, refreshTenant } = useTenant();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    logo: "",
    favicon: "",
    contactEmail: "",
    contactPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      orderPrefix: "ORD",
      lowStockThreshold: 10,
      taxRate: 0,
      shippingFlatRate: 0,
      freeShippingThreshold: 0,
    },
    theme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#10B981",
    },
  });

  // Populate form with current tenant data
  useEffect(() => {
    if (currentTenant) {
      setFormData({
        name: currentTenant.name || "",
        description: currentTenant.description || "",
        industry: currentTenant.industry || "",
        logo: currentTenant.logo || "",
        favicon: currentTenant.favicon || "",
        contactEmail: currentTenant.contactEmail || "",
        contactPhone: currentTenant.contactPhone || "",
        address: {
          street: currentTenant.address?.street || "",
          city: currentTenant.address?.city || "",
          state: currentTenant.address?.state || "",
          country: currentTenant.address?.country || "",
          zipCode: currentTenant.address?.zipCode || "",
        },
        socialMedia: {
          facebook: currentTenant.socialMedia?.facebook || "",
          instagram: currentTenant.socialMedia?.instagram || "",
          twitter: currentTenant.socialMedia?.twitter || "",
          linkedin: currentTenant.socialMedia?.linkedin || "",
        },
        settings: {
          currency: currentTenant.settings?.currency || "USD",
          timezone: currentTenant.settings?.timezone || "America/New_York",
          orderPrefix: currentTenant.settings?.orderPrefix || "ORD",
          lowStockThreshold: currentTenant.settings?.lowStockThreshold || 10,
          taxRate: currentTenant.settings?.taxRate || 0,
          shippingFlatRate: currentTenant.settings?.shippingFlatRate || 0,
          freeShippingThreshold: currentTenant.settings?.freeShippingThreshold || 0,
        },
        theme: {
          primaryColor: currentTenant.theme?.primaryColor || "#4F46E5",
          secondaryColor: currentTenant.theme?.secondaryColor || "#10B981",
        },
      });
    }
  }, [currentTenant]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => storeAPI?.tenant.update(data),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      refreshTenant();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) || 0 : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: val,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "commerce", label: "Commerce", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store settings</p>
        </div>
        <button onClick={handleSubmit} disabled={updateMutation.isPending} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
          <Save className="w-5 h-5" />
          <span>{updateMutation.isPending ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"}`}>
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option value="">Select industry</option>
                      <option value="fashion">Fashion</option>
                      <option value="electronics">Electronics</option>
                      <option value="beauty">Beauty & Cosmetics</option>
                      <option value="food">Food & Beverages</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports & Outdoors</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select name="settings.currency" value={formData.settings.currency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select name="settings.timezone" value={formData.settings.timezone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number Prefix</label>
                    <input type="text" name="settings.orderPrefix" value={formData.settings.orderPrefix} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="ORD" />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4 inline mr-1" /> Email
                      </label>
                      <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4 inline mr-1" /> Phone
                      </label>
                      <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" /> Street Address
                    </label>
                    <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      <Globe className="w-4 h-4 inline mr-1" /> Social Media
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                        <input type="url" name="socialMedia.facebook" value={formData.socialMedia.facebook} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="https://facebook.com/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <input type="url" name="socialMedia.instagram" value={formData.socialMedia.instagram} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="https://instagram.com/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                        <input type="url" name="socialMedia.twitter" value={formData.socialMedia.twitter} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="https://twitter.com/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input type="url" name="socialMedia.linkedin" value={formData.socialMedia.linkedin} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="https://linkedin.com/..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Branding</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                      <div className="flex items-center space-x-4">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo" className="w-24 h-24 object-contain border rounded-lg" />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <input type="url" name="logo" value={formData.logo} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" placeholder="Logo URL" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                      <div className="flex items-center space-x-4">
                        {formData.favicon ? (
                          <img src={formData.favicon} alt="Favicon" className="w-12 h-12 object-contain border rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <input type="url" name="favicon" value={formData.favicon} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" placeholder="Favicon URL" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Theme Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                        <div className="flex items-center space-x-3">
                          <input type="color" name="theme.primaryColor" value={formData.theme.primaryColor} onChange={handleChange} className="w-12 h-10 rounded cursor-pointer" />
                          <input type="text" value={formData.theme.primaryColor} onChange={(e) => handleChange({ target: { name: "theme.primaryColor", value: e.target.value } })} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                        <div className="flex items-center space-x-3">
                          <input type="color" name="theme.secondaryColor" value={formData.theme.secondaryColor} onChange={handleChange} className="w-12 h-10 rounded cursor-pointer" />
                          <input type="text" value={formData.theme.secondaryColor} onChange={(e) => handleChange({ target: { name: "theme.secondaryColor", value: e.target.value } })} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commerce Tab */}
            {activeTab === "commerce" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Commerce Settings</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                      <input type="number" name="settings.taxRate" value={formData.settings.taxRate} onChange={handleChange} step="0.01" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
                      <input type="number" name="settings.lowStockThreshold" value={formData.settings.lowStockThreshold} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Settings</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Flat Rate Shipping ({formData.settings.currency})</label>
                      <input type="number" name="settings.shippingFlatRate" value={formData.settings.shippingFlatRate} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ({formData.settings.currency})</label>
                      <input type="number" name="settings.freeShippingThreshold" value={formData.settings.freeShippingThreshold} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                      <p className="text-xs text-gray-500 mt-1">Set to 0 to disable free shipping</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
