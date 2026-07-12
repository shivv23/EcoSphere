"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Factory, Filter, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function CarbonTrackingPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();

  const { data: transactions, isLoading } = trpc.carbonTransaction.list.useQuery({});
  const { data: departments } = trpc.department.list.useQuery();
  const { data: emissionFactors } = trpc.emissionFactor.list.useQuery();

  const createMutation = trpc.carbonTransaction.create.useMutation({
    onSuccess: () => { toast.success("Carbon transaction recorded"); setShowForm(false); utils.carbonTransaction.list.invalidate(); utils.carbonTransaction.monthly.invalidate(); utils.carbonTransaction.totals.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({ departmentId: "", emissionFactorId: "", source: "", quantity: "", totalEmissions: "", scope: "1", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      departmentId: form.departmentId,
      emissionFactorId: form.emissionFactorId || undefined,
      source: form.source,
      quantity: parseFloat(form.quantity),
      totalEmissions: parseFloat(form.totalEmissions),
      scope: parseInt(form.scope),
      notes: form.notes || undefined,
    });
  };

  const scopeColors: Record<number, string> = { 1: "bg-emerald-100 text-emerald-700", 2: "bg-amber-100 text-amber-700", 3: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carbon Transactions</h1>
          <p className="text-gray-500 mt-1">Track and manage carbon emission records</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Transaction"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Record Carbon Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none">
                <option value="">Select department</option>
                {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required placeholder="e.g. Natural Gas, Electricity" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
              <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none">
                <option value="1">Scope 1 - Direct</option>
                <option value="2">Scope 2 - Energy</option>
                <option value="3">Scope 3 - Supply Chain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emission Factor</label>
              <select value={form.emissionFactorId} onChange={e => setForm({ ...form, emissionFactorId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none">
                <option value="">Select factor (optional)</option>
                {emissionFactors?.map((f: any) => <option key={f.id} value={f.id}>{f.name} ({f.factor} {f.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Emissions (tCO2e)</label>
              <input type="number" step="0.01" value={form.totalEmissions} onChange={e => setForm({ ...form, totalEmissions: e.target.value })} required placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none" />
          </div>
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Transaction
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scope</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emissions</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : transactions && transactions.length > 0 ? transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.department.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.source}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${scopeColors[t.scope] || ""}`}>Scope {t.scope}</span></td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.totalEmissions.toFixed(2)} tCO2e</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.quantity.toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400"><Factory className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No carbon transactions yet</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
