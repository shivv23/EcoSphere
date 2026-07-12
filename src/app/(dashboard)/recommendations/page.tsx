"use client";

import { trpc } from "@/lib/trpc/client";
import { Leaf, Zap, Shield, Clipboard, Users, Heart, FileText, Trophy, Star, Sparkles, AlertTriangle, TrendingUp, Info } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  leaf: Leaf, zap: Zap, shield: Shield, clipboard: Clipboard,
  users: Users, heart: Heart, "file-text": FileText, trophy: Trophy, star: Star,
};

const priorityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-400 border border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  LOW: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

const priorityDot: Record<string, string> = {
  CRITICAL: "bg-red-400", HIGH: "bg-orange-400", MEDIUM: "bg-yellow-400", LOW: "bg-blue-400",
};

const categoryColors: Record<string, string> = {
  Environmental: "bg-emerald-500/10 text-emerald-400",
  Social: "bg-blue-500/10 text-blue-400",
  Governance: "bg-purple-500/10 text-purple-400",
  Gamification: "bg-pink-500/10 text-pink-400",
  General: "bg-slate-500/10 text-slate-400",
};

const progressColor: Record<string, string> = {
  CRITICAL: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-yellow-500", LOW: "bg-blue-500",
};

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = trpc.recommendation.list.useQuery();

  const counts = recommendations
    ? {
        total: recommendations.length,
        CRITICAL: recommendations.filter((r) => r.priority === "CRITICAL").length,
        HIGH: recommendations.filter((r) => r.priority === "HIGH").length,
        MEDIUM: recommendations.filter((r) => r.priority === "MEDIUM").length,
        LOW: recommendations.filter((r) => r.priority === "LOW").length,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI ESG Recommendations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Smart insights to improve your ESG performance</p>
        </div>
      </div>

      {/* Summary Bar */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : counts ? (
        <div className="animate-slide-in grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{counts.CRITICAL}</p>
              <p className="text-xs text-slate-500">Critical</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{counts.HIGH}</p>
              <p className="text-xs text-slate-500">High</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{counts.MEDIUM}</p>
              <p className="text-xs text-slate-500">Medium</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{counts.LOW}</p>
              <p className="text-xs text-slate-500">Low</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recommendation Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => {
            const Icon = iconMap[rec.icon] || Sparkles;
            const progress =
              rec.currentValue !== undefined && rec.targetValue !== undefined
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      rec.targetValue > rec.currentValue
                        ? (rec.currentValue / rec.targetValue) * 100
                        : rec.currentValue > 0
                          ? Math.max(0, 100 - ((rec.currentValue - rec.targetValue) / rec.currentValue) * 100)
                          : 0
                    )
                  )
                : undefined;

            return (
              <div
                key={rec.id}
                className="animate-fade-in bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300 card-hover"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{rec.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[rec.priority]}`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${priorityDot[rec.priority]} mr-1 align-middle`} />
                        {rec.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[rec.category] || "bg-slate-500/10 text-slate-400"}`}
                      >
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{rec.description}</p>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">{rec.impact}</p>
                    </div>
                    {rec.metric && rec.currentValue !== undefined && rec.targetValue !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{rec.metric}: {rec.currentValue}</span>
                          <span>Target: {rec.targetValue}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${progressColor[rec.priority] || "bg-blue-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center animate-scale-in">
          <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Recommendations Yet</h3>
          <p className="text-sm text-slate-500">Add more ESG data to receive personalized recommendations.</p>
        </div>
      )}
    </div>
  );
}
