"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Heart, X, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function CSRActivitiesPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: activities, isLoading } = trpc.csrActivity.list.useQuery();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery({ type: "CSR_ACTIVITY" });

  const createMutation = trpc.csrActivity.create.useMutation({
    onSuccess: () => { toast.success("CSR activity created"); setShowForm(false); utils.csrActivity.list.invalidate(); utils.csrActivity.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const approveMutation = trpc.csrActivity.approve.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.csrActivity.list.invalidate(); utils.csrActivity.stats.invalidate(); },
  });
  const deleteMutation = trpc.csrActivity.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.csrActivity.list.invalidate(); utils.csrActivity.stats.invalidate(); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const [form, setForm] = useState({ title: "", description: "", departmentId: "", categoryId: "", location: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, location: form.location || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">CSR Activities</h1><p className="text-gray-500 mt-1">Manage community service and social initiatives</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-pink-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Activity"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create CSR Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Activity title" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none">
              <option value="">Select category</option>{categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none">
              <option value="">Select department</option>{departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location (optional)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe the activity..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Activity
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-28 animate-pulse" />) :
          activities && activities.length > 0 ? activities.map((a: any) => (
            <div key={a.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0"><Heart className="w-6 h-6 text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{a.department.name}</span><span>·</span><span>{a.category.name}</span><span>·</span><span>{formatDate(a.date)}</span><span>·</span><span>{a._count.participations} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : a.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
                  {a.status === "PENDING" && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: a.id, status: "APPROVED" })} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => approveMutation.mutate({ id: a.id, status: "REJECTED" })} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><XCircle className="w-4 h-4" /></button>
                    </>
                  )}
                  <button onClick={() => { if (window.confirm("Are you sure you want to delete this?")) deleteMutation.mutate({ id: a.id }); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )) : <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Heart className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No CSR activities yet</p></div>}
      </div>
    </div>
  );
}
