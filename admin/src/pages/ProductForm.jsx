import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { ArrowLeft, Save, Upload, X, Plus, Minus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { storeAPI, currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    category: "",
    brand: "",
    sku: "",
    originalPrice: "",
    currentPrice: "",
    costPrice: "",
    quantity: "",
    lowStockThreshold: 10,
    trackInventory: true,
    images: [],
    tags: [],
    status: "active",
    featured: false,
    specifications: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch product if editing
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => storeAPI?.products.getById(id),
    enabled: !!storeAPI && isEditMode,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", currentTenant?.slug],
    queryFn: () => storeAPI?.categories.getAll(),
    enabled: !!storeAPI,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => storeAPI?.products.create(data),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries(["products", currentTenant?.slug]);
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => storeAPI?.products.update(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries(["products", currentTenant?.slug]);
      queryClient.invalidateQueries(["product", id]);
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (productData?.data?.data?.product) {
      const p = productData.data.data.product;
      setFormData({
        name: p.name || "",
        slug: p.slug || "",
        description: p.description || "",
        shortDescription: p.shortDescription || "",
        category: p.category?._id || p.category || "",
        brand: p.brand || "",
        sku: p.sku || "",
        originalPrice: p.originalPrice || "",
        currentPrice: p.currentPrice || "",
        costPrice: p.costPrice || "",
        quantity: p.inventory?.quantity || "",
        lowStockThreshold: p.inventory?.lowStockThreshold || 10,
        trackInventory: p.inventory?.trackInventory ?? true,
        images: p.images || [],
        tags: p.tags || [],
        status: p.status || "active",
        featured: p.featured || false,
        specifications: p.specifications || [],
        seo: {
          metaTitle: p.seo?.metaTitle || "",
          metaDescription: p.seo?.metaDescription || "",
          metaKeywords: p.seo?.metaKeywords || "",
        },
      });
    }
  }, [productData]);

  const categories = categoriesData?.data?.data?.categories || [];

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("seo.")) {
      const seoField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        seo: { ...prev.seo, [seoField]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Auto-generate slug
      if (name === "name" && !isEditMode) {
        setFormData((prev) => ({
          ...prev,
          slug: generateSlug(value),
        }));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    }));
  };

  const handleRemoveSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { url, alt: formData.name, isPrimary: prev.images.length === 0 }],
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.currentPrice) newErrors.currentPrice = "Price is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.currentPrice),
      currentPrice: parseFloat(formData.currentPrice),
      costPrice: parseFloat(formData.costPrice) || 0,
      inventory: {
        quantity: parseInt(formData.quantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        trackInventory: formData.trackInventory,
      },
    };

    // Remove inventory fields from root
    delete payload.quantity;
    delete payload.lowStockThreshold;
    delete payload.trackInventory;

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && productLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/products")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-gray-500 mt-1">{isEditMode ? "Update product details" : "Create a new product for your store"}</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
          <Save className="w-5 h-5" />
          <span>{isSubmitting ? "Saving..." : "Save Product"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-200"}`} placeholder="Enter product name" />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="product-url-slug" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Brief product description" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Detailed product description..." />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img.url} alt={img.alt} className={`w-full h-24 object-cover rounded-lg border-2 ${img.isPrimary ? "border-primary-500" : "border-gray-200"}`} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    {!img.isPrimary && (
                      <button type="button" onClick={() => handleSetPrimaryImage(index)} className="p-1 bg-white rounded text-xs">
                        Set Primary
                      </button>
                    )}
                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-1 bg-red-500 text-white rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {img.isPrimary && <span className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-2 py-0.5 rounded">Primary</span>}
                </div>
              ))}
              <button type="button" onClick={handleAddImage} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-xs mt-1">Add Image</span>
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
              <button type="button" onClick={handleAddSpecification} className="flex items-center space-x-1 text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Spec</span>
              </button>
            </div>
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input type="text" value={spec.key} onChange={(e) => handleSpecificationChange(index, "key", e.target.value)} placeholder="Key (e.g., Weight)" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                  <input type="text" value={spec.value} onChange={(e) => handleSpecificationChange(index, "value", e.target.value)} placeholder="Value (e.g., 500g)" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                  <button type="button" onClick={() => handleRemoveSpecification(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.specifications.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No specifications added yet</p>}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input type="text" name="seo.metaTitle" value={formData.seo.metaTitle} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="SEO title for search engines" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea name="seo.metaDescription" value={formData.seo.metaDescription} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="SEO description for search engines" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                <input type="text" name="seo.metaKeywords" value={formData.seo.metaKeywords} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="keyword1, keyword2, keyword3" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.sku ? "border-red-500" : "border-gray-200"}`} placeholder="SKU-001" />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} step="0.01" className={`w-full px-4 py-2 border rounded-lg ${errors.currentPrice ? "border-red-500" : "border-gray-200"}`} placeholder="0.00" />
                {errors.currentPrice && <p className="text-red-500 text-sm mt-1">{errors.currentPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="10" />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="trackInventory" checked={formData.trackInventory} onChange={handleChange} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Track inventory</span>
              </label>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg ${errors.category ? "border-red-500" : "border-gray-200"}`}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Brand name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Featured product</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex space-x-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" placeholder="Add tag" />
              <button type="button" onClick={handleAddTag} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
