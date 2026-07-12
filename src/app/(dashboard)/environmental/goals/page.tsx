"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Target, TrendingUp, Plus, Pencil, Trash2, X, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function EnvironmentalGoalsPage() {
  const { data: goals, isLoading } = trpc.goal.list.useQuery();
  const utils = trpc.useUtils();

  const createGoal = trpc.goal.create.useMutation({
    onSuccess: () => { toast.success("Goal created"); setShowForm(false); resetForm(); utils.goal.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const updateGoal = trpc.goal.update.useMutation({
    onSuccess: () => { toast.success("Goal updated"); setShowForm(false); resetForm(); utils.goal.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteGoal = trpc.goal.delete.useMutation({
    onSuccess: () => { toast.success("Goal deleted"); utils.goal.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setDescription(""); setTargetValue(""); setCurrentValue("");
    setUnit(""); setStartDate(""); setEndDate("");
  };

  const openEdit = (g: any) => {
    setEditingId(g.id); setTitle(g.title); setDescription(g.description || "");
    setTargetValue(String(g.targetValue)); setCurrentValue(String(g.currentValue));
    setUnit(g.unit); setStartDate(g.startDate.slice(0, 10)); setEndDate(g.endDate.slice(0, 10));
    setShowForm(true);
  };

  const handleSubmit = () => {
    const data = {
      title, description: description || undefined,
      targetValue: parseFloat(targetValue), currentValue: parseFloat(currentValue || "0"),
      unit, startDate: new Date(startDate), endDate: new Date(endDate),
    };
    if (editingId) {
      updateGoal.mutate({ id: editingId, ...data });
    } else {
      createGoal.mutate(data);
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "from-emerald-500 to-green-500";
    if (pct >= 50) return "from-yellow-400 to-amber-500";
    return "from-red-400 to-rose-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environmental Goals</h1>
          <p className="text-gray-500 mt-1">Set and track sustainability targets</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-4 h-4" />New Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editingId ? "Edit Goal" : "Create Goal"}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="tons CO2, kWh, etc." className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Target Value</label>
              <input type="number" min="0" step="any" value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Current Value</label>
              <input type="number" min="0" step="any" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} disabled={createGoal.isPending || updateGoal.isPending || !title || !targetValue || !unit || !startDate || !endDate} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/25">
              {(createGoal.isPending || updateGoal.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = goal.targetValue > 0 ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100) : 0;
            const color = getProgressColor(pct);
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 card-hover animate-scale-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{goal.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEdit(goal)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm("Delete this goal?")) deleteGoal.mutate({ id: goal.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{goal.currentValue.toLocaleString()}</span>
                  <span className="text-sm text-gray-400">/ {goal.targetValue.toLocaleString()} {goal.unit}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-1.5">
                  <div className={`bg-gradient-to-r ${color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{pct}% complete</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {goal.startDate.slice(0, 10)} → {goal.endDate.slice(0, 10)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">Create your first environmental goal to start tracking sustainability targets.</p>
        </div>
      )}
    </div>
  );
}
