"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Activity,
  Filter,
  RefreshCw,
  User,
  Building2,
  Leaf,
  Shield,
  Trophy,
  Clock,
  ChevronDown,
  Bell,
  FileText,
  Users,
  Loader2,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────

type FeedItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  userName: string;
  userEmail: string | null;
  createdAt: Date;
  category: "Environmental" | "Social" | "Governance" | "System" | "Gamification";
  source: "audit" | "carbon" | "csr" | "compliance" | "challenge" | "notification";
  link?: string;
};

type FilterOption = "All" | "Environmental" | "Social" | "Governance" | "System";

const ITEMS_PER_PAGE = 20;

// ─── Constants ────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  Environmental: { dot: "bg-emerald-500", border: "border-l-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Social: { dot: "bg-blue-500", border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  Governance: { dot: "bg-violet-500", border: "border-l-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  System: { dot: "bg-gray-400", border: "border-l-gray-400", bg: "bg-gray-50", text: "text-gray-600" },
  Gamification: { dot: "bg-amber-500", border: "border-l-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
};

const ENTITY_CONFIG: Record<string, { icon: typeof Leaf; category: FeedItem["category"]; link?: string }> = {
  User: { icon: Users, category: "System", link: "/settings" },
  Department: { icon: Building2, category: "System", link: "/settings" },
  CSRActivity: { icon: Users, category: "Social", link: "/social/csr" },
  Challenge: { icon: Trophy, category: "Gamification", link: "/gamification/challenges" },
  ComplianceIssue: { icon: Shield, category: "Governance", link: "/governance/compliance" },
  ESGPolicy: { icon: FileText, category: "Governance", link: "/governance/policies" },
  Audit: { icon: Shield, category: "Governance", link: "/audit-trail" },
  AuditLog: { icon: Shield, category: "Governance", link: "/audit-trail" },
  CarbonTransaction: { icon: Leaf, category: "Environmental", link: "/environmental/carbon" },
  Badge: { icon: Trophy, category: "Gamification", link: "/gamification/badges" },
  Reward: { icon: Trophy, category: "Gamification", link: "/gamification/rewards" },
  Goal: { icon: TrendingUp, category: "Environmental", link: "/environmental/goals" },
  Notification: { icon: Bell, category: "System" },
  TimelineEvent: { icon: Clock, category: "System", link: "/timeline" },
  ThresholdConfig: { icon: Shield, category: "Governance" },
  EmissionFactor: { icon: Leaf, category: "Environmental" },
};

const ACTION_MAP: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  APPROVE: "approved",
  REJECT: "rejected",
  JOIN: "joined",
  COMPLETE: "completed",
  SUBMIT: "submitted",
  RESOLVE: "resolved",
  LOGIN: "logged in",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#9ca3af", "#f59e0b"];

const FILTER_OPTIONS: FilterOption[] = ["All", "Environmental", "Social", "Governance", "System"];

// ─── Helpers ──────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(then);
}

function getDateGroup(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (d >= startOfToday) return "Today";
  if (d >= startOfYesterday) return "Yesterday";
  if (d >= startOfWeek) return "This Week";
  return "Earlier";
}

function formatActionVerb(action: string): string {
  return ACTION_MAP[action.toUpperCase()] ?? action.toLowerCase();
}

function getEntityConfig(entity: string) {
  return ENTITY_CONFIG[entity] ?? { icon: Activity, category: "System" as const };
}

function buildFeedItemsFromAudit(logs: any[]): FeedItem[] {
  return logs.map((log) => {
    const cfg = getEntityConfig(log.entity);
    return {
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId ?? null,
      details: log.details ?? null,
      userName: log.user?.name ?? "Unknown",
      userEmail: log.user?.email ?? null,
      createdAt: new Date(log.createdAt),
      category: cfg.category,
      source: "audit",
      link: cfg.link,
    };
  });
}

function buildVirtualItems(
  carbon: any[] | undefined,
  csr: any[] | undefined,
  compliance: any[] | undefined,
  challenges: any[] | undefined,
  users: any[] | undefined
): FeedItem[] {
  const items: FeedItem[] = [];
  const userMap = new Map<string, string>();
  users?.forEach((u) => userMap.set(u.id, u.name));

  carbon?.slice(0, 30).forEach((t) => {
    items.push({
      id: `carbon-${t.id}`,
      action: "CREATE",
      entity: "CarbonTransaction",
      entityId: t.id,
      details: `${t.source} — ${t.totalEmissions} tCO₂e (Scope ${t.scope})`,
      userName: "System",
      userEmail: null,
      createdAt: new Date(t.createdAt ?? t.date),
      category: "Environmental",
      source: "carbon",
      link: "/environmental/carbon",
    });
  });

  csr?.slice(0, 30).forEach((a) => {
    items.push({
      id: `csr-${a.id}`,
      action: "CREATE",
      entity: "CSRActivity",
      entityId: a.id,
      details: a.title,
      userName: a.organizer?.name ?? userMap.get(a.organizerId) ?? "Unknown",
      userEmail: a.organizer?.email ?? null,
      createdAt: new Date(a.createdAt ?? a.date),
      category: "Social",
      source: "csr",
      link: "/social/csr",
    });
  });

  compliance?.slice(0, 20).forEach((c) => {
    items.push({
      id: `compliance-${c.id}`,
      action: c.status === "RESOLVED" ? "RESOLVE" : "CREATE",
      entity: "ComplianceIssue",
      entityId: c.id,
      details: `${c.title} (${c.severity})`,
      userName: c.owner?.name ?? userMap.get(c.ownerId) ?? "Unknown",
      userEmail: c.owner?.email ?? null,
      createdAt: new Date(c.createdAt),
      category: "Governance",
      source: "compliance",
      link: "/governance/compliance",
    });
  });

  challenges?.slice(0, 20).forEach((ch) => {
    items.push({
      id: `challenge-${ch.id}`,
      action: "CREATE",
      entity: "Challenge",
      entityId: ch.id,
      details: ch.title,
      userName: "System",
      userEmail: null,
      createdAt: new Date(ch.createdAt),
      category: "Gamification",
      source: "challenge",
      link: "/gamification/challenges",
    });
  });

  return items;
}

// ─── Components ───────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100", className)} />;
}

function ActivityItem({ item }: { item: FeedItem }) {
  const cfg = CATEGORY_COLORS[item.category];
  const entityCfg = getEntityConfig(item.entity);
  const Icon = entityCfg.icon;
  const verb = formatActionVerb(item.action);

  return (
    <div className="relative flex gap-4 pl-8">
      <div className="absolute left-0 top-5 flex flex-col items-center">
        <div className={cn("h-3 w-3 rounded-full ring-4 ring-white", cfg.dot)} />
      </div>

      <div
        className={cn(
          "flex-1 rounded-xl border border-gray-100 border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md",
          cfg.border
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                cfg.bg
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", cfg.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{item.userName}</span>{" "}
                {verb}{" "}
                <span className="font-medium text-gray-800">{item.entity}</span>
              </p>
              {item.details && (
                <p className="mt-1 text-xs text-gray-500 truncate">{item.details}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                cfg.bg,
                cfg.text
              )}
            >
              {item.category}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {timeAgo(item.createdAt)}
          </span>
          {item.link && (
            <a
              href={item.link}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
            >
              <Eye className="h-3 w-3" />
              View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 pl-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative flex gap-4">
          <div className="absolute left-0 top-5">
            <SkeletonBlock className="h-3 w-3 rounded-full" />
          </div>
          <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-48" />
                <SkeletonBlock className="h-3 w-32" />
              </div>
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3 border-t border-gray-50 pt-2.5">
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-52 w-full rounded-2xl" />
      <SkeletonBlock className="h-48 w-full rounded-2xl" />
      <SkeletonBlock className="h-40 w-full rounded-2xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function ActivityFeedPage() {
  const [filter, setFilter] = useState<FilterOption>("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [filterOpen, setFilterOpen] = useState(false);

  // Primary: audit log
  const { data: auditLogs, isLoading: auditLoading, refetch } = trpc.auditLog.list.useQuery(
    { limit: 100 },
    { refetchInterval: 15000 }
  );

  // Secondary context
  const { data: notifications } = trpc.notification.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();

  // Fallback / enrichment data
  const { data: carbonData } = trpc.carbonTransaction.list.useQuery(undefined, { enabled: !auditLogs || auditLogs.length < 10 });
  const { data: csrData } = trpc.csrActivity.list.useQuery(undefined, { enabled: !auditLogs || auditLogs.length < 10 });
  const { data: complianceData } = trpc.compliance.list.useQuery(undefined, { enabled: !auditLogs || auditLogs.length < 10 });
  const { data: challengeData } = trpc.challenge.list.useQuery(undefined, { enabled: !auditLogs || auditLogs.length < 10 });

  const loading = auditLoading;

  // Build unified feed
  const allItems = useMemo(() => {
    const auditItems = auditLogs ? buildFeedItemsFromAudit(auditLogs) : [];
    const hasEnoughAuditData = auditItems.length >= 10;
    const virtualItems = hasEnoughAuditData
      ? []
      : buildVirtualItems(carbonData, csrData, complianceData, challengeData, users);

    const seen = new Set<string>();
    const merged: FeedItem[] = [];
    for (const item of [...auditItems, ...virtualItems]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }

    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, [auditLogs, carbonData, csrData, complianceData, challengeData, users]);

  // Filter
  const filteredItems = useMemo(() => {
    if (filter === "All") return allItems;
    if (filter === "System") return allItems.filter((i) => i.category === "System" || i.category === "Gamification");
    return allItems.filter((i) => i.category === filter);
  }, [allItems, filter]);

  const displayedItems = filteredItems.slice(0, visibleCount);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, FeedItem[]> = {};
    for (const item of displayedItems) {
      const key = getDateGroup(item.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [displayedItems]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = allItems.filter((i) => new Date(i.createdAt) >= startOfToday).length;
    const activeUserSet = new Set(allItems.map((i) => i.userName).filter((n) => n !== "System" && n !== "Unknown"));
    const lastActivity = allItems.length > 0 ? allItems[0].createdAt : null;
    return {
      total: allItems.length,
      today: todayCount,
      activeUsers: activeUserSet.size,
      lastActivity,
    };
  }, [allItems]);

  // Sidebar: category distribution
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allItems]);

  // Sidebar: top active users
  const topUsers = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allItems) {
      if (item.userName !== "System" && item.userName !== "Unknown") {
        counts[item.userName] = (counts[item.userName] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allItems]);

  // Sidebar: activity trend (last 7 days)
  const activityTrend = useMemo(() => {
    const now = new Date();
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = allItems.filter((item) => {
        const t = new Date(item.createdAt);
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({
        day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d),
        count,
      });
    }
    return days;
  }, [allItems]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-[fadeInUp_0.5s_ease-out]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Activity Feed
            </h1>
            <p className="mt-1 text-gray-500">
              Real-time stream of all ESG activities across your organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">Live</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Filter className="h-4 w-4" />
                {filter}
                <ChevronDown className={cn("h-4 w-4 transition-transform", filterOpen && "rotate-180")} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFilter(opt);
                        setFilterOpen(false);
                        setVisibleCount(ITEMS_PER_PAGE);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50",
                        filter === opt ? "bg-gray-50 text-gray-900" : "text-gray-600"
                      )}
                    >
                      {opt !== "All" && (
                        <span className={cn("h-2 w-2 rounded-full", CATEGORY_COLORS[opt]?.dot ?? "bg-gray-400")} />
                      )}
                      {opt === "All" && <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />}
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          {[
            { label: "Total Activities", value: stats.total, icon: Activity, color: "from-emerald-500 to-teal-500" },
            { label: "Today's Activities", value: stats.today, icon: Clock, color: "from-blue-500 to-indigo-500" },
            { label: "Active Users", value: stats.activeUsers, icon: Users, color: "from-violet-500 to-purple-500" },
            {
              label: "Last Activity",
              value: stats.lastActivity ? timeAgo(stats.lastActivity) : "N/A",
              icon: Bell,
              color: "from-amber-500 to-orange-500",
              isText: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", stat.color)} />
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn("font-bold tracking-tight text-gray-900", stat.isText ? "text-sm" : "text-2xl")}>
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-[fadeInUp_0.6s_ease-out_0.15s_both]">
          {/* Feed Stream */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Feed Stream</h2>
                    <p className="text-sm text-gray-500">{filteredItems.length} activities</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <FeedSkeleton />
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Activity className="mb-3 h-12 w-12 opacity-30" />
                  <p className="text-sm font-medium">No activities found</p>
                  <p className="mt-1 text-xs text-gray-400">Try adjusting your filter</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200" />

                    {Object.entries(grouped).map(([label, items]) => (
                      <div key={label} className="mb-6 last:mb-0">
                        <div className="relative mb-4 flex items-center">
                          <div className="absolute left-0 flex items-center">
                            <div className="h-6 w-6 rounded-full border-2 border-gray-200 bg-white" />
                          </div>
                          <h3 className="ml-10 text-xs font-bold uppercase tracking-wider text-gray-400">
                            {label}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <ActivityItem key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {visibleCount < filteredItems.length && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 hover:border-gray-300"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Load More ({filteredItems.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {loading ? (
              <SummarySkeleton />
            ) : (
              <>
                {/* Category Distribution */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-gray-900">Activity Distribution</h3>
                  {categoryDistribution.length === 0 ? (
                    <div className="flex h-40 items-center justify-center text-gray-400">
                      <p className="text-xs">No data</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryDistribution.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload as { name: string; value: number };
                              return (
                                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                                  <p className="text-xs font-semibold text-gray-900">{d.name}</p>
                                  <p className="text-xs text-gray-500">{d.value} activities</p>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-2 flex flex-wrap justify-center gap-3">
                        {categoryDistribution.map((entry, i) => (
                          <div key={entry.name} className="flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            <span className="text-[11px] font-medium text-gray-600">{entry.name}</span>
                            <span className="text-[11px] text-gray-400">({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Active Users */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-gray-900">Most Active Users</h3>
                  {topUsers.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-gray-400">
                      <p className="text-xs">No user activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topUsers.map((u, i) => {
                        const maxCount = topUsers[0]?.count ?? 1;
                        return (
                          <div key={u.name} className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                                i === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                  : i === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                  : i === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-500"
                                  : "bg-gray-200 text-gray-600"
                              )}
                            >
                              {i + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-xs font-semibold text-gray-900">{u.name}</p>
                                <span className="ml-2 flex-shrink-0 text-[11px] font-bold text-gray-500">
                                  {u.count}
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                                  style={{ width: `${(u.count / maxCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Activity Trend */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-gray-900">7-Day Trend</h3>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                                <p className="text-xs font-semibold text-gray-900">{label}</p>
                                <p className="text-xs text-gray-500">{payload[0].value} activities</p>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Click-away for filter dropdown */}
        {filterOpen && (
          <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
