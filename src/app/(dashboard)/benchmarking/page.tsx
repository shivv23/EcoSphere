"use client";

import { trpc } from "@/lib/trpc/client";
import { Award, TrendingUp, TrendingDown, Minus, BarChart3, Target, Shield, Leaf, Users, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />
  );
}

const METRIC_KEYS = [
  { key: "carbonIntensity", label: "Carbon Intensity", unit: "tCO2e/emp", icon: Leaf, lowerBetter: true },
  { key: "renewableEnergy", label: "Renewable Energy", unit: "%", icon: Zap, lowerBetter: false },
  { key: "wasteDiversion", label: "Waste Diversion", unit: "%", icon: Leaf, lowerBetter: false },
  { key: "employeeSatisfaction", label: "Employee Satisfaction", unit: "%", icon: Users, lowerBetter: false },
  { key: "trainingHours", label: "Training Hours/Employee", unit: "hrs", icon: Target, lowerBetter: false },
  { key: "genderDiversity", label: "Gender Diversity", unit: "%", icon: Users, lowerBetter: false },
  { key: "policyCompliance", label: "Policy Compliance", unit: "%", icon: Shield, lowerBetter: false },
  { key: "auditScore", label: "Audit Score", unit: "/100", icon: Award, lowerBetter: false },
];

function BenchmarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600">{entry.name}:</span>
          <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BenchmarkingPage() {
  const benchmarks = trpc.benchmark.list.useQuery();
  const companyMetrics = trpc.benchmark.companyMetrics.useQuery();

  const loading = benchmarks.isLoading || companyMetrics.isLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <SkeletonBlock className="h-9 w-72" />
            <SkeletonBlock className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-32" />
            ))}
          </div>
          <SkeletonBlock className="mt-8 h-96" />
        </div>
      </div>
    );
  }

  const benchmarkList = benchmarks.data ?? [];
  const company = companyMetrics.data ?? {};

  const overallScore = METRIC_KEYS.reduce((acc, m) => {
    const bm = benchmarkList.find((b) => b.metric.startsWith(m.label.split(" ")[0]));
    if (!bm || !company[m.key as keyof typeof company]) return acc;
    const val = company[m.key as keyof typeof company] as number;
    const ratio = m.lowerBetter
      ? bm.topValue > 0 ? Math.min(bm.avgValue / Math.max(val, 0.1), 2) : 1
      : bm.topValue > 0 ? Math.min(val / bm.topValue, 1.5) : 0;
    return acc + ratio * 100;
  }, 0) / METRIC_KEYS.length;

  const chartData = METRIC_KEYS.map((m) => {
    const bm = benchmarkList.find((b) => b.metric.startsWith(m.label.split(" ")[0]));
    const companyVal = (company[m.key as keyof typeof company] as number) ?? 0;
    return {
      name: m.label,
      Company: companyVal,
      "Industry Avg": bm?.avgValue ?? 0,
      "Top Performer": bm?.topValue ?? 0,
    };
  });

  const getRank = (score: number) => {
    if (score >= 90) return { label: "Top Performer", color: "text-emerald-600 bg-emerald-50", icon: TrendingUp };
    if (score >= 70) return { label: "Above Average", color: "text-blue-600 bg-blue-50", icon: TrendingUp };
    if (score >= 50) return { label: "Average", color: "text-amber-600 bg-amber-50", icon: Minus };
    return { label: "Below Average", color: "text-red-600 bg-red-50", icon: TrendingDown };
  };

  const rank = getRank(overallScore);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-[fadeInUp_0.5s_ease-out]">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Industry Benchmarking
          </h1>
          <p className="mt-1 text-gray-500">
            Compare your ESG performance against industry averages and top performers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="animate-[fadeInUp_0.5s_ease-out_0s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                {Math.round(overallScore)}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-500">Overall Score</p>
            </div>
          </div>
          <div className="animate-[fadeInUp_0.5s_ease-out_60ms_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${rank.color}`}>
                <rank.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-lg font-bold tracking-tight ${rank.color.split(" ")[0]}`}>
                {rank.label}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-500">Industry Ranking</p>
            </div>
          </div>
          <div className="animate-[fadeInUp_0.5s_ease-out_120ms_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-gray-900">8</p>
              <p className="mt-1 text-sm font-medium text-gray-500">Metrics Tracked</p>
            </div>
          </div>
          <div className="animate-[fadeInUp_0.5s_ease-out_180ms_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-gray-900">2026</p>
              <p className="mt-1 text-sm font-medium text-gray-500">Benchmark Year</p>
            </div>
          </div>
        </div>

        <div className="animate-[fadeInUp_0.6s_ease-out_0.2s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Performance Comparison</h2>
              <p className="text-sm text-gray-500">Company vs Industry Average vs Top Performer</p>
            </div>
          </div>
          <div className="mt-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip content={<BenchmarkTooltip />} />
                <Legend />
                <Bar dataKey="Company" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="Industry Avg" fill="#9ca3af" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="Top Performer" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Metric Details</h2>
              <p className="text-sm text-gray-500">Individual metric breakdown with gap analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRIC_KEYS.map((m, i) => {
              const bm = benchmarkList.find((b) => b.metric.startsWith(m.label.split(" ")[0]));
              const companyVal = (company[m.key as keyof typeof company] as number) ?? 0;
              const avgVal = bm?.avgValue ?? 0;
              const topVal = bm?.topValue ?? 0;
              const diff = m.lowerBetter ? avgVal - companyVal : companyVal - avgVal;
              const diffTop = m.lowerBetter ? topVal - companyVal : companyVal - topVal;
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Your Company</span>
                      <span className="text-sm font-bold text-emerald-600">{companyVal} {m.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Industry Avg</span>
                      <span className="text-sm font-medium text-gray-600">{avgVal} {m.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Top Performer</span>
                      <span className="text-sm font-medium text-blue-600">{topVal} {m.unit}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        {diff >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={`text-xs font-semibold ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {diff >= 0 ? "+" : ""}{Math.round(diff)} vs avg
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {diffTop >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={`text-xs font-semibold ${diffTop >= 0 ? "text-blue-600" : "text-red-600"}`}>
                          {diffTop >= 0 ? "+" : ""}{Math.round(diffTop)} vs top
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
