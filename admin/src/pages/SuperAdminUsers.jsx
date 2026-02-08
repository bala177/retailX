import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { superAdminAPI } from "../services/api";
import toast from "react-hot-toast";
import { Users, Search, Plus, RefreshCw, Shield, Store, User, UserCheck, Mail, CheckCircle, XCircle, AlertTriangle, Power, X } from "lucide-react";

export default function SuperAdminUsers() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    tenantId: "",
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied");
      navigate("/");
      return;
    }
    fetchUsers();
    fetchStores();
  }, [isSuperAdmin, filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.users.getAll({
        ...filters,
        page: pagination.page,
        limit: 15,
      });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await superAdminAPI.stores.getAll({ limit: 100, status: "active" });
      setStores(response.data.data.stores || []);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  // Filter stores that don't have an owner yet
  const storesWithoutOwner = stores.filter((store) => !store.owner);

  const handleCreateStoreOwner = async (e) => {
    e.preventDefault();
    if (!newUser.tenantId) {
      toast.error("Please select a store");
      return;
    }
    try {
      setCreating(true);
      await superAdminAPI.users.createStoreOwner(newUser);
      const selectedStore = stores.find((s) => s._id === newUser.tenantId);
      toast.success(`Store owner created for ${selectedStore?.name || "store"}`);
      setShowCreateModal(false);
      setNewUser({ email: "", password: "", firstName: "", lastName: "", phone: "", tenantId: "" });
      fetchUsers();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create store owner");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await superAdminAPI.users.updateStatus(userId, newStatus);
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: { bg: "bg-red-100", text: "text-red-700", icon: Shield, label: "Super Admin (You)" },
      store_owner: { bg: "bg-indigo-100", text: "text-indigo-700", icon: Store, label: "Store Owner" },
      store_staff: { bg: "bg-blue-100", text: "text-blue-700", icon: UserCheck, label: "Store Staff" },
      customer: { bg: "bg-gray-100", text: "text-gray-700", icon: User, label: "Customer" },
    };
    const badge = badges[role] || badges.customer;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle },
      suspended: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage store owners and users across all your sold products</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2" disabled={storesWithoutOwner.length === 0}>
          <Plus className="h-5 w-5" />
          Create Store Owner
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">Role Hierarchy</h3>
            <p className="text-sm text-indigo-700 mt-1">
              <strong>You (Super Admin)</strong> → Control everything
              <br />
              <strong>Store Owner</strong> → Customer who bought RetailX (e.g., Tranquil Spa owner)
              <br />
              <strong>Store Staff</strong> → Employees of your customers
              <br />
              <strong>Customer</strong> → End users who book/buy from stores
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search users..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="store_owner">Store Owner</option>
            <option value="store_staff">Store Staff</option>
            <option value="customer">Customer</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Store (Sold Product)</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{user.tenant ? <span className="text-sm text-gray-700 font-medium">{user.tenant.name}</span> : <span className="text-sm text-gray-400 italic">Platform Level</span>}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                    <td className="px-6 py-4">
                      {user.role !== "super_admin" && (
                        <div className="flex items-center justify-end gap-2">
                          {user.status === "active" ? (
                            <button onClick={() => handleStatusChange(user._id, "suspended")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Suspend User">
                              <Power className="h-4 w-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(user._id, "active")} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Activate User">
                              <Power className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
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
              Showing {(pagination.page - 1) * 15 + 1} to {Math.min(pagination.page * 15, pagination.total)} of {pagination.total} users
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

      {/* Create Store Owner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Store Owner</h2>
                <p className="text-sm text-gray-500">Assign an owner to a store you've sold</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateStoreOwner} className="p-6 space-y-4">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Store *</label>
                {storesWithoutOwner.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">All stores already have owners assigned.</p>
                ) : (
                  <select value={newUser.tenantId} onChange={(e) => setNewUser({ ...newUser, tenantId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- Select a store --</option>
                    {storesWithoutOwner.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name} ({store.industry})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <p className="text-xs text-gray-500 mt-1">Min 8 characters. Share this with your customer.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creating || storesWithoutOwner.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {creating && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Create Store Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
