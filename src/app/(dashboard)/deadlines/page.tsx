"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Clock, AlertTriangle, CheckCircle, Bell, Calendar,
  Filter, ArrowUpRight, Shield, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeadlineItem = {
  id: string;
  title: string;
  dueDate: Date | string | null;
  type: "Compliance Issue" | "Audit" | "Policy";
  severity: string;
  status: string;
  owner?: string;
};

function daysUntil(date: Date | string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number): string {
  if (days < 0) return "bg-red-500";
  if (days <= 7) return "bg-orange-500";
  if (days <= 30) return "bg-amber-400";
  return "bg-emerald-500";
}

function urgencyBg(days: number): string {
  if (days < 0) return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  if (days <= 7) return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
  if (days <= 30) return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
}

function urgencyLabel(days: number): string {
  if (days < 0) return `Overdue by ${Math.abs(days)} day(s)`;
  if (days === 0) return "Due today";
  return `Due in ${days} day(s)`;
}

function severityBadge(sev: string) {
  const s = sev?.toUpperCase();
  if (s === "CRITICAL") return "bg-red-100 text-red-700 border-red-200";
  if (s === "HIGH") return "bg-orange-100 text-orange-700 border-orange-200";
  if (s === "MEDIUM") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function typeIcon(type: string) {
  if (type === "Compliance Issue") return <Shield className="w-4 h-4" />;
  if (type === "Audit") return <CheckCircle className="w-4 h-4" />;
  return <Bell className="w-4 h-4" />;
}

export default function DeadlinesPage() {
  const [filter, setFilter] = useState<"ALL" | "OVERDUE" | "THIS_WEEK" | "THIS_MONTH">("ALL");
  const utils = trpc.useUtils();

  const { data: complianceIssues, isLoading: loadingCompliance } = trpc.compliance.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();
  const { data: policies } = trpc.policy.list.useQuery();
  const { data: notifications } = trpc.notification.list.useQuery();

  const createReminder = trpc.notification.create.useMutation({
    onSuccess: () => { utils.notification.list.invalidate(); },
  });

  const markResolved = trpc.compliance.update.useMutation({
    onSuccess: () => { utils.compliance.list.invalidate(); },
  });

  const allItems: DeadlineItem[] = useMemo(() => {
    const items: DeadlineItem[] = [];

    (complianceIssues || []).forEach((c: any) => {
      if (c.dueDate && c.status !== "RESOLVED") {
        items.push({
          id: c.id, title: c.title, dueDate: c.dueDate,
          type: "Compliance Issue", severity: c.severity || "MEDIUM",
          status: c.status, owner: c.owner?.name,
        });
      }
    });

    (audits || []).forEach((a: any) => {
      if (a.dueDate || a.auditDate) {
        items.push({
          id: a.id, title: `Audit: ${a.title || a.type || "Scheduled Audit"}`,
          dueDate: a.dueDate || a.auditDate,
          type: "Audit", severity: "MEDIUM",
          status: a.status || "SCHEDULED",
        });
      }
    });

    (policies || []).forEach((p: any) => {
      if (p.reviewDate) {
        items.push({
          id: p.id, title: `Review: ${p.title}`,
          dueDate: p.reviewDate,
          type: "Policy", severity: "LOW",
          status: "ACTIVE",
        });
      }
    });

    return items.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [complianceIssues, audits, policies]);

  // Auto-create reminders for items due within 3 days
  useEffect(() => {
    if (!allItems.length || !notifications) return;
    const existingTitles = new Set((notifications as any[]).map((n: any) => n.title));
    allItems.forEach((item) => {
      if (!item.dueDate) return;
      const days = daysUntil(item.dueDate);
      if (days >= 0 && days <= 3) {
        const reminderTitle = `Deadline Approaching: ${item.title}`;
        if (!existingTitles.has(reminderTitle)) {
          createReminder.mutate({
            title: reminderTitle,
            message: `Due in ${days} day(s) — ${item.type}`,
            type: "POLICY_REMINDER",
            link: "/governance/compliance",
          });
        }
      }
    });
  }, [allItems, notifications]);

  const filteredItems = useMemo(() => {
    const now = new Date();
    if (filter === "OVERDUE") return allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) < 0);
    if (filter === "THIS_WEEK") return allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) >= 0 && daysUntil(i.dueDate) <= 7);
    if (filter === "THIS_MONTH") return allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) > 7 && daysUntil(i.dueDate) <= 30);
    return allItems;
  }, [allItems, filter]);

  const overdueCount = allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) < 0).length;
  const thisWeekCount = allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) >= 0 && daysUntil(i.dueDate) <= 7).length;
  const thisMonthCount = allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) > 7 && daysUntil(i.dueDate) <= 30).length;
  const onTrackCount = allItems.filter((i) => i.dueDate && daysUntil(i.dueDate) > 30).length;

  const isLoading = loadingCompliance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Deadline Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track deadlines, auto-reminders, and compliance urgency</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overdue", count: overdueCount, color: "from-red-500 to-rose-600", textColor: "text-red-600", pulse: overdueCount > 0 },
          { label: "Due This Week", count: thisWeekCount, color: "from-orange-500 to-amber-600", textColor: "text-orange-600", pulse: false },
          { label: "Due This Month", count: thisMonthCount, color: "from-amber-400 to-yellow-500", textColor: "text-amber-600", pulse: false },
          { label: "On Track", count: onTrackCount, color: "from-emerald-500 to-green-600", textColor: "text-emerald-600", pulse: false },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <p className={cn("text-3xl font-bold", card.textColor)}>{card.count}</p>
              {card.pulse && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Show:</span>
        {(["ALL", "OVERDUE", "THIS_WEEK", "THIS_MONTH"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              filter === f ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {f === "ALL" ? "All" : f === "OVERDUE" ? "Overdue" : f === "THIS_WEEK" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Urgency Timeline</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredItems.length === 0 && (
                <p className="text-center text-gray-400 py-8">No deadlines match this filter</p>
              )}
              {filteredItems.map((item, idx) => {
                const days = item.dueDate ? daysUntil(item.dueDate) : null;
                if (days === null) return null;
                return (
                  <div key={item.id} className={cn("flex gap-4 p-4 rounded-xl border transition-all", urgencyBg(days))}>
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className={cn("w-3 h-3 rounded-full", urgencyColor(days), days < 0 && "animate-pulse")} />
                      {idx < filteredItems.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border", severityBadge(item.severity))}>
                              {item.severity}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.type}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("text-sm font-bold", days < 0 ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-gray-700 dark:text-gray-300")}>
                            {urgencyLabel(days)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deadline Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">All Deadlines</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredItems.map((item) => {
                    const days = item.dueDate ? daysUntil(item.dueDate) : null;
                    if (days === null) return null;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {typeIcon(item.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{item.title}</p>
                              <p className="text-[11px] text-gray-400">{item.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm font-bold", days < 0 ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-gray-600 dark:text-gray-300")}>
                            {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold border", severityBadge(item.severity))}>
                            {item.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
