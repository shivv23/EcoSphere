"use client";

import { trpc } from "@/lib/trpc/client";
import { Leaf, Factory, Flame, Zap, TrendingDown, TrendingUp, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function EnvironmentalPage() {
  const { data: monthly, isLoading: loadingMonthly } = trpc.carbonTransaction.monthly.useQuery();
  const { data: totals, isLoading: loadingTotals } = trpc.carbonTransaction.totals.useQuery();

  const totalEmissions = monthly?.reduce((sum, m) => sum + m.scope1 + m.scope2 + m.scope3, 0) || 0;
  const scope1 = monthly?.reduce((sum, m) => sum + m.scope1, 0) || 0;
  const scope2 = monthly?.reduce((sum, m) => sum + m.scope2, 0) || 0;
  const scope3 = monthly?.reduce((sum, m) => sum + m.scope3, 0) || 0;

  const pieData = [
    { name: "Scope 1", value: scope1 },
    { name: "Scope 2", value: scope2 },
    { name: "Scope 3", value: scope3 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Environmental Tracking</h1>
        <p className="text-gray-500 mt-1">Monitor carbon emissions and sustainability goals</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Emissions", value: `${totalEmissions.toFixed(1)}`, unit: "tCO2e", icon: Factory, color: "from-red-500 to-rose-600", bg: "bg-red-50" },
          { label: "Scope 1 (Direct)", value: `${scope1.toFixed(1)}`, unit: "tCO2e", icon: Flame, color: "from-emerald-500 to-green-600", bg: "bg-emerald-50" },
          { label: "Scope 2 (Energy)", value: `${scope2.toFixed(1)}`, unit: "tCO2e", icon: Zap, color: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
          { label: "Scope 3 (Supply Chain)", value: `${scope3.toFixed(1)}`, unit: "tCO2e", icon: Leaf, color: "from-red-400 to-pink-600", bg: "bg-pink-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                {loadingMonthly ? (
                  <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}<span className="text-sm font-normal text-gray-400 ml-1">{kpi.unit}</span></p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Emissions Trend</h3>
          {loadingMonthly ? (
            <div className="h-72 bg-gray-50 rounded-xl animate-pulse" />
          ) : monthly && monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend />
                <Area type="monotone" dataKey="scope1" name="Scope 1" stroke="#10b981" fill="url(#colorScope1)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" name="Scope 2" stroke="#f59e0b" fill="url(#colorScope2)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope3" name="Scope 3" stroke="#ef4444" fill="url(#colorScope3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400"><Factory className="w-12 h-12 mb-2 opacity-30" /><p>No emissions data yet</p></div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Scope</h3>
          {loadingTotals ? (
            <div className="h-72 bg-gray-50 rounded-xl animate-pulse" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400"><Target className="w-12 h-12 mb-2 opacity-30" /><p>No scope data</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
