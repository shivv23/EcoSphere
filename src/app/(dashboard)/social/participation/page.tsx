"use client";

import { Users, Award, TrendingUp } from "lucide-react";

export default function ParticipationPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Employee Participation</h1><p className="text-gray-500 mt-1">Track employee involvement in CSR activities</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Participants", value: "—", icon: Users, color: "from-blue-500 to-indigo-600" },
          { label: "Points Earned", value: "—", icon: Award, color: "from-amber-500 to-orange-600" },
          { label: "Completion Rate", value: "—", icon: TrendingUp, color: "from-emerald-500 to-green-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-gray-500 mb-1">{kpi.label}</p><p className="text-2xl font-bold text-gray-900">{kpi.value}</p></div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}><kpi.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Participation Tracking</h3>
        <p className="text-gray-500">Employee participation will be tracked as they join CSR activities and earn points.</p>
      </div>
    </div>
  );
}
