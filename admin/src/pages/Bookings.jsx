import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Calendar, Clock, User, Check, X, Eye, Filter, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Bookings() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug;
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", slug, statusFilter],
    queryFn: () =>
      api.get(`/store/${slug}/admin/bookings`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined },
        headers: { "x-store-slug": slug },
      }),
    enabled: !!slug,
  });

  const bookings = data?.data?.data?.bookings || [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/store/${slug}/admin/bookings/${id}`, { status }, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-bookings"]);
      toast.success("Booking updated");
      setSelectedBooking(null);
    },
    onError: () => toast.error("Failed to update"),
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    "no-show": "bg-gray-100 text-gray-600",
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1">Manage appointments and bookings</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y">
            {bookings.map((b) => (
              <div key={b._id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{b.service?.name || "Service"}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(b.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(b.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {b.customer?.firstName || b.guestInfo?.name || "Guest"} {b.customer?.lastName || ""}
                        </span>
                      </div>
                      {b.staff && <p className="text-xs text-gray-400 mt-1">Staff: {b.staff.name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[b.status] || "bg-gray-100"}`}>{b.status}</span>
                    <div className="flex gap-1">
                      {b.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus.mutate({ id: b._id, status: "confirmed" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Confirm">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus.mutate({ id: b._id, status: "cancelled" })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <button onClick={() => updateStatus.mutate({ id: b._id, status: "completed" })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Mark Complete">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setSelectedBooking(selectedBooking?._id === b._id ? null : b)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Expanded details */}
                {selectedBooking?._id === b._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span> <span className="text-gray-900">{b.customer?.email || b.guestInfo?.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span> <span className="text-gray-900">{b.guestInfo?.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span> <span className="text-gray-900">${b.price || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span> <span className="text-gray-900">{b.duration || 60} min</span>
                    </div>
                    {b.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Notes:</span> <span className="text-gray-900">{b.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
