"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Grid3X3, Plus, Trash2, GripVertical, CheckCircle, Download, X } from "lucide-react";

interface MaterialityTopic {
  id: string;
  name: string;
  category: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE";
  impact: number;
  stakeholderInterest: number;
  description: string;
}

const SEED_TOPICS: MaterialityTopic[] = [
  { id: "e1", name: "Climate Change", category: "ENVIRONMENTAL", impact: 9, stakeholderInterest: 8, description: "GHG emissions and climate risk management" },
  { id: "e2", name: "Water Usage", category: "ENVIRONMENTAL", impact: 7, stakeholderInterest: 6, description: "Water consumption and conservation efforts" },
  { id: "e3", name: "Biodiversity", category: "ENVIRONMENTAL", impact: 6, stakeholderInterest: 5, description: "Impact on ecosystems and biodiversity" },
  { id: "e4", name: "Waste Management", category: "ENVIRONMENTAL", impact: 7, stakeholderInterest: 7, description: "Waste reduction, recycling, and circular economy" },
  { id: "e5", name: "Energy Efficiency", category: "ENVIRONMENTAL", impact: 8, stakeholderInterest: 8, description: "Energy consumption and efficiency improvements" },
  { id: "e6", name: "Emissions", category: "ENVIRONMENTAL", impact: 9, stakeholderInterest: 9, description: "Direct and indirect emissions across scopes" },
  { id: "s1", name: "Employee Health & Safety", category: "SOCIAL", impact: 8, stakeholderInterest: 9, description: "Workplace safety and occupational health" },
  { id: "s2", name: "Diversity & Inclusion", category: "SOCIAL", impact: 6, stakeholderInterest: 8, description: "Workforce diversity and inclusive practices" },
  { id: "s3", name: "Community Engagement", category: "SOCIAL", impact: 5, stakeholderInterest: 7, description: "Community investment and social impact" },
  { id: "s4", name: "Human Rights", category: "SOCIAL", impact: 7, stakeholderInterest: 8, description: "Human rights due diligence in operations" },
  { id: "s5", name: "Training & Development", category: "SOCIAL", impact: 5, stakeholderInterest: 6, description: "Employee skills development and training programs" },
  { id: "g1", name: "Ethics & Compliance", category: "GOVERNANCE", impact: 8, stakeholderInterest: 9, description: "Anti-corruption, ethical conduct, regulatory compliance" },
  { id: "g2", name: "Board Diversity", category: "GOVERNANCE", impact: 5, stakeholderInterest: 7, description: "Board composition and diversity of perspectives" },
  { id: "g3", name: "Data Privacy", category: "GOVERNANCE", impact: 7, stakeholderInterest: 9, description: "Data protection and privacy management" },
  { id: "g4", name: "Anti-corruption", category: "GOVERNANCE", impact: 7, stakeholderInterest: 8, description: "Policies and training against corruption" },
  { id: "g5", name: "Supply Chain Standards", category: "GOVERNANCE", impact: 6, stakeholderInterest: 7, description: "Supplier code of conduct and due diligence" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  ENVIRONMENTAL: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-300" },
  SOCIAL: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-300" },
  GOVERNANCE: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-300" },
};

function getQuadrantClass(row: number, col: number): string {
  if (row >= 6 && col >= 6) return "bg-emerald-50/80";
  if (row >= 6 && col <= 5) return "bg-amber-50/50";
  if (row <= 5 && col >= 6) return "bg-amber-50/50";
  return "bg-gray-50/80";
}

export default function MaterialityPage() {
  const [topics, setTopics] = useState<MaterialityTopic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MaterialityTopic | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<"ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE">("ENVIRONMENTAL");
  const [formImpact, setFormImpact] = useState(5);
  const [formInterest, setFormInterest] = useState(5);
  const [formDesc, setFormDesc] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("esg-materiality-topics");
      setTopics(saved ? JSON.parse(saved) : SEED_TOPICS);
    } catch { setTopics(SEED_TOPICS); }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("esg-materiality-topics", JSON.stringify(topics));
  }, [topics, mounted]);

  const resetForm = () => {
    setFormName(""); setFormCategory("ENVIRONMENTAL"); setFormImpact(5); setFormInterest(5); setFormDesc("");
    setEditing(null); setShowForm(false);
  };

  const startEdit = (t: MaterialityTopic) => {
    setEditing(t); setFormName(t.name); setFormCategory(t.category);
    setFormImpact(t.impact); setFormInterest(t.stakeholderInterest); setFormDesc(t.description);
    setShowForm(true);
  };

  const saveTopic = () => {
    if (!formName.trim()) return;
    if (editing) {
      setTopics((prev) => prev.map((t) => t.id === editing.id
        ? { ...t, name: formName, category: formCategory, impact: formImpact, stakeholderInterest: formInterest, description: formDesc }
        : t));
    } else {
      setTopics((prev) => [...prev, {
        id: crypto.randomUUID(), name: formName, category: formCategory,
        impact: formImpact, stakeholderInterest: formInterest, description: formDesc,
      }]);
    }
    resetForm();
  };

  const deleteTopic = (id: string) => {
    if (confirmDelete === id) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const exportCSV = () => {
    const header = "Name,Category,Impact,Stakeholder Interest,Description";
    const rows = topics.map((t) => `"${t.name}","${t.category}",${t.impact},${t.stakeholderInterest},"${t.description}"`);
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "esg-materiality-matrix.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTopics = useMemo(() => {
    if (filter === "ALL") return topics;
    return topics.filter((t) => t.category === filter);
  }, [topics, filter]);

  // Grid: rows = impact (10 at top, 1 at bottom), cols = interest (1 left, 10 right)
  const topicGrid = useMemo(() => {
    const grid: Record<string, MaterialityTopic[]> = {};
    filteredTopics.forEach((t) => {
      const key = `${t.impact}-${t.stakeholderInterest}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(t);
    });
    return grid;
  }, [filteredTopics]);

  if (!mounted) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ESG Materiality Matrix</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">GRI-aligned stakeholder-driven materiality assessment</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Add Topic"}
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{editing ? "Edit Topic" : "Add New Topic"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category *</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none">
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Impact: {formImpact}</label>
              <input type="range" min={1} max={10} value={formImpact} onChange={(e) => setFormImpact(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stakeholder Interest: {formInterest}</label>
              <input type="range" min={1} max={10} value={formInterest} onChange={(e) => setFormInterest(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex items-end">
              <button onClick={saveTopic} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                {editing ? "Update" : "Add Topic"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Matrix */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Materiality Matrix</h3>
              <p className="text-xs text-gray-500">Hover over topics for details</p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-4">
            {["ALL", "ENVIRONMENTAL", "SOCIAL", "GOVERNANCE"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
                  filter === f ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200")}>
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative min-w-[600px]">
            {/* Quadrant labels */}
            <div className="absolute top-2 left-[12%] z-10 text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider">Prioritize</div>
            <div className="absolute top-[12%] right-2 z-10 text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Manage</div>
            <div className="absolute bottom-[14%] left-2 z-10 text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Manage</div>
            <div className="absolute bottom-2 right-[12%] z-10 text-[10px] font-bold text-gray-400/60 uppercase tracking-wider">Monitor</div>

            <div className="flex">
              {/* Y-axis label */}
              <div className="flex items-center justify-center w-8">
                <span className="-rotate-90 text-[10px] font-semibold text-gray-500 whitespace-nowrap tracking-wider">Impact →</span>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-10 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {Array.from({ length: 10 }, (_, ri) => {
                    const impact = 10 - ri;
                    return Array.from({ length: 10 }, (_, ci) => {
                      const interest = ci + 1;
                      const key = `${impact}-${interest}`;
                      const cellTopics = topicGrid[key] || [];
                      return (
                        <div key={key}
                          className={cn("relative w-full aspect-square border-r border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-center",
                            getQuadrantClass(impact, interest),
                            ci === 4 && "border-r-2 border-r-dashed border-gray-300 dark:border-gray-600",
                            ri === 4 && "border-b-2 border-b-dashed border-gray-300 dark:border-gray-600"
                          )}
                        >
                          {cellTopics.map((t, idx) => (
                            <div key={t.id}
                              className={cn("absolute w-7 h-7 rounded-full shadow-md cursor-pointer hover:scale-150 hover:z-20 transition-all duration-200 flex items-center justify-center text-white text-[8px] font-bold",
                                CATEGORY_COLORS[t.category].dot,
                                idx > 0 && "ml-3 mt-3"
                              )}
                              onMouseEnter={() => setHovered(t.id)}
                              onMouseLeave={() => setHovered(null)}
                              onClick={() => startEdit(t)}
                            >
                              {t.name.charAt(0)}
                              {hovered === t.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none">
                                  <p className="font-bold">{t.name}</p>
                                  <p className="text-gray-300">Impact: {t.impact} | Interest: {t.stakeholderInterest}</p>
                                  <p className="text-gray-400 text-[10px]">{t.description}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })}
                </div>
                {/* X-axis labels */}
                <div className="grid grid-cols-10 gap-0 mt-1 px-0">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="text-center text-[10px] text-gray-400 font-medium">{i + 1}</div>
                  ))}
                </div>
                <div className="text-center text-[10px] font-semibold text-gray-500 mt-1 tracking-wider">Stakeholder Importance →</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Topic List */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Topics</h3>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">{filteredTopics.length}</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
              {filteredTopics.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", CATEGORY_COLORS[t.category].dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.name}</p>
                    <div className="flex gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>I:{t.impact}</span><span>S:{t.stakeholderInterest}</span>
                    </div>
                  </div>
                  <button onClick={() => startEdit(t)} className="p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-xs">Edit</span>
                  </button>
                  <button onClick={() => deleteTopic(t.id)}
                    className={cn("p-1 transition-all opacity-0 group-hover:opacity-100",
                      confirmDelete === t.id ? "text-red-500" : "text-gray-400 hover:text-red-500")}>
                    {confirmDelete === t.id ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              {filteredTopics.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">No topics found</div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h4>
            <div className="space-y-2">
              {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", c.dot)} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Quadrants</p>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-100" /><span className="text-xs text-gray-600 dark:text-gray-400">Prioritize</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-100" /><span className="text-xs text-gray-600 dark:text-gray-400">Manage</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100" /><span className="text-xs text-gray-600 dark:text-gray-400">Monitor</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
