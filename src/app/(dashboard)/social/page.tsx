"use client";

import { trpc } from "@/lib/trpc/client";
import { Users, Heart, HandHeart, Award, UserCheck, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function SocialPage() {
  const { data: stats, isLoading } = trpc.csrActivity.stats.useQuery();
  const { data: activities } = trpc.csrActivity.list.useQuery();

  const statusData = [
    { name: "Pending", value: stats?.pending || 0, color: "#f59e0b" },
    { name: "Approved", value: stats?.approved || 0, color: "#10b981" },
  ];

  const categoryData = activities?.reduce((acc: any[], a: any) => {
    const existing = acc.find(c => c.name === a.category.name);
    if (existing) existing.count++;
    else acc.push({ name: a.category.name, count: 1 });
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Social Responsibility</h1><p className="text-gray-500 mt-1">CSR activities, employee participation & diversity metrics</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Activities", value: stats?.total || 0, icon: Heart, color: "from-pink-500 to-rose-600" },
          { label: "Total Participants", value: stats?.totalParticipations || 0, icon: Users, color: "from-blue-500 to-indigo-600" },
          { label: "Pending Approval", value: stats?.pending || 0, icon: HandHeart, color: "from-amber-500 to-orange-600" },
          { label: "Approved", value: stats?.approved || 0, icon: UserCheck, color: "from-emerald-500 to-green-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-gray-500 mb-1">{kpi.label}</p>{isLoading ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>}</div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}><kpi.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">{statusData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} /><Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent CSR Activities</h3>
        <div className="space-y-3">
          {activities?.slice(0, 5).map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Heart className="w-5 h-5 text-white" /></div>
                <div><p className="font-medium text-gray-900">{a.title}</p><p className="text-xs text-gray-500">{a.category.name} · {a.department.name}</p></div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : a.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
            </div>
          ))}
          {(!activities || activities.length === 0) && <p className="text-center text-gray-400 py-8"><Heart className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No CSR activities yet</p></p>}
        </div>
      </div>
    </div>
  );
}
