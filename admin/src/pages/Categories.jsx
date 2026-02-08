import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Plus, Search, Edit, Trash2, FolderTree, ChevronRight, ChevronDown, X, Save, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function Categories() {
  const { storeAPI, currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
    image: "",
    status: "active",
  });

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories", currentTenant?.slug],
    queryFn: () => storeAPI?.categories.getAll(),
    enabled: !!storeAPI,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => storeAPI?.categories.create(data),
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries(["categories", currentTenant?.slug]);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => storeAPI?.categories.update(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries(["categories", currentTenant?.slug]);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => storeAPI?.categories.delete(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries(["categories", currentTenant?.slug]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  const categories = categoriesData?.data?.data?.categories || [];
  const rootCategories = categories.filter((c) => !c.parent);

  const getChildren = (parentId) => categories.filter((c) => c.parent === parentId || c.parent?._id === parentId);

  const toggleExpanded = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parent: category.parent?._id || category.parent || "",
        image: category.image || "",
        status: category.status || "active",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        parent: "",
        image: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name" && !editingCategory) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    const payload = { ...formData };
    if (!payload.parent) delete payload.parent;

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (category) => {
    const children = getChildren(category._id);
    if (children.length > 0) {
      toast.error("Cannot delete category with subcategories");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category._id);
    }
  };

  const filteredCategories = search ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : rootCategories;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const CategoryItem = ({ category, level = 0 }) => {
    const children = getChildren(category._id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories[category._id];

    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="py-3 px-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button onClick={() => toggleExpanded(category._id)} className="p-1 mr-2 text-gray-400 hover:text-gray-600">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <span className="w-6 mr-2" />
              )}
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <FolderTree className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500">{category.slug}</p>
              </div>
            </div>
          </td>
          <td className="py-3 px-4">
            <span className="text-sm text-gray-600">{category.productCount || 0}</span>
          </td>
          <td className="py-3 px-4">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${category.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{category.status}</span>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center justify-end space-x-2">
              <button onClick={() => openModal(category)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(category)} disabled={deleteMutation.isPending} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && children.map((child) => <CategoryItem key={child._id} category={child} level={level + 1} />)}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your products into categories</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderTree className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-1">Create categories to organize your products</p>
            <button onClick={() => openModal()} className="mt-4 flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <CategoryItem key={category._id} category={category} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Enter category name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="category-slug" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Category description..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select name="parent" value={formData.parent} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter((c) => c._id !== editingCategory?._id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="flex items-center space-x-3">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <input type="text" name="image" value={formData.image} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" placeholder="https://example.com/image.jpg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Saving..." : "Save"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
