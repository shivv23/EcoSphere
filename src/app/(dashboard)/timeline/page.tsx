"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Heart, Shield, Leaf, FileText, Trophy, Star, Award, Target, Clock, Plus, X } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  heart: Heart, shield: Shield, leaf: Leaf, "file-text": FileText,
  trophy: Trophy, star: Star, award: Award, target: Target,
};

const categoryColors: Record<string, { bg: string; text: string; dot: string; line: string }> = {
  CSR: { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-400", line: "bg-pink-400" },
  Environmental: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", line: "bg-emerald-400" },
  Social: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400", line: "bg-blue-400" },
  Governance: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400", line: "bg-purple-400" },
  Compliance: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", line: "bg-amber-400" },
  Engagement: { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-400", line: "bg-pink-400" },
  Milestone: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400", line: "bg-yellow-400" },
};

const categories = ["CSR", "Environmental", "Social", "Governance", "Compliance", "Engagement", "Milestone"];

export default function TimelinePage() {
  const { data: events, isLoading, refetch } = trpc.timeline.list.useQuery();
  const addEvent = trpc.timeline.add.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ title: "", description: "", date: "", category: "Milestone", impact: "" });
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", category: "Milestone", impact: "" });

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.description) return;
    addEvent.mutate(form);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ESG Impact Timeline</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track your sustainability journey over time</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="animate-slide-in bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Timeline Event</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the event..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Impact</label>
                <input
                  type="text"
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })}
                  placeholder="Impact description (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.title || !form.date || !form.description || addEvent.isPending}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addEvent.isPending ? "Adding..." : "Add Event"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 md:-translate-x-px" />

          <div className="space-y-8">
            {events.map((event, idx) => {
              const isLeft = idx % 2 === 0;
              const colors = categoryColors[event.category] || categoryColors.Milestone;
              const Icon = iconMap[event.icon] || Star;
              const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              });
              const isToday = event.date === today;

              return (
                <div
                  key={event.id}
                  className="animate-fade-in relative flex items-center flex-col md:flex-row"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {/* Card */}
                  <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? "md:order-1" : "md:order-3"}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-300 card-hover">
                      <p className="text-xs font-medium text-slate-400 mb-2">{formattedDate}</p>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} mr-1 align-middle`} />
                              {event.category}
                            </span>
                            {event.impact && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 italic">{event.impact}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 md:order-2">
                    <div className={`w-8 h-8 rounded-full ${colors.line} flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className={`hidden md:block w-[calc(50%-2rem)] ${isLeft ? "md:order-3" : "md:order-1"}`} />
                </div>
              );
            })}

            {/* Today marker */}
            <div className="relative flex items-center justify-center">
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900">
                  <span className="text-white text-[10px] font-bold">T</span>
                </div>
              </div>
              <div className="hidden md:block w-full text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-semibold">
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center animate-scale-in">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Timeline Events</h3>
          <p className="text-sm text-slate-500">Start adding events to track your ESG journey.</p>
        </div>
      )}
    </div>
  );
}
