"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Trophy, X, Loader2, Trash2, Users, Clock, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function ChallengesPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const utils = trpc.useUtils();
  const { data: challenges, isLoading } = trpc.challenge.list.useQuery(statusFilter ? { status: statusFilter as any } : undefined);
  const { data: categories } = trpc.category.list.useQuery({ type: "CHALLENGE" });

  const createMutation = trpc.challenge.create.useMutation({
    onSuccess: () => { toast.success("Challenge created"); setShowForm(false); utils.challenge.list.invalidate(); utils.challenge.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const participateMutation = trpc.challenge.participate.useMutation({
    onSuccess: () => { toast.success("Joined challenge!"); utils.challenge.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.challenge.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.challenge.list.invalidate(); utils.challenge.stats.invalidate(); },
  });

  const [form, setForm] = useState({ title: "", description: "", categoryId: "", xpReward: "100", difficulty: "Medium", deadline: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, xpReward: parseInt(form.xpReward), deadline: new Date(form.deadline), evidenceRequired: false });
  };

  const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-700", ACTIVE: "bg-emerald-100 text-emerald-700", UNDER_REVIEW: "bg-amber-100 text-amber-700", COMPLETED: "bg-blue-100 text-blue-700", ARCHIVED: "bg-gray-100 text-gray-500" };
  const diffColors: Record<string, string> = { Easy: "bg-emerald-100 text-emerald-700", Medium: "bg-amber-100 text-amber-700", Hard: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Challenges</h1><p className="text-gray-500 mt-1">Sustainability challenges for employee engagement</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Challenge"}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "DRAFT"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create Challenge</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Challenge title" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
              <option value="">Category</option>{categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
              <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
            </select>
            <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: e.target.value })} placeholder="XP Reward" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none" />
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Challenge description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Challenge
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-48 animate-pulse" />) :
          challenges && challenges.length > 0 ? challenges.map((ch: any) => (
            <div key={ch.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ch.status]}`}>{ch.status}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffColors[ch.difficulty] || ""}`}>{ch.difficulty}</span>
                </div>
                <button onClick={() => deleteMutation.mutate({ id: ch.id })} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{ch.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ch.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(ch.deadline)}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ch._count.participations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full"><Zap className="w-3 h-3 text-amber-500" /><span className="text-xs font-bold text-amber-700">{ch.xpReward} XP</span></div>
                {ch.status === "ACTIVE" && (
                  <button onClick={() => participateMutation.mutate({ challengeId: ch.id })} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">Join</button>
                )}
              </div>
            </div>
          )) : <div className="col-span-full bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No challenges yet</p></div>}
      </div>
    </div>
  );
}
