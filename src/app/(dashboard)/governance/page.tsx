"use client";

import { trpc } from "@/lib/trpc/client";
import { Shield, FileCheck, AlertTriangle, ClipboardCheck, Scale, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function GovernancePage() {
  const { data: compStats, isLoading: loadingComp } = trpc.compliance.stats.useQuery();
  const { data: policies } = trpc.policy.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();
  const { data: issues } = trpc.compliance.list.useQuery();

  const severityData = [
    { name: "Critical", value: issues?.filter((i: any) => i.severity === "CRITICAL").length || 0, color: "#ef4444" },
    { name: "High", value: issues?.filter((i: any) => i.severity === "HIGH").length || 0, color: "#f97316" },
    { name: "Medium", value: issues?.filter((i: any) => i.severity === "MEDIUM").length || 0, color: "#f59e0b" },
    { name: "Low", value: issues?.filter((i: any) => i.severity === "LOW").length || 0, color: "#10b981" },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: "Open", value: compStats?.open || 0, color: "#ef4444" },
    { name: "In Progress", value: compStats?.inProgress || 0, color: "#f59e0b" },
    { name: "Resolved", value: compStats?.resolved || 0, color: "#10b981" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Governance</h1><p className="text-gray-500 mt-1">Policies, audits, compliance tracking & governance reports</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Policies", value: policies?.length || 0, icon: FileCheck, color: "from-blue-500 to-indigo-600" },
          { label: "Total Audits", value: audits?.length || 0, icon: ClipboardCheck, color: "from-purple-500 to-violet-600" },
          { label: "Open Issues", value: compStats?.open || 0, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
          { label: "Critical Issues", value: compStats?.critical || 0, icon: Scale, color: "from-orange-500 to-red-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-gray-500 mb-1">{kpi.label}</p>{loadingComp ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>}</div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}><kpi.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Severity</h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">{severityData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[250px] flex items-center justify-center text-gray-400"><Shield className="w-10 h-10 opacity-30" /><p className="ml-2">No compliance issues</p></div>}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{statusData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar></BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[250px] flex items-center justify-center text-gray-400"><Scale className="w-10 h-10 opacity-30" /><p className="ml-2">No data</p></div>}
        </div>
      </div>
    </div>
  );
}
