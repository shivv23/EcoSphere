"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Users, Award, TrendingUp, Filter, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ParticipationPage() {
  const { data: participations, isLoading } = trpc.csrActivity.participations.useQuery({});
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = participations?.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  }) || [];

  const totalCount = participations?.length || 0;
  const totalPoints = participations?.reduce((sum, p) => sum + (p.pointsEarned || 0), 0) || 0;
  const completedCount = participations?.filter((p) => p.status === "APPROVED").length || 0;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const kpis = [
    { label: "Total Participants", value: totalCount, icon: Users, color: "from-blue-500 to-indigo-600" },
    { label: "Points Earned", value: totalPoints, icon: Award, color: "from-amber-500 to-orange-600" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "from-emerald-500 to-green-600" },
  ];

  const statusBadge = (status: string) => {
    if (status === "APPROVED") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"><CheckCircle className="w-3 h-3" />Approved</span>;
    if (status === "REJECTED") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"><XCircle className="w-3 h-3" />Rejected</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"><Clock className="w-3 h-3" />Pending</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Participation</h1>
        <p className="text-gray-500 mt-1">Track employee involvement in CSR activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm card-hover animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Participations</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Participations</h3>
            <p className="text-gray-500">Participation records will appear here as employees join CSR activities.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {p.employee?.name?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{p.employee?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{p.activity?.title || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.activity?.department?.name || "—"}</td>
                    <td className="px-5 py-3.5">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{p.pointsEarned || 0}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
