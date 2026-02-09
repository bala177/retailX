import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Tag, Plus, Trash2, Edit2, X, Save, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Coupons() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", type: "percentage", value: 10, minOrderAmount: 0, maxUsage: 0, perUserLimit: 1, startDate: "", endDate: "", isActive: true, description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons", slug],
    queryFn: () => api.get(`/store/${slug}/admin/coupons`, { headers: { "x-store-slug": slug } }),
    enabled: !!slug,
  });

  const coupons = data?.data?.data?.coupons || [];

  const saveCoupon = useMutation({
    mutationFn: (data) => (editing ? api.patch(`/store/${slug}/admin/coupons/${editing}`, data, { headers: { "x-store-slug": slug } }) : api.post(`/store/${slug}/admin/coupons`, data, { headers: { "x-store-slug": slug } })),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success(editing ? "Coupon updated" : "Coupon created");
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id) => api.delete(`/store/${slug}/admin/coupons/${id}`, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon deleted");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ code: "", type: "percentage", value: 10, minOrderAmount: 0, maxUsage: 0, perUserLimit: 1, startDate: "", endDate: "", isActive: true, description: "" });
  };

  const handleEdit = (c) => {
    setEditing(c._id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount || 0,
      maxUsage: c.maxUsage || 0,
      perUserLimit: c.perUserLimit || 1,
      startDate: c.startDate?.slice(0, 10) || "",
      endDate: c.endDate?.slice(0, 10) || "",
      isActive: c.isActive,
      description: c.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveCoupon.mutate(form);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">Manage discount codes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editing ? "Edit Coupon" : "New Coupon"}</h2>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-4 py-2 border rounded-lg uppercase" required placeholder="SUMMER20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label>
                <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0=unlimited)</label>
                <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Summer sale discount" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm font-medium">Active</span>
              </label>
              <button type="submit" disabled={saveCoupon.isPending} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saveCoupon.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No coupons created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-gray-100 px-2 py-1 rounded">{c.code}</span>
                        <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-600">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-primary-600">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</span>
                      {c.minOrderAmount > 0 && <p className="text-xs text-gray-500">Min: ${c.minOrderAmount}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {c.usageCount || 0}
                      {c.maxUsage > 0 ? ` / ${c.maxUsage}` : " / ∞"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"} → {c.endDate ? new Date(c.endDate).toLocaleDateString() : "∞"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete coupon?")) deleteCoupon.mutate(c._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
