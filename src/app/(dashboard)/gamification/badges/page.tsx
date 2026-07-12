"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Medal, X, Loader2, Trash2, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function BadgesPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: badges, isLoading } = trpc.badge.list.useQuery();
  const createMutation = trpc.badge.create.useMutation({
    onSuccess: () => { toast.success("Badge created"); setShowForm(false); utils.badge.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.badge.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.badge.list.invalidate(); },
  });

  const [form, setForm] = useState({ name: "", description: "", icon: "🏅", xpThreshold: "0", challengeThreshold: "0", tier: "Bronze" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, xpThreshold: parseInt(form.xpThreshold), challengeThreshold: parseInt(form.challengeThreshold) });
  };

  const tierColors: Record<string, { bg: string; ring: string; text: string }> = {
    Bronze: { bg: "from-amber-600 to-orange-700", ring: "ring-amber-200", text: "text-amber-700" },
    Silver: { bg: "from-gray-400 to-gray-600", ring: "ring-gray-200", text: "text-gray-600" },
    Gold: { bg: "from-yellow-400 to-amber-500", ring: "ring-yellow-200", text: "text-yellow-600" },
    Platinum: { bg: "from-cyan-400 to-blue-500", ring: "ring-cyan-200", text: "text-cyan-600" },
    Diamond: { bg: "from-purple-400 to-pink-500", ring: "ring-purple-200", text: "text-purple-600" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Badges</h1><p className="text-gray-500 mt-1">Employee achievement badges and unlock rules</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Badge"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create Badge</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Badge name" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
            <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Emoji icon" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none">
              <option value="Bronze">Bronze</option><option value="Silver">Silver</option><option value="Gold">Gold</option><option value="Platinum">Platinum</option><option value="Diamond">Diamond</option>
            </select>
            <input type="number" value={form.xpThreshold} onChange={e => setForm({ ...form, xpThreshold: e.target.value })} placeholder="XP threshold" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
            <input type="number" value={form.challengeThreshold} onChange={e => setForm({ ...form, challengeThreshold: e.target.value })} placeholder="Challenge count threshold" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={2} placeholder="Badge description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Badge
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-40 animate-pulse" />) :
          badges && badges.length > 0 ? badges.map((b: any) => {
            const tier = tierColors[b.tier] || tierColors.Bronze;
            return (
              <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.bg} flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg ring-4 ${tier.ring}`}>
                  {b.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{b.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className={`text-xs font-medium ${tier.text}`}>{b.tier}</span>
                  {b.xpThreshold > 0 && <span className="text-xs text-gray-400">· {b.xpThreshold} XP</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">{b._count?.assignments || 0} awarded</p>
              </div>
            );
          }) : <div className="col-span-full bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Medal className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No badges yet</p></div>}
      </div>
    </div>
  );
}
