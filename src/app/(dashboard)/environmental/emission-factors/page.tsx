"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Zap, X, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EmissionFactorsPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: factors, isLoading } = trpc.emissionFactor.list.useQuery();
  const createMutation = trpc.emissionFactor.create.useMutation({
    onSuccess: () => { toast.success("Emission factor created"); setShowForm(false); utils.emissionFactor.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.emissionFactor.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.emissionFactor.list.invalidate(); },
  });

  const [form, setForm] = useState({ name: "", source: "", factor: "", unit: "", scope: "1" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: form.name, source: form.source, factor: parseFloat(form.factor), unit: form.unit, scope: parseInt(form.scope) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Emission Factors</h1><p className="text-gray-500 mt-1">Manage carbon emission factors for calculations</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Factor"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">New Emission Factor</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Name" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required placeholder="Source (e.g. EPA)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="number" step="0.0001" value={form.factor} onChange={e => setForm({ ...form, factor: e.target.value })} required placeholder="Factor" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required placeholder="Unit (kgCO2/kWh)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none">
              <option value="1">Scope 1</option><option value="2">Scope 2</option><option value="3">Scope 3</option>
            </select>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Save Factor
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-32 animate-pulse" />) :
          factors && factors.length > 0 ? factors.map((f: any) => (
            <div key={f.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"><Zap className="w-5 h-5 text-white" /></div>
                  <div><h3 className="font-semibold text-gray-900">{f.name}</h3><p className="text-xs text-gray-500">{f.source}</p></div>
                </div>
                <button onClick={() => deleteMutation.mutate({ id: f.id })} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{f.factor}</span>
                <span className="text-sm text-gray-500">{f.unit}</span>
              </div>
              <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Scope {f.scope}</span>
            </div>
          )) : <div className="col-span-full py-12 text-center text-gray-400"><Zap className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No emission factors defined</p></div>}
      </div>
    </div>
  );
}
