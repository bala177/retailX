import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Users, Plus, Trash2, Edit2, X, Save, GripVertical, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export default function Staff() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", avatar: "", specialties: "", experience: "", sortOrder: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-staff", slug],
    queryFn: () => api.get(`/store/${slug}/staff`, { headers: { "x-store-slug": slug } }),
    enabled: !!slug,
  });

  const staffList = data?.data?.data?.staff || [];

  const saveStaff = useMutation({
    mutationFn: (d) => (editing ? api.patch(`/store/${slug}/admin/staff/${editing}`, d, { headers: { "x-store-slug": slug } }) : api.post(`/store/${slug}/admin/staff`, d, { headers: { "x-store-slug": slug } })),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-staff"]);
      toast.success(editing ? "Staff updated" : "Staff added");
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteStaff = useMutation({
    mutationFn: (id) => api.delete(`/store/${slug}/admin/staff/${id}`, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-staff"]);
      toast.success("Staff removed");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", title: "", bio: "", avatar: "", specialties: "", experience: "", sortOrder: 0 });
  };

  const handleEdit = (s) => {
    setEditing(s._id);
    setForm({ name: s.name, title: s.title || "", bio: s.bio || "", avatar: s.avatar || "", specialties: (s.specialties || []).join(", "), experience: s.experience || "", sortOrder: s.sortOrder || 0 });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      specialties: form.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    saveStaff.mutate(payload);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/store/${slug}/upload/staff`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const result = await res.json();
      if (result.status === "success") {
        setForm((prev) => ({ ...prev, avatar: result.data.url }));
        toast.success("Avatar uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 mt-1">Manage your team members</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editing ? "Edit Staff" : "New Staff Member"}</h2>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer relative">
                  {form.avatar ? <img src={form.avatar} className="w-full h-full object-cover" alt="" /> : <Users className="w-8 h-8 text-gray-400" />}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">Click to upload</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Senior Stylist" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma separated)</label>
                <input type="text" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Haircuts, Coloring, Styling" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input type="text" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="5 years" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saveStaff.isPending} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saveStaff.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-gray-400">Loading...</div>
        ) : staffList.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white rounded-xl border">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No staff members added</p>
          </div>
        ) : (
          staffList.map((s) => (
            <div key={s._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" alt={s.name} /> : <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-xl">{s.name?.charAt(0)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  {s.title && <p className="text-sm text-primary-600">{s.title}</p>}
                  {s.experience && <p className="text-xs text-gray-500 mt-1">{s.experience} experience</p>}
                </div>
              </div>
              {s.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {s.specialties.map((sp, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {sp}
                    </span>
                  ))}
                </div>
              )}
              {s.bio && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{s.bio}</p>}
              <div className="flex justify-end gap-1 mt-4 pt-3 border-t">
                <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Remove staff member?")) deleteStaff.mutate(s._id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
