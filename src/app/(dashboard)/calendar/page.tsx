"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle,
  FileText, Users, Trophy, Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { color: string; dot: string; icon: typeof CalendarIcon; label: string }> = {
  Audit: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500", icon: Clock, label: "Audit" },
  Compliance: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500", icon: AlertTriangle, label: "Compliance" },
  Policy: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", dot: "bg-purple-500", icon: FileText, label: "Policy" },
  CSR: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500", icon: Users, label: "CSR" },
  Challenge: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500", icon: Trophy, label: "Challenge" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  const { data: events, isLoading } = trpc.calendar.events.useQuery({
    month: month + 1,
    year,
  });

  const eventsByDay = useMemo(() => {
    if (!events) return {};
    const map: Record<number, typeof events> = {};
    events.forEach((event) => {
      const d = new Date(event.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });
    return map;
  }, [events, month, year]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate || !events) return [];
    return events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [selectedDate, events]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const goToPrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentMonth(new Date()); setSelectedDate(new Date()); };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate &&
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track audits, compliance deadlines, and ESG activities</p>
        </div>
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all text-sm"
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={goToPrevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={goToNextMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20" />;
            }

            const dayEvents = eventsByDay[day] || [];
            const todayFlag = isToday(day);
            const selectedFlag = isSelected(day);

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`min-h-[80px] border-b border-r border-gray-50 dark:border-gray-800 p-1.5 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  selectedFlag ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                      todayFlag
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-700"
                        : selectedFlag
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </span>
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => {
                    const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.Audit;
                    return (
                      <span
                        key={event.id}
                        className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        title={event.title}
                      />
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-0.5">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-2">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
              Close
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : selectedDayEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => {
                const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.Audit;
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{event.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{event.type}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(event.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No events on this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
