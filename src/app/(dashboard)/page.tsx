"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Activity,
  Users,
  Building2,
  Leaf,
  AlertTriangle,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Zap,
  Shield,
  Target,
  BadgeCheck,
  Trophy,
  ChevronRight,
  CircleDot,
  Minus,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,

  type LegendProps,
} from "recharts";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  CRITICAL: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "text-red-500",
  },
  HIGH: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "text-orange-500",
  },
  MEDIUM: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "text-amber-500",
  },
  LOW: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "text-emerald-500",
  },
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />
  );
}

function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <SkeletonBlock className="h-12 w-12 rounded-xl" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonBlock className="h-8 w-24" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  gradient,
  iconBg,
  delay,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendLabel?: string;
  gradient: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function CarbonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600">{entry.name}:</span>
          <span className="text-sm font-semibold text-gray-900">
            {Number(entry.value).toLocaleString()} tCO₂e
          </span>
        </div>
      ))}
    </div>
  );
}

function DeptTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600 capitalize">{entry.name}:</span>
          <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace("_", " ")}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <CircleDot className="h-3 w-3" />
      {severity}
    </span>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function rankColor(i: number) {
  if (i === 0) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200";
  if (i === 1) return "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200";
  if (i === 2) return "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200";
  return "bg-gray-100 text-gray-600";
}

export default function DashboardPage() {
  const overview = trpc.dashboard.overview.useQuery();
  const carbonTrend = trpc.dashboard.carbonTrend.useQuery();
  const deptScores = trpc.dashboard.departmentScores.useQuery();

  const loading = overview.isLoading || carbonTrend.isLoading || deptScores.isLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <SkeletonBlock className="h-9 w-72" />
            <SkeletonBlock className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonBlock className="h-96" />
            <SkeletonBlock className="h-96" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SkeletonBlock className="h-80" />
            <SkeletonBlock className="h-80" />
            <SkeletonBlock className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  const d = overview.data;
  const carbon = carbonTrend.data ?? [];
  const departments = deptScores.data ?? [];

  const esgScore = departments.length
    ? Math.round(departments.reduce((s, d) => s + d.score, 0) / departments.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            ESG Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Real-time overview of your environmental, social, and governance performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            icon={Flame}
            label="Total Carbon Emissions"
            value={`${((d?.totalCarbonEmissions ?? 0) / 1000).toFixed(1)}k`}
            trend="down"
            trendLabel="12%"
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-400"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={0}
          />
          <KPICard
            icon={Users}
            label="Active Employees"
            value={d?.totalUsers ?? 0}
            trend="up"
            trendLabel="8%"
            gradient="bg-gradient-to-r from-blue-500 to-blue-400"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={60}
          />
          <KPICard
            icon={Activity}
            label="CSR Activities"
            value={d?.totalCSR ?? 0}
            trend="up"
            trendLabel="23%"
            gradient="bg-gradient-to-r from-violet-500 to-violet-400"
            iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
            delay={120}
          />
          <KPICard
            icon={Target}
            label="Open Challenges"
            value={d?.totalChallenges ?? 0}
            gradient="bg-gradient-to-r from-amber-500 to-amber-400"
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
            delay={180}
          />
          <KPICard
            icon={AlertTriangle}
            label="Compliance Issues"
            value={d?.openIssues ?? 0}
            trend="down"
            trendLabel="5%"
            gradient="bg-gradient-to-r from-red-500 to-red-400"
            iconBg="bg-gradient-to-br from-red-500 to-red-600"
            delay={240}
          />
          <KPICard
            icon={Award}
            label="Average ESG Score"
            value={esgScore}
            trend="up"
            trendLabel="3pts"
            gradient="bg-gradient-to-r from-teal-500 to-teal-400"
            iconBg="bg-gradient-to-br from-teal-500 to-teal-600"
            delay={300}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="animate-[fadeInUp_0.6s_ease-out_0.1s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Carbon Emission Trends"
              subtitle="Monthly Scope 1, 2 & 3 emissions over time"
              icon={BarChart3}
            />
            <div className="mt-6 h-80">
              {carbon.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Flame className="mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">No carbon data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={carbon} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradScope1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradScope2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradScope3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CarbonTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="scope1"
                      name="Scope 1"
                      stackId="1"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#gradScope1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="scope2"
                      name="Scope 2"
                      stackId="1"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#gradScope2)"
                    />
                    <Area
                      type="monotone"
                      dataKey="scope3"
                      name="Scope 3"
                      stackId="1"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#gradScope3)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="animate-[fadeInUp_0.6s_ease-out_0.2s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Department ESG Scores"
              subtitle="Environmental, Social & Governance ratings by department"
              icon={Building2}
            />
            <div className="mt-6 h-80">
              {departments.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Building2 className="mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">No department data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departments} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<DeptTooltip />} />
                    <Legend />
                    <Bar dataKey="env" name="Environment" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="social" name="Social" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gov" name="Governance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <SectionHeader
              title="Recent CSR Activities"
              subtitle="Latest community and sustainability initiatives"
              icon={Activity}
            />
            <div className="mt-6">
              {!d?.recentActivities?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">No recent activities</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Activity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {d.recentActivities.slice(0, 5).map((a) => (
                        <tr
                          key={a.id}
                          className="transition-colors hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {a.title}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                              <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              {a.department.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {a.category.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(a.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="animate-[fadeInUp_0.6s_ease-out_0.35s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Top Employees"
              subtitle="Highest XP contributors this quarter"
              icon={Trophy}
            />
            <div className="mt-6">
              {!d?.topEmployees?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Trophy className="mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">No employee data</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {d.topEmployees.slice(0, 5).map((emp, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankColor(i)}`}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {emp.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {emp.department?.name ?? "Unassigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-1.5">
                        <Zap className="h-3.5 w-3.5 text-violet-500" />
                        <span className="text-xs font-bold text-violet-700">
                          {emp.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Recent Compliance Issues"
              subtitle="Issues requiring attention across the organization"
              icon={Shield}
            />
            <div className="mt-6">
              {!d?.recentCompliance?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Shield className="mb-3 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">No compliance issues found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {d.recentCompliance.map((issue) => {
                    const sv = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.MEDIUM;
                    return (
                      <div
                        key={issue.id}
                        className={`group rounded-xl border ${sv.border} ${sv.bg} p-5 transition-all duration-200 hover:shadow-md`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${sv.icon}`} />
                            <SeverityBadge severity={issue.severity} />
                          </div>
                          <StatusBadge status={issue.status} />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-gray-900">
                          {issue.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-200/60 pt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {issue.owner.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(issue.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
}
