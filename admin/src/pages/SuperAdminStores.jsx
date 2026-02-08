import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { superAdminAPI } from "../services/api";
import toast from "react-hot-toast";
import { Store, Search, Filter, ChevronRight, Settings, Users, Package, ShoppingCart, Calendar, CreditCard, MoreVertical, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Plus, Zap, Eye, Edit, Power, Trash2, X } from "lucide-react";

export default function SuperAdminStores() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    status: "",
    industry: "",
    businessType: "",
    plan: "",
    search: "",
  });
  const [selectedStore, setSelectedStore] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied");
      navigate("/");
      return;
    }
    fetchStores();
  }, [isSuperAdmin, filters, pagination.page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.stores.getAll({
        ...filters,
        page: pagination.page,
        limit: 10,
      });
      setStores(response.data.data.stores);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSetup = async (storeId, type) => {
    try {
      setConfiguring(true);
      setOpenDropdownId(null);
      if (type === "service") {
        await superAdminAPI.stores.setupService(storeId);
        toast.success("Store configured for service business (booking only)");
      } else {
        await superAdminAPI.stores.setupProducts(storeId, true);
        toast.success("Store configured for product business");
      }
      fetchStores();
    } catch (error) {
      toast.error("Failed to configure store");
    } finally {
      setConfiguring(false);
    }
  };

  const handleStatusChange = async (storeId, newStatus) => {
    try {
      setOpenDropdownId(null);
      await superAdminAPI.stores.updateStatus(storeId, newStatus);
      toast.success(`Store ${newStatus === "active" ? "activated" : "suspended"}`);
      fetchStores();
    } catch (error) {
      toast.error("Failed to update store status");
    }
  };

  const openDeleteModal = (store) => {
    setOpenDropdownId(null);
    setStoreToDelete(store);
    setDeleteConfirmSlug("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStoreToDelete(null);
    setDeleteConfirmSlug("");
  };

  const handleDeleteStore = async () => {
    if (!storeToDelete || deleteConfirmSlug !== storeToDelete.slug) {
      toast.error("Please type the store slug correctly to confirm deletion");
      return;
    }

    try {
      setDeleting(true);
      const response = await superAdminAPI.stores.delete(storeToDelete._id, deleteConfirmSlug);
      const deletedData = response.data.data.deleted;
      toast.success(`Store "${storeToDelete.name}" deleted! Removed: ${deletedData.products} products, ${deletedData.orders} orders, ${deletedData.users} users`, { duration: 5000 });
      closeDeleteModal();
      fetchStores();
    } catch (error) {
      console.error("Failed to delete store:", error);
      toast.error(error.response?.data?.message || "Failed to delete store");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle },
      suspended: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getBusinessTypeBadge = (type, features) => {
    const isBookingEnabled = features?.bookingEnabled;
    const isPaymentEnabled = features?.paymentEnabled;

    if (type === "services" || isBookingEnabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
          <Calendar className="h-3 w-3" />
          Booking
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
        <ShoppingCart className="h-3 w-3" />
        {isPaymentEnabled ? "E-commerce" : "Catalog"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage all RetailX stores</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search stores..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="">All Industries</option>
            <option value="fashion">Fashion</option>
            <option value="grocery">Grocery</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="electronics">Electronics</option>
            <option value="wellness">Wellness</option>
            <option value="healthcare">Healthcare</option>
            <option value="general">General</option>
          </select>
          <select value={filters.plan} onChange={(e) => setFilters({ ...filters, plan: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Stores List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stores found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Store</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Features</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-500">{store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700 capitalize">{store.industry}</span>
                        {getBusinessTypeBadge(store.businessType, store.features)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {store.features?.paymentEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">
                            <CreditCard className="h-3 w-3" />
                            Payment
                          </span>
                        )}
                        {store.features?.bookingEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700">
                            <Calendar className="h-3 w-3" />
                            Booking
                          </span>
                        )}
                        {store.features?.cartEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                            <ShoppingCart className="h-3 w-3" />
                            Cart
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(store.status)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{store.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/super-admin/stores/${store._id}`)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View & Configure">
                          <Settings className="h-4 w-4" />
                        </button>
                        <div className="relative dropdown-container">
                          <button onClick={() => setOpenDropdownId(openDropdownId === store._id ? null : store._id)} className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg ${openDropdownId === store._id ? "bg-gray-100 text-gray-700" : ""}`}>
                            <Zap className="h-4 w-4" />
                          </button>
                          {openDropdownId === store._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button onClick={() => handleQuickSetup(store._id, "service")} disabled={configuring} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                Setup as Service
                              </button>
                              <button onClick={() => handleQuickSetup(store._id, "product")} disabled={configuring} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50">
                                <Package className="h-4 w-4 text-blue-500" />
                                Setup as Product
                              </button>
                              <hr className="my-1" />
                              {store.status === "active" ? (
                                <button onClick={() => handleStatusChange(store._id, "suspended")} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                  <Power className="h-4 w-4" />
                                  Suspend Store
                                </button>
                              ) : (
                                <button onClick={() => handleStatusChange(store._id, "active")} className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-green-600 flex items-center gap-2">
                                  <Power className="h-4 w-4" />
                                  Activate Store
                                </button>
                              )}
                              <hr className="my-1" />
                              <button onClick={() => openDeleteModal(store)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Store
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} stores
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                Previous
              </button>
              <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && storeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Store</h3>
              </div>
              <button onClick={closeDeleteModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-sm text-red-700">
                  This will permanently delete <strong>{storeToDelete.name}</strong> and ALL associated data:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                  <li>All products and categories</li>
                  <li>All orders and transactions</li>
                  <li>All users (owner, staff, customers)</li>
                  <li>All cart data</li>
                  <li>Store configuration and settings</li>
                </ul>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">{storeToDelete.slug}</span> to confirm:
              </label>
              <input type="text" value={deleteConfirmSlug} onChange={(e) => setDeleteConfirmSlug(e.target.value)} placeholder={storeToDelete.slug} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" autoFocus />
            </div>

            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button onClick={handleDeleteStore} disabled={deleting || deleteConfirmSlug !== storeToDelete.slug} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {deleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
