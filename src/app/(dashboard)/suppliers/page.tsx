"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Truck, Plus, X, MapPin, Tag, Mail, User, FileText, ChevronRight, Star, AlertTriangle, Shield, Leaf, Users } from "lucide-react";

function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const getColor = (s: number) => {
    if (s < 30) return { bar: "bg-red-500", text: "text-red-600", ring: "ring-red-200" };
    if (s < 60) return { bar: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-200" };
    if (s < 80) return { bar: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200" };
    return { bar: "bg-green-400", text: "text-green-600", ring: "ring-green-200" };
  };
  const colors = getColor(score);
  const dim = size === "sm" ? "w-12 h-12" : size === "lg" ? "w-20 h-20" : "w-16 h-16";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-sm";

  return (
    <div className={`${dim} rounded-full flex items-center justify-center ring-4 ${colors.ring} bg-white dark:bg-slate-800`}>
      <span className={`${text} font-bold ${colors.text}`}>{Math.round(score)}</span>
    </div>
  );
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const getColor = (s: number) => {
    if (s < 30) return "bg-red-500";
    if (s < 60) return "bg-amber-500";
    if (s < 80) return "bg-emerald-500";
    return "bg-green-400";
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${getColor(score)} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const { data: suppliers, isLoading, refetch } = trpc.supplier.list.useQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssess, setShowAssess] = useState(false);
  const [form, setForm] = useState({ name: "", contactEmail: "", contactPerson: "", country: "", category: "", notes: "" });
  const [assessForm, setAssessForm] = useState({ supplierId: "", envScore: 50, socialScore: 50, govScore: 50, notes: "" });

  const selected = suppliers?.find(s => s.id === selectedId);
  const detailQuery = trpc.supplier.get.useQuery({ id: selectedId! }, { enabled: !!selectedId });
  const detail = detailQuery.data;

  const createMut = trpc.supplier.create.useMutation({ onSuccess: () => { refetch(); setShowAdd(false); setForm({ name: "", contactEmail: "", contactPerson: "", country: "", category: "", notes: "" }); } });
  const assessMut = trpc.supplier.assess.useMutation({ onSuccess: () => { refetch(); detailQuery.refetch(); setShowAssess(false); setAssessForm({ supplierId: "", envScore: 50, socialScore: 50, govScore: 50, notes: "" }); } });
  const deleteMut = trpc.supplier.delete.useMutation({ onSuccess: () => { refetch(); setSelectedId(null); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supplier ESG Scorecards</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Evaluate and monitor supplier sustainability performance</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-xl transition-all">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Supplier</h2>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Supplier name" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contact Email</label>
              <input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Contact person" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Country</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Country" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. Raw Materials" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Notes" />
            </div>
          </div>
          <button onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="mt-4 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-all">
            {createMut.isPending ? "Creating..." : "Create Supplier"}
          </button>
        </div>
      )}

      {showAssess && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assess Supplier</h2>
            <button onClick={() => setShowAssess(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Environmental Score: {assessForm.envScore}</label>
              <input type="range" min={0} max={100} value={assessForm.envScore} onChange={e => setAssessForm({ ...assessForm, envScore: +e.target.value })} className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-slate-400"><span>0</span><span>100</span></div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Social Score: {assessForm.socialScore}</label>
              <input type="range" min={0} max={100} value={assessForm.socialScore} onChange={e => setAssessForm({ ...assessForm, socialScore: +e.target.value })} className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-slate-400"><span>0</span><span>100</span></div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Governance Score: {assessForm.govScore}</label>
              <input type="range" min={0} max={100} value={assessForm.govScore} onChange={e => setAssessForm({ ...assessForm, govScore: +e.target.value })} className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-slate-400"><span>0</span><span>100</span></div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes</label>
              <textarea value={assessForm.notes} onChange={e => setAssessForm({ ...assessForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none" placeholder="Assessment notes..." />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Total: <span className="font-bold text-slate-900 dark:text-white">{Math.round((assessForm.envScore * 0.4 + assessForm.socialScore * 0.3 + assessForm.govScore * 0.3) * 10) / 10}</span>
              </div>
              <button onClick={() => assessMut.mutate(assessForm)} disabled={assessMut.isPending} className="px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-all">
                {assessMut.isPending ? "Saving..." : "Submit Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedId ? "lg:col-span-1" : "lg:col-span-3"}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 h-48" />)}
            </div>
          ) : suppliers && suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(s => {
                const latestAssessment = s.assessments[0];
                return (
                  <button key={s.id} onClick={() => setSelectedId(selectedId === s.id ? null : s.id)} className={`text-left rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${selectedId === s.id ? "border-violet-300 dark:border-violet-600 bg-violet-50/50 dark:bg-violet-900/10 shadow-md" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{s.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          {s.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.country}</span>}
                          {s.category && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{s.category}</span>}
                        </div>
                      </div>
                      <ScoreGauge score={s.esgScore} size="sm" />
                    </div>
                    {latestAssessment && (
                      <p className="mt-3 text-xs text-slate-400">Last assessed: {new Date(latestAssessment.assessmentDate).toLocaleDateString()}</p>
                    )}
                    <div className="mt-2 flex justify-end">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
              <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Suppliers</h3>
              <p className="text-sm text-slate-500">Add your first supplier to start tracking ESG performance.</p>
            </div>
          )}
        </div>

        {selectedId && detail && (
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{detail.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {detail.contactPerson && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{detail.contactPerson}</span>}
                    {detail.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{detail.contactEmail}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {detail.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{detail.country}</span>}
                    {detail.category && <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{detail.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreGauge score={detail.esgScore} size="lg" />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <ScoreBar label="Environmental" score={detail.envScore} icon={Leaf} />
                <ScoreBar label="Social" score={detail.socialScore} icon={Users} />
                <ScoreBar label="Governance" score={detail.govScore} icon={Shield} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setAssessForm({ ...assessForm, supplierId: detail.id }); setShowAssess(true); }} className="px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-all">
                  New Assessment
                </button>
                <button onClick={() => deleteMut.mutate({ id: detail.id })} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all">
                  Delete
                </button>
              </div>
            </div>

            {detail.assessments.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assessment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="text-left py-2 text-xs font-medium text-slate-500">Date</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500">Env</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500">Social</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500">Gov</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.assessments.map(a => (
                        <tr key={a.id} className="border-b border-slate-50 dark:border-slate-700/50">
                          <td className="py-2.5 text-slate-700 dark:text-slate-300">{new Date(a.assessmentDate).toLocaleDateString()}</td>
                          <td className="py-2.5 text-right font-medium text-emerald-600">{a.envScore}</td>
                          <td className="py-2.5 text-right font-medium text-blue-600">{a.socialScore}</td>
                          <td className="py-2.5 text-right font-medium text-purple-600">{a.govScore}</td>
                          <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{a.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
