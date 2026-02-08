import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useStore } from "../context/StoreContext";
import { CheckCircle, Package, Truck, MapPin, Mail, Phone, ArrowRight, Loader2, ShoppingBag, Calendar, User } from "lucide-react";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const { store, isServiceBased, terminology } = useStore();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const response = await api.get(`/orders/number/${orderNumber}`);
      return response.data.data;
    },
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-gray-500 mt-2">We couldn't find an order with this number.</p>
          <Link to="/" className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{isServiceBased ? "Thank You for Your Booking!" : "Thank You for Your Order!"}</h1>
          <p className="text-gray-500 mt-2">{isServiceBased ? "Your booking has been confirmed successfully." : "Your order has been placed successfully."}</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Order Header */}
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
              </div>
              <div className="mt-2 sm:mt-0 text-left sm:text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">{isServiceBased ? <Calendar className="w-5 h-5 text-primary-600" /> : <Package className="w-5 h-5 text-primary-600" />}</div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">{isServiceBased ? "Booking Status" : "Order Status"}</p>
                <p className="text-sm text-gray-500 capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">{isServiceBased ? "Booked Services" : "Order Items"}</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center">
                  <img src={item.productSnapshot?.image || item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"} alt={item.productSnapshot?.name || item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productSnapshot?.name || item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">${(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address - Only for retail */}
          {!isServiceBased && (
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Shipping Address</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    <br />
                    {order.shippingAddress?.street}
                    {order.shippingAddress?.apartment && <>, {order.shippingAddress.apartment}</>}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    <br />
                    {order.shippingAddress?.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-600">{order.customerInfo?.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-600">{order.customerInfo?.phone || order.shippingAddress?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${order.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-${order.pricing?.discount?.toFixed(2)}</span>
                </div>
              )}
              {!isServiceBased && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={order.pricing?.shipping === 0 ? "text-green-600" : "text-gray-900"}>{order.pricing?.shipping === 0 ? "Free" : `$${order.pricing?.shipping?.toFixed(2)}`}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${order.pricing?.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${order.pricing?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery/Appointment Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">{isServiceBased ? <Calendar className="w-6 h-6 text-blue-600" /> : <Truck className="w-6 h-6 text-blue-600" />}</div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">{isServiceBased ? "Appointment Details" : "Estimated Delivery"}</h3>
              <p className="text-gray-500">
                {isServiceBased
                  ? "We will contact you shortly to confirm your appointment time."
                  : `${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}`}
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-primary-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-medium">1</div>
              <p className="ml-3 text-gray-600">You'll receive an email confirmation at {order.customerInfo?.email}</p>
            </div>
            {isServiceBased ? (
              <>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-medium">2</div>
                  <p className="ml-3 text-gray-600">Our team will contact you to confirm your preferred appointment time</p>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-medium">3</div>
                  <p className="ml-3 text-gray-600">You'll receive a reminder before your appointment</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-medium">2</div>
                  <p className="ml-3 text-gray-600">We'll notify you when your order ships with tracking information</p>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-medium">3</div>
                  <p className="ml-3 text-gray-600">Your package will arrive within the estimated delivery window</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
            Return Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Need help?{" "}
            <a href={`mailto:support@${store?.slug || "retailx"}.com`} className="text-primary-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
