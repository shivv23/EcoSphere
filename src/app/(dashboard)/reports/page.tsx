"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { FileText, Download, Filter, Leaf, Users, Shield, BarChart3, Loader2, FileSpreadsheet, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type ReportType = "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE" | "SUMMARY";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("SUMMARY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: report, isLoading } = trpc.report.generate.useQuery({
    type: reportType,
    departmentId: departmentId || undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const { data: departments } = trpc.department.list.useQuery();

  const reportTypes = [
    { key: "SUMMARY" as ReportType, label: "ESG Summary", icon: BarChart3, color: "from-emerald-500 to-teal-600" },
    { key: "ENVIRONMENTAL" as ReportType, label: "Environmental", icon: Leaf, color: "from-green-500 to-emerald-600" },
    { key: "SOCIAL" as ReportType, label: "Social", icon: Users, color: "from-blue-500 to-indigo-600" },
    { key: "GOVERNANCE" as ReportType, label: "Governance", icon: Shield, color: "from-purple-500 to-violet-600" },
  ];

  const exportCSV = () => {
    if (!report) return;
    let csv = "";
    if (report.type === "SUMMARY") {
      csv = "Metric,Value\nTotal Emissions (tCO2e)," + report.totalEmissions + "\nCSR Activities," + report.totalCSR + "\nTotal Participation," + report.totalParticipation + "\nOpen Issues," + report.openIssues + "\nPolicies," + report.totalPolicies + "\nAudits," + report.totalAudits;
    } else if (report.type === "ENVIRONMENTAL") {
      csv = "Metric,Value\nTotal Emissions," + report.totalEmissions + "\nScope 1," + report.byScope.scope1 + "\nScope 2," + report.byScope.scope2 + "\nScope 3," + report.byScope.scope3 + "\nTransactions," + report.transactionCount;
    } else if (report.type === "SOCIAL") {
      csv = "Metric,Value\nTotal Activities," + report.totalActivities + "\nTotal Participants," + report.totalParticipants + "\nTotal Points," + report.totalPoints;
    } else {
      csv = "Metric,Value\nPolicies," + report.totalPolicies + "\nAudits," + report.totalAudits + "\nOpen Issues," + report.openIssues;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecosphere-${reportType.toLowerCase()}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecosphere-${reportType.toLowerCase()}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-gray-500 mt-1">Generate and export ESG reports</p></div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={!report} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"><FileSpreadsheet className="w-4 h-4" />Export CSV</button>
          <button onClick={exportJSON} disabled={!report} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"><FileDown className="w-4 h-4" />Export JSON</button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportTypes.map(rt => (
          <button key={rt.key} onClick={() => setReportType(rt.key)} className={`p-4 rounded-2xl border-2 transition-all text-left ${reportType === rt.key ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rt.color} flex items-center justify-center mb-3 shadow-lg`}><rt.icon className="w-5 h-5 text-white" /></div>
            <p className="font-semibold text-gray-900 text-sm">{rt.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500"><Filter className="w-4 h-4" />Filters:</div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Department</label>
          <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none">
            <option value="">All Departments</option>{departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Report */}
          {report.type === "SUMMARY" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Emissions", value: `${(report as any).totalEmissions?.toFixed(1) || 0} t`, color: "text-red-600" },
                  { label: "CSR Activities", value: (report as any).totalCSR || 0, color: "text-pink-600" },
                  { label: "Participation", value: (report as any).totalParticipation || 0, color: "text-blue-600" },
                  { label: "Open Issues", value: (report as any).openIssues || 0, color: "text-amber-600" },
                  { label: "Policies", value: (report as any).totalPolicies || 0, color: "text-indigo-600" },
                  { label: "Audits", value: (report as any).totalAudits || 0, color: "text-purple-600" },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Environmental Report */}
          {report.type === "ENVIRONMENTAL" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Emissions by Scope</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[{ name: "Scope 1", value: (report as any).byScope?.scope1 || 0, fill: "#10b981" }, { name: "Scope 2", value: (report as any).byScope?.scope2 || 0, fill: "#f59e0b" }, { name: "Scope 3", value: (report as any).byScope?.scope3 || 0, fill: "#ef4444" }]}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" radius={[8, 8, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Environmental Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"><span className="text-sm text-gray-600">Total Emissions</span><span className="font-bold text-gray-900">{(report as any).totalEmissions?.toFixed(2)} tCO2e</span></div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"><span className="text-sm text-gray-600">Total Transactions</span><span className="font-bold text-gray-900">{(report as any).transactionCount}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Social Report */}
          {report.type === "SOCIAL" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{(report as any).totalActivities}</p><p className="text-sm text-gray-500 mt-1">Total Activities</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{(report as any).totalParticipants}</p><p className="text-sm text-gray-500 mt-1">Participants</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{(report as any).totalPoints}</p><p className="text-sm text-gray-500 mt-1">Points Earned</p>
              </div>
            </div>
          )}

          {/* Governance Report */}
          {report.type === "GOVERNANCE" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{(report as any).totalPolicies}</p><p className="text-sm text-gray-500 mt-1">Policies</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{(report as any).totalAudits}</p><p className="text-sm text-gray-500 mt-1">Audits</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-bold text-red-600">{(report as any).openIssues}</p><p className="text-sm text-gray-500 mt-1">Open Issues</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Select filters and generate a report</p>
        </div>
      )}
    </div>
  );
}
