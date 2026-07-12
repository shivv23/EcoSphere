"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Plus, Gift, X, Loader2, Trash2, Zap, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function RewardsPage() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: rewards, isLoading } = trpc.reward.list.useQuery();
  const createMutation = trpc.reward.create.useMutation({
    onSuccess: () => { toast.success("Reward created"); setShowForm(false); utils.reward.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const redeemMutation = trpc.reward.redeem.useMutation({
    onSuccess: () => { toast.success("Reward redeemed!"); utils.reward.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.reward.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.reward.list.invalidate(); },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const [form, setForm] = useState({ name: "", description: "", pointsRequired: "", stock: "", category: "General" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, pointsRequired: parseInt(form.pointsRequired), stock: parseInt(form.stock) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1><p className="text-gray-500 mt-1">Redeem earned points for rewards</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "New Reward"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-900">Create Reward</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Reward name" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="number" value={form.pointsRequired} onChange={e => setForm({ ...form, pointsRequired: e.target.value })} required placeholder="Points required" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="Stock quantity" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={2} placeholder="Reward description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none" />
          <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Create Reward
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-40 animate-pulse" />) :
          rewards && rewards.length > 0 ? rewards.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg"><Gift className="w-6 h-6 text-white" /></div>
                <button onClick={() => { if (window.confirm("Are you sure you want to delete this?")) deleteMutation.mutate({ id: r.id }); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="font-semibold text-gray-900">{r.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full"><Zap className="w-3 h-3 text-amber-500" /><span className="text-xs font-bold text-amber-700">{r.pointsRequired} pts</span></div>
                <span className={`text-xs font-medium ${r.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{r.stock > 0 ? `${r.stock} in stock` : "Out of stock"}</span>
              </div>
              {r.stock > 0 && (
                <button onClick={() => redeemMutation.mutate({ rewardId: r.id })} disabled={redeemMutation.isPending} className="w-full mt-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" />Redeem
                </button>
              )}
            </div>
          )) : <div className="col-span-full bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-400"><Gift className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No rewards in catalog</p></div>}
      </div>
    </div>
  );
}
