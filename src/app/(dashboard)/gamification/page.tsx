"use client";

import { trpc } from "@/lib/trpc/client";
import { Trophy, Flame, Medal, Gift, TrendingUp, Users, Zap } from "lucide-react";

export default function GamificationPage() {
  const { data: challengeStats, isLoading: loadingCh } = trpc.challenge.stats.useQuery();
  const { data: badges } = trpc.badge.list.useQuery();
  const { data: rewards } = trpc.reward.list.useQuery();
  const { data: topEmployees } = trpc.user.xp.useQuery();

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Gamification</h1><p className="text-gray-500 mt-1">Challenges, badges, XP, rewards and leaderboards</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Challenges", value: challengeStats?.total || 0, icon: Trophy, color: "from-amber-500 to-orange-600" },
          { label: "Active Challenges", value: challengeStats?.active || 0, icon: Flame, color: "from-red-500 to-rose-600" },
          { label: "Badges Available", value: badges?.length || 0, icon: Medal, color: "from-purple-500 to-violet-600" },
          { label: "Rewards in Catalog", value: rewards?.length || 0, icon: Gift, color: "from-emerald-500 to-green-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-gray-500 mb-1">{kpi.label}</p>{loadingCh ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>}</div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}><kpi.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-500" /> Top Performers</h3>
        <div className="space-y-3">
          {topEmployees?.slice(0, 5).map((emp: any, i: number) => (
            <div key={emp.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">{emp.name?.charAt(0)}</div>
                <div><p className="font-medium text-gray-900">{emp.name}</p><p className="text-xs text-gray-500">{emp.department?.name || "Unassigned"}</p></div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full"><Zap className="w-3.5 h-3.5 text-amber-500" /><span className="text-sm font-bold text-amber-700">{emp.xp} XP</span></div>
            </div>
          ))}
          {(!topEmployees || topEmployees.length === 0) && <p className="text-center text-gray-400 py-6">No employees yet</p>}
        </div>
      </div>
    </div>
  );
}
