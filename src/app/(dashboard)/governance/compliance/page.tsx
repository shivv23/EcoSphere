"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, AlertTriangle, X, Loader2, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function CompliancePage() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const utils = trpc.useUtils();
  const { data: issues, isLoading } = trpc.compliance.list.useQuery(filterStatus ? { status: filterStatus as any } : undefined);
  const { data: users } = trpc.user.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();

  const createMutation = trpc.compliance.create.useMutation({
    onSuccess: () => { toast.success("Issue created"); setShowForm(false); utils.compliance.list.invalidate(); utils.compliance.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const resolveMutation = trpc.compliance.resolve.useMutation({
    onSuccess: () => { toast.success("Issue resolved"); utils.compliance.list.invalidate(); utils.compliance.stats.invalidate(); },
  });
  const deleteMutation = trpc.compliance.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.compliance.list.invalidate(); utils.compliance.stats.invalidate(); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const [form, setForm] = useState({ title: "", description: "", severity: "MEDIUM", ownerId: "", auditId: "", dueDate: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, auditId: form.auditId || undefined, dueDate: new Date(form.dueDate), severity: form.severity as any });
  };

  const sevColors: Record<string, string> = { CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-emerald-100 text-emerald-700" };
  const statusColors: Record<string, string> = { OPEN: "bg-red-100 text-red-700", IN_PROGRESS: "bg-amber-100 text-amber-700", RESOLVED: "bg-emerald-100 text-emerald-700", CLOSED: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Compliance Issues</h1><p className="text-gray-500 mt-1">Track and resolve governance compliance issues</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Issue"}
        </button>
      </div>

      <div className="flex gap-2">
        {["", "OPEN", "IN_PROGRESS", "RESOLVED"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">New Compliance Issue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Issue title" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none" />
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
            </select>
            <select value={form.ownerId} onChange={e => setForm({ ...form, ownerId: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none">
              <option value="">Assign owner</option>{users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={form.auditId} onChange={e => setForm({ ...form, auditId: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none">
              <option value="">Link to audit (optional)</option>{audits?.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Issue description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Issue
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-24 animate-pulse" />) :
          issues && issues.length > 0 ? issues.map((issue: any) => (
            <div key={issue.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{issue.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Owner: {issue.owner.name}</span><span>·</span><span>Due: {formatDate(issue.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sevColors[issue.severity]}`}>{issue.severity}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>{issue.status}</span>
                  {issue.status !== "RESOLVED" && issue.status !== "CLOSED" && (
                    <button onClick={() => resolveMutation.mutate({ id: issue.id })} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => { if (window.confirm("Are you sure you want to delete this?")) deleteMutation.mutate({ id: issue.id }); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )) : <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No compliance issues</p></div>}
      </div>
    </div>
  );
}
