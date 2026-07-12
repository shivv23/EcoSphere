"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, FileText, X, Loader2, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function PoliciesPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: policies, isLoading } = trpc.policy.list.useQuery();
  const createMutation = trpc.policy.create.useMutation({
    onSuccess: () => { toast.success("Policy created"); setShowForm(false); utils.policy.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const ackMutation = trpc.policy.acknowledge.useMutation({
    onSuccess: () => { toast.success("Policy acknowledged"); utils.policy.list.invalidate(); },
  });
  const deleteMutation = trpc.policy.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.policy.list.invalidate(); },
  });

  const [form, setForm] = useState({ title: "", description: "", category: "General", version: "1.0" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, effectiveDate: new Date() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">ESG Policies</h1><p className="text-gray-500 mt-1">Manage governance policies and acknowledgements</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Policy"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Policy title" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
            <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={4} placeholder="Full policy description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Policy
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-28 animate-pulse" />) :
          policies && policies.length > 0 ? policies.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{p.category}</span><span>·</span><span>v{p.version}</span><span>·</span><span>{formatDate(p.effectiveDate)}</span><span>·</span><span>{p._count.acknowledgements} acknowledged</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => ackMutation.mutate({ policyId: p.id })} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"><CheckCircle className="w-3.5 h-3.5" />Acknowledge</button>
                  <button onClick={() => deleteMutation.mutate({ id: p.id })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )) : <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No policies yet</p></div>}
      </div>
    </div>
  );
}
