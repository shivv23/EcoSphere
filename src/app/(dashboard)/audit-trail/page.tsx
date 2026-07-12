"use client";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { History, Filter, User, FileText, Settings, Shield, Leaf, Trophy } from "lucide-react";

const ENTITY_ICONS: Record<string, any> = {
  User: User, Department: Settings, CSRActivity: Leaf, Challenge: Trophy,
  ComplianceIssue: Shield, ESGPolicy: FileText, Audit: FileText,
  CarbonTransaction: Leaf, Badge: Trophy, Reward: Trophy,
};
const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  APPROVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function AuditTrailPage() {
  const [entityFilter, setEntityFilter] = useState<string>("");
  const { data: logs, isLoading } = trpc.auditLog.list.useQuery({ entity: entityFilter || undefined, limit: 100 });
  const entities = ["", "User", "Department", "CSRActivity", "Challenge", "ComplianceIssue", "ESGPolicy", "Audit", "CarbonTransaction", "Badge", "Reward", "Notification"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track all system activities and changes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <History className="w-4 h-4" />
          <span>{logs?.length || 0} entries</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {entities.map((e) => (
          <button key={e} onClick={() => setEntityFilter(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${entityFilter === e ? "bg-emerald-500 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            {e || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{Array.from({length:8}).map((_,i)=><div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"/>)}</div>
        ) : logs?.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit logs yet. Activities will appear here as they happen.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {logs?.map((log) => {
              const Icon = ENTITY_ICONS[log.entity] || FileText;
              return (
                <div key={log.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{log.user.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {log.action}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{log.entity}</span>
                    </div>
                    {log.details && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <time className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</time>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
