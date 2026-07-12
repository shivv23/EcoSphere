"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ShieldAlert, AlertTriangle, CheckCircle, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const LIKELIHOOD_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"] as const;
const IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"] as const;

const SEVERITY_MAP: Record<string, { likelihood: number; impact: number }> = {
  CRITICAL: { likelihood: 4, impact: 5 },
  HIGH: { likelihood: 3, impact: 4 },
  MEDIUM: { likelihood: 2, impact: 3 },
  LOW: { likelihood: 1, impact: 2 },
};

function getCellColor(score: number) {
  if (score >= 15) return "bg-red-500";
  if (score >= 10) return "bg-orange-400";
  if (score >= 5) return "bg-yellow-400";
  return "bg-emerald-400";
}

function getCellTextColor(score: number) {
  if (score >= 15) return "text-red-600";
  if (score >= 10) return "text-orange-600";
  if (score >= 5) return "text-yellow-600";
  return "text-emerald-600";
}

function getCellBgLight(score: number) {
  if (score >= 15) return "bg-red-50 border-red-200";
  if (score >= 10) return "bg-orange-50 border-orange-200";
  if (score >= 5) return "bg-yellow-50 border-yellow-200";
  return "bg-emerald-50 border-emerald-200";
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    case "LOW":
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#10b981"];

interface IssueOnMatrix {
  id: string;
  title: string;
  severity: string;
  likelihood: number;
  impact: number;
}

export default function RiskPage() {
  const { data: issues, isLoading: issuesLoading } = trpc.compliance.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();
  const { data: thresholds } = trpc.threshold.list.useQuery();

  const [calcLikelihood, setCalcLikelihood] = useState(3);
  const [calcImpact, setCalcImpact] = useState(3);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const mappedIssues: IssueOnMatrix[] = (issues ?? []).map((issue: any) => {
    const mapping = SEVERITY_MAP[issue.severity] ?? { likelihood: 2, impact: 3 };
    return {
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      likelihood: mapping.likelihood,
      impact: mapping.impact,
    };
  });

  const filteredIssues =
    filterSeverity === "ALL" ? mappedIssues : mappedIssues.filter((i) => i.severity === filterSeverity);

  const matrixCells: { likelihood: number; impact: number; score: number; issues: IssueOnMatrix[] }[][] = [];
  for (let impactIdx = 4; impactIdx >= 0; impactIdx--) {
    const row = [];
    for (let likelihoodIdx = 0; likelihoodIdx < 5; likelihoodIdx++) {
      const likelihood = likelihoodIdx + 1;
      const impact = impactIdx + 1;
      const score = likelihood * impact;
      const cellIssues = filteredIssues.filter(
        (i) => i.likelihood === likelihood && i.impact === impact
      );
      row.push({ likelihood, impact, score, issues: cellIssues });
    }
    matrixCells.push(row);
  }

  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const issue of mappedIssues) {
    if (issue.severity in severityCounts) {
      severityCounts[issue.severity as keyof typeof severityCounts]++;
    }
  }

  const totalRisks = mappedIssues.length;

  const topRisks = [...mappedIssues]
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 5);

  const pieData = [
    { name: "Critical", value: severityCounts.CRITICAL },
    { name: "High", value: severityCounts.HIGH },
    { name: "Medium", value: severityCounts.MEDIUM },
    { name: "Low", value: severityCounts.LOW },
  ].filter((d) => d.value > 0);

  const calcScore = calcLikelihood * calcImpact;
  const calcColor = getCellColor(calcScore);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment Heat Map</h1>
          <p className="text-gray-500 mt-1">Compliance risk visualization and analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Risks", value: totalRisks, icon: ShieldAlert, color: "from-blue-500 to-indigo-600" },
          { label: "Critical", value: severityCounts.CRITICAL, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
          { label: "Open Issues", value: (issues ?? []).filter((i: any) => i.status === "OPEN").length, icon: AlertTriangle, color: "from-orange-500 to-amber-600" },
          { label: "Resolved", value: (issues ?? []).filter((i: any) => i.status === "RESOLVED").length, icon: CheckCircle, color: "from-emerald-500 to-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", stat.color)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeverity(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterSeverity === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Risk Matrix</h2>
          <p className="text-sm text-gray-500 mb-5">Each dot represents a compliance issue</p>

          <div className="overflow-x-auto">
            <div className="inline-flex flex-col">
              <div className="flex items-end ml-16 mb-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Likelihood →</span>
              </div>

              <div className="flex items-start">
                <div className="flex flex-col mr-2 shrink-0" style={{ paddingTop: 0 }}>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 rotate-180" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: 60 }}>← Impact</span>
                </div>

                <div className="flex flex-col-reverse gap-1">
                  {matrixCells.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1">
                      <div className="w-14 flex items-center justify-end pr-2 shrink-0">
                        <span className="text-[10px] font-medium text-gray-500">
                          {IMPACT_LABELS[4 - rowIdx]}
                        </span>
                      </div>
                      {row.map((cell) => {
                        const key = `${cell.likelihood}-${cell.impact}`;
                        const isHovered = hoveredCell === key;
                        return (
                          <div
                            key={key}
                            className="relative"
                            onMouseEnter={() => setHoveredCell(key)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div
                              className={cn(
                                "w-[60px] h-[60px] rounded-xl border flex flex-wrap items-center justify-center gap-1 p-1.5 cursor-default transition-all duration-150",
                                getCellBgLight(cell.score),
                                isHovered && "ring-2 ring-gray-400 scale-105"
                              )}
                            >
                              {cell.issues.length > 0 ? (
                                cell.issues.map((issue) => (
                                  <div
                                    key={issue.id}
                                    className={cn(
                                      "w-3 h-3 rounded-full border border-white shadow-sm shrink-0",
                                      getCellColor(cell.score)
                                    )}
                                    title={issue.title}
                                  />
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-300 font-medium">{cell.score}</span>
                              )}
                            </div>

                            {isHovered && (
                              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white rounded-xl p-3 shadow-xl pointer-events-none">
                                <p className="text-xs font-bold mb-1">
                                  {LIKELIHOOD_LABELS[cell.likelihood - 1]} × {IMPACT_LABELS[cell.impact - 1]}
                                </p>
                                <p className={cn("text-xs font-semibold mb-2", getCellTextColor(cell.score))}>
                                  Score: {cell.score}
                                </p>
                                {cell.issues.length > 0 ? (
                                  <div className="space-y-1">
                                    {cell.issues.map((issue) => (
                                      <div key={issue.id} className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", getCellColor(cell.score))} />
                                        <span className="text-[11px] truncate">{issue.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-gray-400">No issues in this cell</p>
                                )}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div className="flex">
                    <div className="w-14 shrink-0" />
                    <div className="flex gap-1 ml-[0px]">
                      {LIKELIHOOD_LABELS.map((label, idx) => (
                        <div key={idx} className="w-[60px] text-center">
                          <span className="text-[10px] font-medium text-gray-500">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-gray-500">Low (1-4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-[11px] text-gray-500">Medium (5-9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-[11px] text-gray-500">High (10-14)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-[11px] text-gray-500">Critical (15-25)</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h2>
            {issuesLoading ? (
              <div className="h-48 animate-pulse bg-gray-100 rounded-xl" />
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No data to display
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Risk Score Calculator</h2>
            <p className="text-xs text-gray-500 mb-4">Calculate a custom risk score</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Likelihood</label>
                <select
                  value={calcLikelihood}
                  onChange={(e) => setCalcLikelihood(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/50 outline-none"
                >
                  {LIKELIHOOD_LABELS.map((label, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} — {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Impact</label>
                <select
                  value={calcImpact}
                  onChange={(e) => setCalcImpact(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/50 outline-none"
                >
                  {IMPACT_LABELS.map((label, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} — {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cn("rounded-xl p-4 text-center border", getCellBgLight(calcScore))}>
                <p className="text-xs font-medium text-gray-500 mb-1">Risk Score</p>
                <p className={cn("text-3xl font-bold", getCellTextColor(calcScore))}>{calcScore}</p>
                <p className={cn("text-xs font-semibold mt-1", getCellTextColor(calcScore))}>
                  {calcScore >= 15 ? "Critical" : calcScore >= 10 ? "High" : calcScore >= 5 ? "Medium" : "Low"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Summary</h2>
          <div className="space-y-3">
            {[
              { label: "Critical", count: severityCounts.CRITICAL, color: "bg-red-500" },
              { label: "High", count: severityCounts.HIGH, color: "bg-orange-400" },
              { label: "Medium", count: severityCounts.MEDIUM, color: "bg-yellow-400" },
              { label: "Low", count: severityCounts.LOW, color: "bg-emerald-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full shrink-0", item.color)} />
                <span className="text-sm text-gray-700 font-medium flex-1">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", item.color)}
                    style={{ width: totalRisks > 0 ? `${(item.count / totalRisks) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Risks</h2>
          {topRisks.length > 0 ? (
            <div className="space-y-2">
              {topRisks.map((risk, idx) => (
                <div key={risk.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{risk.title}</p>
                    <p className="text-[11px] text-gray-500">
                      L:{risk.likelihood} × I:{risk.impact} = {risk.likelihood * risk.impact}
                    </p>
                  </div>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-medium", getSeverityBadge(risk.severity))}>
                    {risk.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <ShieldAlert className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No risks to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
