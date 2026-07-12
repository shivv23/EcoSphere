"use client";

import { Users, PieChart as PieIcon } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const GENDER_COLORS = ["#3b82f6", "#ec4899", "#8b5cf6", "#94a3b8"];

export default function DiversityPage() {
  const { data: users } = trpc.user.list.useQuery();

  const genderData = users?.reduce((acc: any[], u: any) => {
    const key = u.gender || "PREFER_NOT_TO_SAY";
    const existing = acc.find(g => g.name === key);
    if (existing) existing.value++;
    else acc.push({ name: key, value: 1 });
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Diversity Metrics</h1><p className="text-gray-500 mt-1">Workforce diversity and inclusion analytics</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Departments</p>
          <p className="text-2xl font-bold text-gray-900">{new Set(users?.filter((u: any) => u.department).map((u: any) => u.department?.name)).size || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Gender Distribution</p>
          <p className="text-2xl font-bold text-gray-900">{genderData.length} groups</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
        {genderData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={genderData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{genderData.map((_: any, i: number) => <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-gray-400 py-12">No employee data available</p>}
      </div>
    </div>
  );
}
