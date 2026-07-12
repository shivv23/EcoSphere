"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Leaf, TreePine, Sun, Wind, Factory, BadgeCheck, ShoppingCart, DollarSign, Package, Globe,
  Loader2, ChevronRight, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

const TYPE_STYLES: Record<string, { gradient: string; icon: typeof Leaf; label: string }> = {
  Reforestation: { gradient: "from-green-500 to-emerald-600", icon: TreePine, label: "Reforestation" },
  Solar: { gradient: "from-yellow-400 to-amber-500", icon: Sun, label: "Solar" },
  Wind: { gradient: "from-blue-400 to-cyan-500", icon: Wind, label: "Wind" },
  MethaneCapture: { gradient: "from-purple-500 to-violet-600", icon: Factory, label: "Methane Capture" },
};

const TYPE_BADGES: Record<string, string> = {
  Reforestation: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Solar: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Wind: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MethaneCapture: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function OffsetPage() {
  const utils = trpc.useUtils();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [tons, setTons] = useState("");

  const { data: stats, isLoading: statsLoading } = trpc.offset.stats.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.offset.projects.useQuery();
  const { data: purchases, isLoading: purchasesLoading } = trpc.offset.myPurchases.useQuery();

  const purchaseMutation = trpc.offset.purchase.useMutation({
    onSuccess: () => {
      toast.success("Carbon offset purchased successfully");
      setPurchasingId(null);
      setTons("");
      utils.offset.stats.invalidate();
      utils.offset.projects.invalidate();
      utils.offset.myPurchases.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handlePurchase = (projectId: string, pricePerTon: number) => {
    const numTons = parseFloat(tons);
    if (!numTons || numTons <= 0) return toast.error("Enter a valid number of tons");
    purchaseMutation.mutate({ projectId, tons: numTons });
  };

  const statCards = [
    { label: "Total Tons Offset", value: stats?.totalTons ?? 0, suffix: "t", icon: Leaf, gradient: "from-emerald-500 to-teal-600" },
    { label: "Offset % of Emissions", value: stats?.offsetPercentage ?? 0, suffix: "%", icon: Globe, gradient: "from-green-500 to-emerald-500" },
    { label: "Total Spent", value: `$${(stats?.totalSpent ?? 0).toLocaleString()}`, suffix: "", icon: DollarSign, gradient: "from-teal-500 to-cyan-600" },
    { label: "Projects Available", value: projects?.length ?? 0, suffix: "", icon: Package, gradient: "from-emerald-600 to-green-700" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carbon Offset Marketplace</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Purchase carbon offsets to neutralize your organization&apos;s emissions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 h-28 animate-pulse" />
            ))
          : statCards.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof s.value === "number" ? s.value.toLocaleString() : s.value}{s.suffix}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-56 animate-pulse" />
              ))
            : projects && projects.length > 0
            ? projects.map((project: any) => {
                const style = TYPE_STYLES[project.type] || TYPE_STYLES.Reforestation;
                const Icon = style.icon;
                const isPurchasing = purchasingId === project.id;
                return (
                  <div key={project.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden card-hover animate-scale-in">
                    <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{project.location}</p>
                          </div>
                        </div>
                        {project.verified && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>

                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGES[project.type] || ""}`}>
                          {project.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {project.provider}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">${project.pricePerTon}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ton</span></p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{project.availableTons.toLocaleString()} tons available</p>
                        </div>
                        {!isPurchasing ? (
                          <button
                            onClick={() => { setPurchasingId(project.id); setTons(""); }}
                            disabled={project.availableTons <= 0}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Purchase
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <button onClick={() => { setPurchasingId(null); setTons(""); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isPurchasing && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tons to purchase</label>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={tons}
                                onChange={(e) => setTons(e.target.value)}
                                placeholder="e.g. 10"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                              />
                            </div>
                            <div className="pt-5">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                ${tons ? (parseFloat(tons) * project.pricePerTon).toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePurchase(project.id, project.pricePerTon)}
                            disabled={purchaseMutation.isPending || !tons || parseFloat(tons) <= 0}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            {purchaseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm Purchase
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            : (
                <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center text-gray-400">
                  <Leaf className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No offset projects available</p>
                </div>
              )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Purchases</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tons Purchased</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {purchasesLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : purchases && purchases.length > 0
                  ? purchases.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{p.project.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGES[p.project.type] || ""}`}>
                            {p.project.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{p.tonsPurchased} tons</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${p.totalCost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(p.purchasedAt)}</td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p>No purchases yet</p>
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
