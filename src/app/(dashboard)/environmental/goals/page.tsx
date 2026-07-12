"use client";

import { Target, TrendingUp } from "lucide-react";

export default function EnvironmentalGoalsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Environmental Goals</h1><p className="text-gray-500 mt-1">Set and track sustainability targets</p></div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg"><Target className="w-8 h-8 text-white" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sustainability Goals</h3>
        <p className="text-gray-500 max-w-md mx-auto">Define carbon reduction targets, energy efficiency goals, and sustainability milestones for your organization.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Net Zero by 2030", "Reduce Scope 1 by 30%", "100% Renewable Energy"].map((goal, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium text-gray-900">{goal}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: `${[75, 45, 30][i]}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1">{[75, 45, 30][i]}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
