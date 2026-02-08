import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { superAdminAPI } from "../services/api";
import toast from "react-hot-toast";
import { Store, Users, ShoppingCart, DollarSign, TrendingUp, Settings, Shield, Activity, AlertCircle, CheckCircle, Clock, Building2, CreditCard, Calendar, Package, RefreshCw, ChevronRight, Zap } from "lucide-react";

export default function SuperAdminDashboard() {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Access denied. Super Admin privileges required.");
      navigate("/");
      return;
    }
    fetchDashboard();
  }, [isSuperAdmin, navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, recentStores, storesByIndustry, storesByPlan, usersByRole } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Super Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to RetailX Control Center</h1>
            <p className="text-indigo-100 mt-1">Manage all stores, users, and platform settings from here</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/super-admin/stores")} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors">
              <Store className="h-5 w-5" />
              Manage Stores
            </button>
            <button onClick={() => navigate("/super-admin/users")} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors">
              <Users className="h-5 w-5" />
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Stores" value={overview.totalStores} subtitle={`${overview.activeStores} active`} icon={Store} color="indigo" trend={overview.activeStores > 0 ? "up" : "neutral"} />
        <StatCard title="Total Users" value={overview.totalUsers} subtitle="Across all stores" icon={Users} color="blue" />
        <StatCard title="Total Orders" value={overview.totalOrders} subtitle="Platform-wide" icon={ShoppingCart} color="green" />
        <StatCard title="Total Revenue" value={`$${(overview.totalRevenue || 0).toLocaleString()}`} subtitle="Completed orders" icon={DollarSign} color="emerald" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="Configure Store for Services" description="Set up a store for booking-only mode (spa, salon, etc.)" icon={Calendar} color="purple" onClick={() => navigate("/super-admin/stores")} />
          <QuickActionCard title="Configure Store for Products" description="Set up a store for e-commerce with cart and checkout" icon={Package} color="blue" onClick={() => navigate("/super-admin/stores")} />
          <QuickActionCard title="Toggle Payment System" description="Enable or disable payment processing per store" icon={CreditCard} color="green" onClick={() => navigate("/super-admin/stores")} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              Recent Stores
            </h2>
            <button onClick={() => navigate("/super-admin/stores")} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentStores.map((store) => (
              <div key={store._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => navigate(`/super-admin/stores/${store._id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{store.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${store.status === "active" ? "bg-green-100 text-green-700" : store.status === "suspended" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{store.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores by Industry */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Stores by Industry
          </h2>
          <div className="space-y-3">
            {storesByIndustry.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 capitalize">{item._id || "General"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(item.count / overview.totalStores) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stores by Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Stores by Plan
          </h2>
          <div className="space-y-3">
            {storesByPlan.map((item) => {
              const planColors = {
                free: "gray",
                starter: "blue",
                professional: "indigo",
                enterprise: "purple",
              };
              const color = planColors[item._id] || "gray";
              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm rounded-full capitalize bg-${color}-100 text-${color}-700`}>{item._id || "Free"}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Users by Role
          </h2>
          <div className="space-y-3">
            {usersByRole.map((item) => {
              const roleLabels = {
                super_admin: "Super Admin (You)",
                store_owner: "Store Owner",
                store_staff: "Store Staff",
                customer: "Customer",
              };
              const roleColors = {
                super_admin: "red",
                store_owner: "indigo",
                store_staff: "blue",
                customer: "gray",
              };
              const color = roleColors[item._id] || "gray";
              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                    <span className="text-gray-700">{roleLabels[item._id] || item._id}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend === "up" && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, color, onClick }) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
  };

  return (
    <button onClick={onClick} className="group p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 hover:border-gray-300">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3 transition-colors`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  );
}
