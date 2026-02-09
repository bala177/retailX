import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Star, Check, X, Eye, Trash2, Filter, Search, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Reviews() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug;
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", slug, statusFilter, search],
    queryFn: () =>
      api.get(`/store/${slug}/admin/reviews`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined },
        headers: { "x-store-slug": slug },
      }),
    enabled: !!slug,
  });

  const reviews = data?.data?.data?.reviews || [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/store/${slug}/admin/reviews/${id}`, { status }, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews"]);
      toast.success("Review updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/store/${slug}/reviews/${id}`, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews"]);
      toast.success("Review deleted");
    },
  });

  const renderStars = (rating) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  const statusBadge = (status) => {
    const map = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">Manage customer reviews and ratings</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review._id} className="p-5 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      {statusBadge(review.status)}
                      {review.helpful > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp className="w-3 h-3" /> {review.helpful}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>
                        by {review.user?.firstName} {review.user?.lastName}
                      </span>
                      <span>Product: {review.product?.name}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {review.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus.mutate({ id: review._id, status: "approved" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus.mutate({ id: review._id, status: "rejected" })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this review?")) deleteReview.mutate(review._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
