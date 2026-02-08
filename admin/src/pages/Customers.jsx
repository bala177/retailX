import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Search, Users, ChevronLeft, ChevronRight, Mail, Phone, MapPin, ShoppingBag, Calendar, Eye, X } from "lucide-react";

export default function Customers() {
  const { storeAPI, currentTenant } = useTenant();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const limit = 10;

  // Fetch customers
  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers", currentTenant?.slug, page, search],
    queryFn: () =>
      storeAPI?.customers.getAll({
        page,
        limit,
        search,
      }),
    enabled: !!storeAPI,
  });

  // Fetch customer orders when viewing detail
  const { data: customerOrdersData } = useQuery({
    queryKey: ["customer-orders", selectedCustomer?._id],
    queryFn: () => storeAPI?.orders.getAll({ customer: selectedCustomer._id }),
    enabled: !!storeAPI && !!selectedCustomer,
  });

  const customers = customersData?.data?.data?.customers || [];
  const pagination = customersData?.data?.data?.pagination || {};
  const customerOrders = customerOrdersData?.data?.data?.orders || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">View and manage your customers</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
            <p className="text-gray-500 mt-1">{search ? "Try adjusting your search" : "Customers will appear here once they register or make a purchase"}</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {customer.firstName?.[0]}
                            {customer.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </p>
                          {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{customer.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{customer.orderCount || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">${(customer.totalSpent || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(customer.createdAt)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => setSelectedCustomer(customer)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.currentPage - 1) * limit + 1} to {Math.min(pagination.currentPage * limit, pagination.totalItems)} of {pagination.totalItems} customers
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    {selectedCustomer.firstName?.[0]}
                    {selectedCustomer.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">Customer since {formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Addresses</h3>
                  <div className="grid gap-3">
                    {selectedCustomer.addresses.map((address, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {address.name}
                            {address.isDefault && <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs">Default</span>}
                          </p>
                          <p className="text-gray-600">
                            {address.street}
                            {address.apartment && `, ${address.apartment}`}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ShoppingBag className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.orderCount || 0}</p>
                    <p className="text-sm text-gray-500">Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <span className="text-2xl">💰</span>
                    <p className="text-2xl font-bold text-gray-900">${(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Total Spent</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">${selectedCustomer.orderCount ? ((selectedCustomer.totalSpent || 0) / selectedCustomer.orderCount).toFixed(2) : "0.00"}</p>
                    <p className="text-sm text-gray-500">Avg. Order</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Recent Orders</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${order.totals?.total?.toFixed(2)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${order.status === "delivered" ? "bg-green-100 text-green-800" : order.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
