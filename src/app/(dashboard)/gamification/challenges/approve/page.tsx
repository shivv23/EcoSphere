"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { CheckCircle, XCircle, Trophy, Users, Loader2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function ChallengeApprovePage() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const utils = trpc.useUtils();
  const { data: participations, isLoading } = trpc.challenge.participations.useQuery({});

  const approveMutation = trpc.challenge.approve.useMutation({
    onSuccess: () => { toast.success("Participation updated"); utils.challenge.participations.invalidate(); utils.challenge.stats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const filtered = participations?.filter((p: any) => statusFilter === "ALL" || p.status === statusFilter) || [];
  const statusColors: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Challenge Approvals</h1><p className="text-gray-500 mt-1">Review and approve challenge participations</p></div>
      </div>

      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/3" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" /></div>
            </div>
          </div>
        )) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No participations found</p>
          </div>
        ) : filtered.map((p: any) => (
          <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Users className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{p.employee?.name || "Unknown"}</h3>
                  <p className="text-sm text-gray-500">{p.challenge?.title || "Unknown challenge"}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(p.createdAt)}</span>
                    {p.challenge?.xpReward && <span className="text-amber-600 font-medium">{p.challenge.xpReward} XP</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || ""}`}>{p.status}</span>
                {p.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => approveMutation.mutate({ id: p.id, status: "APPROVED", xpAwarded: p.challenge?.xpReward || 100 })} disabled={approveMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
                      {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Approve
                    </button>
                    <button onClick={() => approveMutation.mutate({ id: p.id, status: "REJECTED" })} disabled={approveMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                      {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
