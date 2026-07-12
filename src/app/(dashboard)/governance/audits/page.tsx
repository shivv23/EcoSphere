"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, ClipboardCheck, X, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function AuditsPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: audits, isLoading } = trpc.audit.list.useQuery();
  const createMutation = trpc.audit.create.useMutation({
    onSuccess: () => { toast.success("Audit created"); setShowForm(false); utils.audit.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.audit.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.audit.list.invalidate(); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const [form, setForm] = useState({ title: "", description: "", score: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title: form.title, description: form.description || undefined, score: form.score ? parseFloat(form.score) : undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Audits</h1><p className="text-gray-500 mt-1">Governance audit management and tracking</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Audit"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create Audit</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Audit title" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
            <input type="number" min="0" max="100" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} placeholder="Score 0-100" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Audit
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-32 animate-pulse" />) :
          audits && audits.length > 0 ? audits.map((a: any) => (
            <div key={a.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg"><ClipboardCheck className="w-5 h-5 text-white" /></div>
                  <div><h3 className="font-semibold text-gray-900">{a.title}</h3><p className="text-xs text-gray-500">{formatDate(a.auditDate)}</p></div>
                </div>
                <button onClick={() => { if (window.confirm("Are you sure you want to delete this?")) deleteMutation.mutate({ id: a.id }); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              {a.score != null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Score</span><span className="text-sm font-bold text-gray-900">{a.score}/100</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${a.score >= 80 ? "bg-emerald-500" : a.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${a.score}%` }} /></div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">{a._count.complianceIssues} compliance issues</p>
            </div>
          )) : <div className="col-span-full bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No audits yet</p></div>}
      </div>
    </div>
  );
}
