"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import * as XLSX from "xlsx";
import {
  FileText, Download, CheckCircle, AlertCircle, BookOpen,
  BarChart3, Loader2, ArrowRight, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type FrameworkId = "GRI" | "SASB" | "TCFD";

const frameworks: Record<FrameworkId, {
  name: string; full: string; color: string; gradient: string;
  metrics: { code: string; title: string; description: string; mappedTo: string }[];
}> = {
  GRI: {
    name: "GRI", full: "Global Reporting Initiative Standards", color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    metrics: [
      { code: "GRI 302", title: "Energy", description: "Energy consumption within the organization", mappedTo: "carbonTransactions" },
      { code: "GRI 305", title: "Emissions", description: "Direct and indirect GHG emissions (Scope 1, 2, 3)", mappedTo: "carbonTransactions" },
      { code: "GRI 306", title: "Waste", description: "Waste generated and its disposal", mappedTo: "carbonTransactions" },
      { code: "GRI 401", title: "Employment", description: "New employee hires and employee turnover", mappedTo: "departments" },
      { code: "GRI 403", title: "Occupational Health & Safety", description: "Work-related injuries and hazard identification", mappedTo: "compliance" },
      { code: "GRI 404", title: "Training & Education", description: "Average hours of training per year", mappedTo: "participation" },
      { code: "GRI 205", title: "Anti-corruption", description: "Anti-corruption policies and training", mappedTo: "policies" },
    ],
  },
  SASB: {
    name: "SASB", full: "Sustainability Accounting Standards Board", color: "#3b82f6",
    gradient: "from-blue-500 to-indigo-600",
    metrics: [
      { code: "EC-000.1", title: "Energy Management", description: "Activity associated with energy consumption", mappedTo: "carbonTransactions" },
      { code: "EC-000.4", title: "GHG Emissions", description: "GHG emissions and emission reduction targets", mappedTo: "carbonTransactions" },
      { code: "TC-000.1", title: "Data Security", description: "Data security policies and breaches", mappedTo: "policies" },
      { code: "TC-000.2", title: "Environmental Footprint", description: "Environmental impacts of facilities", mappedTo: "carbonTransactions" },
      { code: "HR-000.1", title: "Employee Health & Safety", description: "Workplace safety management", mappedTo: "compliance" },
      { code: "HR-000.2", title: "Labor Relations", description: "Labor relations policies and practices", mappedTo: "policies" },
    ],
  },
  TCFD: {
    name: "TCFD", full: "Task Force on Climate-related Financial Disclosures", color: "#8b5cf6",
    gradient: "from-purple-500 to-violet-600",
    metrics: [
      { code: "Strategy", title: "Climate Risks & Opportunities", description: "Board oversight and strategic planning for climate", mappedTo: "carbonTransactions" },
      { code: "Risk Mgmt", title: "Climate Risk Assessment", description: "Process for identifying and assessing climate risks", mappedTo: "compliance" },
      { code: "Metrics", title: "Climate Metrics & Targets", description: "Climate-related metrics and reduction targets", mappedTo: "carbonTransactions" },
      { code: "Governance", title: "Board Oversight", description: "Board oversight of climate-related risks", mappedTo: "audits" },
    ],
  },
};

export default function FrameworksPage() {
  const [selected, setSelected] = useState<FrameworkId>("GRI");
  const [exporting, setExporting] = useState(false);

  const { data: report } = trpc.report.generate.useQuery({ type: "SUMMARY" });
  const { data: carbonData } = trpc.carbonTransaction.list.useQuery();
  const { data: scores } = trpc.department.listScores.useQuery();
  const { data: complianceIssues } = trpc.compliance.list.useQuery();
  const { data: policies } = trpc.policy.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();
  const { data: org } = trpc.settings.getOrgProfile.useQuery();

  const fw = frameworks[selected];

  const coverageData = useMemo(() => {
    if (!report || !carbonData) return [];
    const r = report as any;
    return fw.metrics.map((m) => {
      let status: "Covered" | "Partial" | "Missing" = "Missing";
      let value = "—";

      if (m.mappedTo === "carbonTransactions") {
        if (carbonData.length > 0) {
          status = r.totalEmissions > 0 ? "Covered" : "Partial";
          value = `${r.totalEmissions?.toFixed(1) || 0} tCO2e`;
        }
      } else if (m.mappedTo === "compliance") {
        if (complianceIssues && complianceIssues.length > 0) {
          const open = complianceIssues.filter((c: any) => c.status !== "RESOLVED").length;
          status = open === 0 ? "Covered" : "Partial";
          value = `${open} open issues`;
        }
      } else if (m.mappedTo === "policies") {
        if (policies && policies.length > 0) {
          status = policies.length >= 3 ? "Covered" : "Partial";
          value = `${policies.length} policies`;
        }
      } else if (m.mappedTo === "departments") {
        status = "Covered";
        value = `${org?.employeeCount || 0} employees`;
      } else if (m.mappedTo === "audits") {
        if (audits && audits.length > 0) {
          const avgScore = audits.reduce((s: number, a: any) => s + (a.score || 0), 0) / audits.length;
          status = avgScore >= 70 ? "Covered" : "Partial";
          value = `Avg score: ${avgScore.toFixed(0)}`;
        }
      } else if (m.mappedTo === "participation") {
        status = "Covered";
        value = `${scores?.length || 0} departments scored`;
      }

      return { ...m, status, value };
    });
  }, [selected, report, carbonData, complianceIssues, policies, audits, scores, org]);

  const coveragePct = useMemo(() => {
    if (!coverageData.length) return 0;
    const covered = coverageData.filter((c) => c.status === "Covered").length;
    const partial = coverageData.filter((c) => c.status === "Partial").length;
    return Math.round(((covered + partial * 0.5) / coverageData.length) * 100);
  }, [coverageData]);

  const allFrameworksCoverage = useMemo(() => {
    return (Object.keys(frameworks) as FrameworkId[]).map((fid) => {
      const fms = frameworks[fid].metrics;
      let covered = 0;
      fms.forEach((m) => {
        const match = coverageData.find((c) => c.code === m.code);
        if (match?.status === "Covered") covered++;
        else if (match?.status === "Partial") covered += 0.5;
      });
      return { name: fid, pct: Math.round((covered / fms.length) * 100) };
    });
  }, [coverageData]);

  const statusColor = (s: string) =>
    s === "Covered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    s === "Partial" ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-red-50 text-red-700 border-red-200";

  const statusIcon = (s: string) =>
    s === "Covered" ? <CheckCircle className="w-3.5 h-3.5" /> :
    s === "Partial" ? <AlertCircle className="w-3.5 h-3.5" /> :
    <AlertCircle className="w-3.5 h-3.5" />;

  const exportCSV = () => {
    const rows = coverageData.map((c) => ({
      Code: c.code, Metric: c.title, Status: c.status, Value: c.value, Description: c.description,
    }));
    const csv = [Object.keys(rows[0] || {}).join(",")].concat(rows.map((r) => Object.values(r).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EcoSphere-${selected}-Framework-Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ framework: selected, coverage: coverageData, coveragePct }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EcoSphere-${selected}-Framework-Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rows = coverageData.map((c) => ({
      Code: c.code, Metric: c.title, Status: c.status, Value: c.value, Description: c.description,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `${selected} Coverage`);
    const summaryWs = XLSX.utils.json_to_sheet([
      { Framework: selected, Coverage: `${coveragePct}%` },
      ...allFrameworksCoverage.map((f) => ({ Framework: f.name, Coverage: `${f.pct}%` })),
    ]);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
    XLSX.writeFile(wb, `EcoSphere-${selected}-Framework-Report.xlsx`);
  };

  const coveredCount = coverageData.filter((c) => c.status === "Covered").length;
  const partialCount = coverageData.filter((c) => c.status === "Partial").length;
  const missingCount = coverageData.filter((c) => c.status === "Missing").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ESG Reporting Frameworks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate reports aligned with GRI, SASB, and TCFD standards</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={!coverageData.length} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={exportJSON} disabled={!coverageData.length} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />JSON
          </button>
          <button onClick={exportExcel} disabled={!coverageData.length} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50">
            <FileText className="w-4 h-4" />Excel
          </button>
        </div>
      </div>

      {/* Framework Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(frameworks) as FrameworkId[]).map((fid) => {
          const f = frameworks[fid];
          return (
            <button
              key={fid}
              onClick={() => setSelected(fid)}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all text-left",
                selected === fid
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md"
                  : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{f.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.full}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${allFrameworksCoverage.find((a) => a.name === fid)?.pct || 0}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {allFrameworksCoverage.find((a) => a.name === fid)?.pct || 0}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Coverage Overview + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{selected} Coverage Score</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle cx="60" cy="60" r="50" stroke={fw.color} strokeWidth="12" fill="none"
                  strokeDasharray={`${coveragePct * 3.14} ${314 - coveragePct * 3.14}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{coveragePct}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Covered</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-emerald-600">Covered</span><span className="font-semibold">{coveredCount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-amber-600">Partial</span><span className="font-semibold">{partialCount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-red-600">Missing</span><span className="font-semibold">{missingCount}</span></div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Framework Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allFrameworksCoverage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                {allFrameworksCoverage.map((entry, idx) => (
                  <Cell key={idx} fill={Object.values(frameworks)[idx].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Covered", value: coveredCount },
                  { name: "Partial", value: partialCount },
                  { name: "Missing", value: missingCount },
                ]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Coverage Detail Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">{selected} Metrics Detail</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fw.full}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Metric</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Current Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {coverageData.map((c) => (
                <tr key={c.code} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{c.code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.title}</td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border", statusColor(c.status))}>
                      {statusIcon(c.status)} {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{c.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
