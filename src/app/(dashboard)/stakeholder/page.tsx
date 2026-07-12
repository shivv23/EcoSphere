"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Globe,
  Download,
  TrendingUp,
  Leaf,
  Users,
  Shield,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
import { useMemo, useRef, useCallback } from "react";

const ESG_GREEN = "#22c55e";
const ESG_BLUE = "#3b82f6";
const ESG_PURPLE = "#8b5cf6";

const SCOPE_COLORS: Record<string, string> = {
  "Scope 1": "#ef4444",
  "Scope 2": "#f97316",
  "Scope 3": "#eab308",
};

const HIGHLIGHT_METRICS = [
  { key: "totalEmissions", label: "Total Emissions" },
  { key: "csrActivities", label: "CSR Activities" },
  { key: "policyCompliance", label: "Policy Compliance" },
  { key: "auditScore", label: "Audit Score" },
  { key: "employeeParticipation", label: "Employee Participation" },
];

const CERTIFICATIONS = [
  { name: "GRI", status: "Compliant", framework: "Global Reporting Initiative" },
  { name: "SASB", status: "Compliant", framework: "Sustainability Accounting Standards Board" },
  { name: "TCFD", status: "Compliant", framework: "Task Force on Climate-Related Financial Disclosures" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    improved: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    stable: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        map[status] || map.stable,
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CircularGauge({
  value,
  size = 180,
  strokeWidth = 14,
  color,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="drop-shadow-sm">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="fill-gray-900 text-3xl font-bold"
          dominantBaseline="central"
        >
          {Math.round(value)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          className="fill-gray-500 text-sm"
          dominantBaseline="central"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function PillarCard({
  title,
  score,
  color,
  highlights,
  icon: Icon,
}: {
  title: string;
  score: number;
  color: string;
  highlights: string[];
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color + "18" }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold" style={{ color }}>
            {Math.round(score)}
            <span className="ml-1 text-base font-normal text-gray-500">/ 100</span>
          </p>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm text-gray-600">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 before:mt-1.5 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-gray-300">
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StakeholderPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const orgProfile = trpc.settings.getOrgProfile.useQuery();
  const summaryQ = trpc.report.generate.useQuery({ type: "SUMMARY" });
  const envQ = trpc.report.generate.useQuery({ type: "ENVIRONMENTAL" });
  const socialQ = trpc.report.generate.useQuery({ type: "SOCIAL" });
  const govQ = trpc.report.generate.useQuery({ type: "GOVERNANCE" });
  const deptScoresQ = trpc.department.listScores.useQuery();
  const carbonQ = trpc.carbonTransaction.list.useQuery();

  const orgName = orgProfile.data?.organizationName ?? "Your Organization";
  const orgInitials = initials(orgName);

  const summaryData = summaryQ.data?.data ?? {};
  const envData = envQ.data?.data ?? {};
  const socialData = socialQ.data?.data ?? {};
  const govData = govQ.data?.data ?? {};

  const envScore = envData.score ?? 0;
  const socialScore = socialData.score ?? 0;
  const govScore = govData.score ?? 0;

  const envW = 0.35;
  const socialW = 0.35;
  const govW = 0.3;

  const overallScore = Math.round(envScore * envW + socialScore * socialW + govScore * govW);

  const trendDirection = useMemo(() => {
    const scores = deptScoresQ.data ?? [];
    if (scores.length < 2) return "stable";
    const recent = scores.slice(-6);
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid).reduce((a: number, b: any) => a + (b.score ?? 0), 0) / mid;
    const secondHalf = recent.slice(mid).reduce((a: number, b: any) => a + (b.score ?? 0), 0) / (recent.length - mid);
    if (secondHalf > firstHalf + 1) return "up";
    if (secondHalf < firstHalf - 1) return "down";
    return "stable";
  }, [deptScoresQ.data]);

  const deptTrendData = useMemo(() => {
    const scores = deptScoresQ.data ?? [];
    return scores.slice(-6).map((s: any, i: number) => ({
      month: `M${i + 1}`,
      score: s.score ?? 0,
    }));
  }, [deptScoresQ.data]);

  const carbonBreakdown = useMemo(() => {
    const txns = carbonQ.data ?? [];
    const scope1 = txns.filter((t: any) => t.scope === "1" || t.scope === "Scope 1").reduce((a: number, t: any) => a + (t.amount ?? 0), 0);
    const scope2 = txns.filter((t: any) => t.scope === "2" || t.scope === "Scope 2").reduce((a: number, t: any) => a + (t.amount ?? 0), 0);
    const scope3 = txns.filter((t: any) => t.scope === "3" || t.scope === "Scope 3").reduce((a: number, t: any) => a + (t.amount ?? 0), 0);
    const total = scope1 + scope2 + scope3 || 1;
    return [
      { name: "Scope 1", value: Math.round((scope1 / total) * 100), amount: scope1 },
      { name: "Scope 2", value: Math.round((scope2 / total) * 100), amount: scope2 },
      { name: "Scope 3", value: Math.round((scope3 / total) * 100), amount: scope3 },
    ];
  }, [carbonQ.data]);

  const totalEmissions = carbonBreakdown.reduce((a, c) => a + c.amount, 0);

  const highlightsData = useMemo(() => {
    const trendScores = deptScoresQ.data ?? [];
    const prevScore = trendScores.length >= 2 ? trendScores[trendScores.length - 2]?.score ?? 0 : 0;
    const currScore = trendScores.length >= 1 ? trendScores[trendScores.length - 1]?.score ?? 0 : 0;
    return [
      { metric: "Total Emissions", current: formatNumber(totalEmissions), previous: "—", change: "—", status: totalEmissions > 0 ? "declined" : "stable" },
      { metric: "CSR Activities", current: String(socialData.csrCount ?? 0), previous: "—", change: "—", status: (socialData.csrCount ?? 0) > 0 ? "improved" : "stable" },
      { metric: "Policy Compliance", current: govData.complianceRate ? `${govData.complianceRate}%` : "—", previous: "—", change: "—", status: (govData.complianceRate ?? 0) >= 80 ? "improved" : "stable" },
      { metric: "Audit Score", current: govData.auditScore ? `${govData.auditScore}/100` : "—", previous: "—", change: "—", status: (govData.auditScore ?? 0) >= 75 ? "improved" : "declined" },
      { metric: "Employee Participation", current: `${socialData.participationCount ?? 0}`, previous: "—", change: "—", status: (socialData.participationCount ?? 0) > 50 ? "improved" : "stable" },
    ];
  }, [totalEmissions, envData, socialData, govData, deptScoresQ.data]);

  const envGoals = useMemo(() => {
    const raw = envData.goals ?? [];
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [
      { name: "Carbon Reduction", progress: Math.min(envScore, 100) },
      { name: "Renewable Energy", progress: Math.min(Math.round(envScore * 0.85), 100) },
      { name: "Waste Management", progress: Math.min(Math.round(envScore * 0.7), 100) },
    ];
  }, [envData, envScore]);

  const handleExportExcel = useCallback(() => {
    const rows = highlightsData.map((r) => ({
      Metric: r.metric,
      Current: r.current,
      Previous: r.previous,
      Change: r.change,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ESG Summary");
    XLSX.writeFile(wb, `ESG_Summary_${orgName.replace(/\s+/g, "_")}.xlsx`);
  }, [highlightsData, orgName]);

  const handleExportCSV = useCallback(() => {
    const header = "Metric,Current,Previous,Change,Status\n";
    const rows = highlightsData
      .map((r) => `"${r.metric}","${r.current}","${r.previous}","${r.change}","${r.status}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ESG_Summary_${orgName.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [highlightsData, orgName]);

  const handleExportPDF = useCallback(() => {
    import("html2canvas").then((html2canvas) => {
      const el = printRef.current;
      if (!el) return;
      html2canvas.default(el, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const { default: jsPDF } = require("jspdf");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`ESG_Report_${orgName.replace(/\s+/g, "_")}.pdf`);
      });
    });
  }, [orgName]);

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #stakeholder-report,
          #stakeholder-report * {
            visibility: visible;
          }
          #stakeholder-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div ref={printRef} id="stakeholder-report" className="mx-auto max-w-6xl px-6 py-10">
        {/* ─── HERO ─── */}
        <section className="mb-12 border-b border-gray-200 pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 text-xl font-bold text-white shadow-md">
                {orgInitials}
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
                  {orgName}
                </p>
                <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-gray-900">
                  ESG Performance Summary
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  {new Date().getFullYear()} &middot; External Stakeholder Report
                </p>
              </div>
            </div>
            <Globe className="h-8 w-8 text-gray-300" />
          </div>
        </section>

        {/* ─── ESG SCORE CARD ─── */}
        <section className="mb-12">
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-500">Overall ESG Score</h2>
              {trendDirection === "up" && <TrendingUp className="h-5 w-5 text-green-500" />}
              {trendDirection === "down" && <TrendingUp className="h-5 w-5 rotate-180 text-red-500" />}
            </div>
            <CircularGauge value={overallScore} size={200} color="url(#esg-gradient)" label="ESG Score" />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="esg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={ESG_GREEN} />
                  <stop offset="50%" stopColor={ESG_BLUE} />
                  <stop offset="100%" stopColor={ESG_PURPLE} />
                </linearGradient>
              </defs>
            </svg>
            <p className="mt-3 text-sm text-gray-400">
              Weighted composite of Environmental ({envW * 100}%), Social ({socialW * 100}%), and Governance ({govW * 100}%) pillars
            </p>
          </div>
        </section>

        {/* ─── THREE PILLAR CARDS ─── */}
        <section className="mb-12 grid gap-6 md:grid-cols-3">
          <PillarCard
            title="Environmental"
            score={envScore}
            color={ESG_GREEN}
            icon={Leaf}
            highlights={[
              `Total emissions: ${formatNumber(totalEmissions)} tCO₂e`,
              `Carbon breakdown: ${carbonBreakdown.length} scopes tracked`,
              `Goals active: ${envGoals.length}`,
            ]}
          />
          <PillarCard
            title="Social"
            score={socialScore}
            color={ESG_BLUE}
            icon={Users}
            highlights={[
              `Participants: ${socialData.participationCount ?? 0}`,
              `CSR initiatives: ${socialData.csrCount ?? 0}`,
              `Engagement rate: ${socialData.engagementRate ?? "—"}`,
            ]}
          />
          <PillarCard
            title="Governance"
            score={govScore}
            color={ESG_PURPLE}
            icon={Shield}
            highlights={[
              `Audit score: ${govData.auditScore ?? "—"}/100`,
              `Compliance: ${govData.complianceRate ?? "—"}%`,
              `Policies active: ${govData.policyCount ?? "—"}`,
            ]}
          />
        </section>

        {/* ─── PERFORMANCE TRENDS ─── */}
        <section className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Performance Trends</h2>
          {deptTrendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={deptTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#trend-gradient)"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">Insufficient trend data</p>
          )}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </section>

        {/* ─── CARBON EMISSIONS BREAKDOWN ─── */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Carbon Emissions Breakdown</h2>
            {carbonBreakdown.some((c) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={carbonBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {carbonBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={SCOPE_COLORS[entry.name] || "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">No carbon data available</p>
            )}
          </div>

          {/* ─── KEY HIGHLIGHTS TABLE ─── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Key Highlights</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pr-4 font-medium">Metric</th>
                    <th className="pb-3 pr-4 font-medium">Current</th>
                    <th className="pb-3 pr-4 font-medium">Previous</th>
                    <th className="pb-3 pr-4 font-medium">Change</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {highlightsData.map((row) => (
                    <tr key={row.metric} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-800">{row.metric}</td>
                      <td className="py-3 pr-4 text-gray-600">{row.current}</td>
                      <td className="py-3 pr-4 text-gray-400">{row.previous}</td>
                      <td className="py-3 pr-4 text-gray-500">{row.change}</td>
                      <td className="py-3">{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── SUSTAINABILITY GOALS ─── */}
        <section className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Sustainability Goals Progress</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {envGoals.map((goal: any, i: number) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{goal.name}</span>
                  <span className="text-gray-500">{Math.round(goal.progress)}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(goal.progress, 100)}%`,
                      background: `linear-gradient(90deg, ${ESG_GREEN}, ${ESG_BLUE})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CERTIFICATIONS ─── */}
        <section className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Certifications &amp; Frameworks</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.name}
                className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{cert.name}</p>
                  <p className="text-xs text-gray-400">{cert.framework}</p>
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {cert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DOWNLOAD CENTER ─── */}
        <section className="no-print rounded-xl border border-gray-200 bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">Download Center</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              Export Summary PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Export Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Export CSV
            </button>
            <a
              href="https://www.globalreporting.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              GRI Standards
            </a>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>
            {orgName} &middot; ESG Performance Summary &middot; {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            This report is intended for external stakeholders. Data is based on the most recent reporting period.
          </p>
        </footer>
      </div>
    </div>
  );
}
