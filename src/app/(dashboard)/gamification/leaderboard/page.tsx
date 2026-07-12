"use client";

import { trpc } from "@/lib/trpc/client";
import { Zap } from "lucide-react";

const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

export default function LeaderboardPage() {
  const { data: employees, isLoading } = trpc.user.xp.useQuery(undefined, { refetchInterval: 30000 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Employee rankings by XP earned</p>
      </div>

      {employees && employees.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {[employees[1], employees[0], employees[2]].map((emp: any, i: number) => {
            const heights = ["h-28", "h-36", "h-24"];
            const order = [2, 1, 3];
            return (
              <div key={emp.id || i} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-lg font-bold mb-2 shadow-lg ring-4 ring-white">
                  {emp.name?.charAt(0)}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">{emp.xp} XP</span>
                </div>
                <div className={`w-24 ${heights[i]} rounded-t-xl bg-gradient-to-b from-amber-400 to-yellow-500 flex items-start justify-center pt-2`}>
                  <span className="text-2xl">{medals[i]}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">#{order[i]}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rank</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : employees?.map((emp: any, i: number) => (
                  <tr key={emp.id || i} className={`hover:bg-gray-50/50 transition-colors ${i < 3 ? "bg-amber-50/30" : ""}`}>
                    <td className="px-6 py-3">
                      <span
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {i < 3 ? medals[i] : i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                          {emp.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{emp.department?.name || "Unassigned"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="text-sm font-bold text-amber-700">{emp.xp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
