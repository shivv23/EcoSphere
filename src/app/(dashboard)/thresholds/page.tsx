"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { AlertTriangle, Plus, Trash2, ToggleLeft, ToggleRight, Shield, Gauge, Users, Leaf, Activity } from "lucide-react";
import toast from "react-hot-toast";

const METRICS = [
  { value: "totalCarbonEmissions", label: "Total Carbon Emissions", unit: "tCO2e", icon: Leaf },
  { value: "openComplianceIssues", label: "Open Compliance Issues", unit: "issues", icon: Shield },
  { value: "totalCSRActivities", label: "Total CSR Activities", unit: "activities", icon: Activity },
  { value: "activeEmployees", label: "Active Employees", unit: "employees", icon: Users },
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ThresholdsPage() {
  const { data: thresholds, isLoading } = trpc.threshold.list.useQuery();
  const { data: alerts } = trpc.threshold.check.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", metric: "totalCarbonEmissions", threshold: 0, unit: "tCO2e", severity: "MEDIUM" });
  const utils = trpc.useUtils();

  const createMutation = trpc.threshold.create.useMutation({
    onSuccess: () => { toast.success("Threshold created"); utils.threshold.list.invalidate(); utils.threshold.check.invalidate(); setShowForm(false); setForm({ name: "", metric: "totalCarbonEmissions", threshold: 0, unit: "tCO2e", severity: "MEDIUM" }); },
    onError: () => toast.error("Failed to create threshold"),
  });

  const toggleMutation = trpc.threshold.update.useMutation({
    onSuccess: () => { utils.threshold.list.invalidate(); utils.threshold.check.invalidate(); },
  });

  const deleteMutation = trpc.threshold.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.threshold.list.invalidate(); utils.threshold.check.invalidate(); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Threshold Alerts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set limits and get alerted when metrics exceed thresholds</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Threshold
        </button>
      </div>

      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Active Alerts ({alerts.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((a, i) => (
              <div key={i} className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 animate-scale-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{a.value} / {a.threshold} {a.unit}</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-red-100 dark:bg-red-900/30 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (a.value / a.threshold) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-scale-in">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Threshold</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Carbon Limit" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Metric</label>
              <select value={form.metric} onChange={e => { const m = METRICS.find(m => m.value === e.target.value); setForm({ ...form, metric: e.target.value, unit: m?.unit || "" }); }} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Threshold Value</label>
              <input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50">
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Metric</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Threshold</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Severity</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-6 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>
            )) : thresholds?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                <Gauge className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No thresholds configured yet.</p>
                <p className="text-xs mt-1">Click "Add Threshold" to set up alerts.</p>
              </td></tr>
            ) : thresholds?.map((t) => {
              const metric = METRICS.find(m => m.value === t.metric);
              return (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      {metric && <metric.icon className="w-4 h-4" />}
                      {metric?.label || t.metric}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{t.threshold} {t.unit}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[t.severity] || "bg-gray-100 text-gray-600"}`}>{t.severity}</span>
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => toggleMutation.mutate({ id: t.id, enabled: !t.enabled })} className="flex items-center gap-1.5 text-sm">
                      {t.enabled ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300 dark:text-gray-600" />}
                      <span className={t.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}>{t.enabled ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => deleteMutation.mutate({ id: t.id })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
