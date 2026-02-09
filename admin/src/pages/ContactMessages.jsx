import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../context/TenantContext";
import { Mail, MessageSquare, Inbox, Reply, Archive, Eye, Users, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ContactMessages() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const slug = currentTenant?.slug;
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["contact-messages", slug, statusFilter],
    queryFn: () =>
      api.get(`/store/${slug}/admin/contact`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined },
        headers: { "x-store-slug": slug },
      }),
    enabled: !!slug,
  });

  const { data: subscribersData } = useQuery({
    queryKey: ["newsletter-subscribers", slug],
    queryFn: () => api.get(`/store/${slug}/admin/newsletter`, { headers: { "x-store-slug": slug } }),
    enabled: !!slug,
  });

  const messages = messagesData?.data?.data?.submissions || [];
  const subscribers = subscribersData?.data?.data?.subscribers || [];
  const [tab, setTab] = useState("messages");

  const updateMessage = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/store/${slug}/admin/contact/${id}`, data, { headers: { "x-store-slug": slug } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["contact-messages"]);
      toast.success("Updated");
      setSelected(null);
      setReplyText("");
    },
    onError: () => toast.error("Failed"),
  });

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    updateMessage.mutate({ id, data: { status: "replied", reply: replyText } });
  };

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    read: "bg-yellow-100 text-yellow-700",
    replied: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages & Newsletter</h1>
          <p className="text-gray-500 mt-1">Manage contact form submissions and subscribers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setTab("messages")} className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${tab === "messages" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <Inbox className="w-4 h-4 inline mr-2" />
          Messages ({messages.length})
        </button>
        <button onClick={() => setTab("subscribers")} className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${tab === "subscribers" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <Users className="w-4 h-4 inline mr-2" />
          Subscribers ({subscribers.length})
        </button>
      </div>

      {tab === "messages" && (
        <>
          <div className="flex gap-2">
            {["all", "new", "read", "replied", "archived"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages</p>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((msg) => (
                  <div key={msg._id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{msg.subject || "No Subject"}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[msg.status] || "bg-gray-100"}`}>{msg.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{msg.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{msg.name}</span>
                          <span>{msg.email}</span>
                          {msg.phone && <span>{msg.phone}</span>}
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        {msg.reply && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-sm text-green-700">
                              <Reply className="w-3 h-3 inline mr-1" /> {msg.reply}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        {msg.status === "new" && (
                          <button onClick={() => updateMessage.mutate({ id: msg._id, data: { status: "read" } })} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Mark Read">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelected(selected?._id === msg._id ? null : msg);
                            setReplyText("");
                          }}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateMessage.mutate({ id: msg._id, data: { status: "archived" } })} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Archive">
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {selected?._id === msg._id && (
                      <div className="mt-4 pt-4 border-t flex gap-3">
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." rows={3} className="flex-1 px-4 py-2 border rounded-lg text-sm" />
                        <button onClick={() => handleReply(msg._id)} disabled={updateMessage.isPending} className="self-end px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                          Send Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "subscribers" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {subscribers.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Subscribed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm">{sub.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === "subscribed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{sub.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
