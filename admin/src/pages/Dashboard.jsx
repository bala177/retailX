import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { currentTenant, storeAPI } = useTenant();

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ["products", currentTenant?.slug],
    queryFn: () => storeAPI?.products.getAll({ limit: 5 }),
    enabled: !!storeAPI,
  });

  // Fetch orders
  const { data: ordersData } = useQuery({
    queryKey: ["orders", currentTenant?.slug],
    queryFn: () => storeAPI?.orders.getAll({ limit: 5 }),
    enabled: !!storeAPI,
  });

  const stats = [
    {
      name: "Total Products",
      value: currentTenant?.stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      name: "Total Orders",
      value: currentTenant?.stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-green-500",
      change: "+8%",
      trend: "up",
    },
    {
      name: "Total Customers",
      value: currentTenant?.stats?.totalCustomers || 0,
      icon: Users,
      color: "bg-purple-500",
      change: "+15%",
      trend: "up",
    },
    {
      name: "Total Revenue",
      value: `$${(currentTenant?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+23%",
      trend: "up",
    },
  ];

  const products = productsData?.data?.data?.products || [];
  const orders = ordersData?.data?.data?.orders || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to {currentTenant?.name || "your store"} dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stat.trend === "up" ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No products yet.{" "}
                <Link to="/products/new" className="text-primary-600">
                  Add one
                </Link>
              </div>
            ) : (
              products.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center p-4 hover:bg-gray-50">
                  <img src={product.primaryImage || "https://via.placeholder.com/60"} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${product.currentPrice?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{product.inventory?.quantity} in stock</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No orders yet. Orders will appear here once customers start purchasing.</div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${order.totals?.total?.toFixed(2)}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" : order.status === "processing" ? "bg-blue-100 text-blue-800" : order.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Store Info */}
      {currentTenant && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Store Information</h3>
              <p className="text-primary-100 mt-1">{currentTenant.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">{currentTenant.industry}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">{currentTenant.status}</span>
              </div>
            </div>
            <Link to="/settings" className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
              <span>View Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
