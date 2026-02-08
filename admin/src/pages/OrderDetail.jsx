import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { ArrowLeft, Package, Truck, CreditCard, MapPin, User, Phone, Mail, Calendar, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { storeAPI, currentTenant } = useTenant();
  const queryClient = useQueryClient();

  // Fetch order
  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => storeAPI?.orders.getById(id),
    enabled: !!storeAPI,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status) => storeAPI?.orders.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["orders", currentTenant?.slug]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const order = orderData?.data?.data?.order;

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <button onClick={() => navigate("/orders")} className="mt-4 text-primary-600 hover:text-primary-700">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/orders")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const currentIndex = statusFlow.indexOf(order.status);
            const isCompleted = index <= currentIndex;
            const isCurrent = status === order.status;

            return (
              <div key={status} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => updateStatusMutation.mutate(status)}
                    disabled={updateStatusMutation.isPending}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-300 text-gray-400"} ${isCurrent ? "ring-4 ring-primary-100" : ""}`}
                  >
                    {index + 1}
                  </button>
                  <span className={`mt-2 text-sm font-medium capitalize ${isCompleted ? "text-primary-600" : "text-gray-400"}`}>{status}</span>
                </div>
                {index < statusFlow.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-0.5 ${index < currentIndex ? "bg-primary-600" : "bg-gray-300"}`} />}
              </div>
            );
          })}
        </div>
        {order.status === "cancelled" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">This order has been cancelled.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <span className="text-sm text-gray-500">{order.items?.length} items</span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center p-4">
                  <img src={item.image || "https://via.placeholder.com/60"} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    {item.variant && <p className="text-xs text-gray-500">Variant: {item.variant}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      ${item.price?.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900">${item.subtotal?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Notes</h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${order.totals?.subtotal?.toFixed(2)}</span>
              </div>
              {order.totals?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-${order.totals?.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{order.totals?.shipping > 0 ? `$${order.totals?.shipping?.toFixed(2)}` : "Free"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${order.totals?.tax?.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${order.totals?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                {order.customer?.firstName} {order.customer?.lastName}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{order.customer?.email}</span>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.customer?.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
            </div>
            {order.shipping?.address && (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.shipping.address.name}</p>
                <p>{order.shipping.address.street}</p>
                {order.shipping.address.apartment && <p>{order.shipping.address.apartment}</p>}
                <p>
                  {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
                </p>
                <p>{order.shipping.address.country}</p>
              </div>
            )}
            {order.shipping?.method && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Method</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{order.shipping.method}</p>
              </div>
            )}
            {order.shipping?.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="text-sm font-medium text-primary-600">{order.shipping.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Method</span>
                <span className="text-sm text-gray-900 capitalize">{order.payment?.method || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : order.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Transaction ID</span>
                  <span className="text-sm text-gray-900 font-mono">{order.payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
