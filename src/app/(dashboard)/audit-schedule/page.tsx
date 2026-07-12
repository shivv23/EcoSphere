"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Repeat,
  Trash2,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AuditSchedule {
  id: string;
  title: string;
  type: "INTERNAL" | "EXTERNAL" | "REGULATORY" | "SUPPLIER";
  frequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  nextDate: string;
  lastCompleted?: string;
  department?: string;
  auditor?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const STORAGE_KEY = "ecosphere-audit-schedules";

const TYPE_LABELS: Record<string, string> = {
  INTERNAL: "Internal",
  EXTERNAL: "External",
  REGULATORY: "Regulatory",
  SUPPLIER: "Supplier",
};

const FREQ_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SEMI_ANNUAL: "Semi-Annual",
  ANNUAL: "Annual",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
};

const TYPE_COLORS: Record<string, string> = {
  INTERNAL: "bg-blue-500",
  EXTERNAL: "bg-purple-500",
  REGULATORY: "bg-red-500",
  SUPPLIER: "bg-teal-500",
};

const TYPE_BADGE: Record<string, string> = {
  INTERNAL: "bg-blue-100 text-blue-700",
  EXTERNAL: "bg-purple-100 text-purple-700",
  REGULATORY: "bg-red-100 text-red-700",
  SUPPLIER: "bg-teal-100 text-teal-700",
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-gray-100 text-gray-600",
};

const SEED_DATA: AuditSchedule[] = [
  {
    id: "seed-1",
    title: "Quarterly Safety Audit",
    type: "INTERNAL",
    frequency: "QUARTERLY",
    nextDate: "2026-07-15",
    department: "Operations",
    auditor: "Sarah Chen",
    status: "SCHEDULED",
    description: "Comprehensive safety inspection of all facilities and equipment.",
    priority: "MEDIUM",
  },
  {
    id: "seed-2",
    title: "Annual Financial Audit",
    type: "EXTERNAL",
    frequency: "ANNUAL",
    nextDate: "2026-09-01",
    department: "Finance",
    auditor: "Deloitte LLP",
    status: "SCHEDULED",
    description: "Year-end financial statement audit by external auditors.",
    priority: "HIGH",
  },
  {
    id: "seed-3",
    title: "Monthly Compliance Check",
    type: "REGULATORY",
    frequency: "MONTHLY",
    nextDate: "2026-07-20",
    department: "Legal",
    auditor: "James Rivera",
    status: "SCHEDULED",
    description: "Monthly review of regulatory compliance across all departments.",
    priority: "HIGH",
  },
  {
    id: "seed-4",
    title: "Semi-annual Supplier Audit",
    type: "SUPPLIER",
    frequency: "SEMI_ANNUAL",
    nextDate: "2026-08-10",
    department: "Procurement",
    auditor: "Maria Lopez",
    status: "SCHEDULED",
    description: "Evaluate supplier quality standards, delivery, and compliance.",
    priority: "MEDIUM",
  },
  {
    id: "seed-5",
    title: "Annual Environmental Audit",
    type: "INTERNAL",
    frequency: "ANNUAL",
    nextDate: "2026-10-01",
    department: "Sustainability",
    auditor: "Dr. Aisha Patel",
    status: "SCHEDULED",
    description: "Assess environmental impact and sustainability metrics.",
    priority: "HIGH",
  },
  {
    id: "seed-6",
    title: "Quarterly Data Privacy Audit",
    type: "REGULATORY",
    frequency: "QUARTERLY",
    nextDate: "2026-07-25",
    department: "IT",
    auditor: "Tom Nguyen",
    status: "SCHEDULED",
    description: "Review data handling practices and GDPR/CCPA compliance.",
    priority: "MEDIUM",
  },
  {
    id: "seed-7",
    title: "Monthly Fire Safety Inspection",
    type: "INTERNAL",
    frequency: "MONTHLY",
    nextDate: "2026-07-08",
    department: "Facilities",
    auditor: "Fire Marshal Office",
    status: "SCHEDULED",
    description: "Monthly fire safety equipment and evacuation route inspection.",
    priority: "LOW",
  },
];

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function calculateNextDate(current: string, frequency: AuditSchedule["frequency"]): string {
  const d = new Date(current);
  switch (frequency) {
    case "MONTHLY":
      d.setDate(d.getDate() + 30);
      break;
    case "QUARTERLY":
      d.setDate(d.getDate() + 90);
      break;
    case "SEMI_ANNUAL":
      d.setDate(d.getDate() + 180);
      break;
    case "ANNUAL":
      d.setDate(d.getDate() + 365);
      break;
  }
  return d.toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EMPTY_FORM: Omit<AuditSchedule, "id"> = {
  title: "",
  type: "INTERNAL",
  frequency: "QUARTERLY",
  nextDate: new Date().toISOString().split("T")[0],
  department: "",
  auditor: "",
  status: "SCHEDULED",
  description: "",
  priority: "MEDIUM",
};

export default function AuditSchedulePage() {
  const [schedules, setSchedules] = useState<AuditSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSchedules(JSON.parse(stored));
      } else {
        setSchedules(SEED_DATA);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      }
    } catch {
      setSchedules(SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules, loaded]);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const totalScheduled = useMemo(
    () => schedules.filter((s) => s.status === "SCHEDULED").length,
    [schedules]
  );

  const dueThisMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return schedules.filter((s) => {
      if (s.status === "COMPLETED") return false;
      const d = new Date(s.nextDate);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [schedules]);

  const completedCount = useMemo(
    () => schedules.filter((s) => s.status === "COMPLETED").length,
    [schedules]
  );

  const overdueCount = useMemo(() => {
    return schedules.filter((s) => {
      if (s.status === "COMPLETED") return false;
      return s.nextDate < today;
    }).length;
  }, [schedules, today]);

  const auditsByDate = useMemo(() => {
    const map: Record<string, AuditSchedule[]> = {};
    schedules.forEach((s) => {
      if (!map[s.nextDate]) map[s.nextDate] = [];
      map[s.nextDate].push(s);
    });
    return map;
  }, [schedules]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        day,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({
        day: d,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  const selectedDateAudits = useMemo(() => {
    if (!selectedDate) return [];
    return auditsByDate[selectedDate] || [];
  }, [selectedDate, auditsByDate]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const handleFormChange = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editingId) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
    } else {
      const newSchedule: AuditSchedule = {
        ...form,
        id: generateId(),
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (schedule: AuditSchedule) => {
    setForm({
      title: schedule.title,
      type: schedule.type,
      frequency: schedule.frequency,
      nextDate: schedule.nextDate,
      department: schedule.department || "",
      auditor: schedule.auditor || "",
      status: schedule.status,
      description: schedule.description,
      priority: schedule.priority,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    if (selectedDate) {
      const remaining = schedules.filter(
        (s) => s.id !== id && s.nextDate === selectedDate
      );
      if (remaining.length === 0) setSelectedDate(null);
    }
  };

  const handleMarkComplete = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextDate = calculateNextDate(s.nextDate, s.frequency);
        return {
          ...s,
          status: "SCHEDULED" as const,
          lastCompleted: s.nextDate,
          nextDate,
        };
      })
    );
  };

  const handleCancelForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-emerald-600" />
              Audit Scheduler
            </h1>
            <p className="text-gray-500 mt-1">Schedule and track recurring audits</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                setForm(EMPTY_FORM);
                setEditingId(null);
                setShowForm(true);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              showForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            )}
          >
            {showForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                New Audit
              </>
            )}
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {editingId ? (
                <Edit className="h-5 w-5 text-amber-600" />
              ) : (
                <Plus className="h-5 w-5 text-emerald-600" />
              )}
              {editingId ? "Edit Audit Schedule" : "Create Audit Schedule"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="e.g. Quarterly Safety Audit"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleFormChange("type", e.target.value as AuditSchedule["type"])
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="EXTERNAL">External</option>
                  <option value="REGULATORY">Regulatory</option>
                  <option value="SUPPLIER">Supplier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    handleFormChange(
                      "frequency",
                      e.target.value as AuditSchedule["frequency"]
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SEMI_ANNUAL">Semi-Annual</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    handleFormChange(
                      "priority",
                      e.target.value as AuditSchedule["priority"]
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Date</label>
                <input
                  type="date"
                  value={form.nextDate}
                  onChange={(e) => handleFormChange("nextDate", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleFormChange("department", e.target.value)}
                  placeholder="e.g. Operations"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auditor</label>
                <input
                  type="text"
                  value={form.auditor}
                  onChange={(e) => handleFormChange("auditor", e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Describe the audit scope and objectives..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                  form.title.trim()
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <CheckCircle className="h-4 w-4" />
                {editingId ? "Update Schedule" : "Save Schedule"}
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Scheduled</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalScheduled}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Due This Month</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{dueThisMonth}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{overdueCount}</p>
              </div>
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  overdueCount > 0
                    ? "bg-red-50 animate-pulse"
                    : "bg-red-50"
                )}
              >
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              const dayAudits = auditsByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === today;
              const isSelected = cell.dateStr === selectedDate;
              const visibleDots = dayAudits.slice(0, 3);
              const extraCount = dayAudits.length - 3;

              return (
                <button
                  key={idx}
                  onClick={() =>
                    setSelectedDate(
                      selectedDate === cell.dateStr ? null : cell.dateStr
                    )
                  }
                  className={cn(
                    "relative bg-white p-2 min-h-[72px] text-left transition-all hover:bg-gray-50",
                    !cell.isCurrentMonth && "bg-gray-50/50",
                    isSelected && "bg-emerald-50",
                    dayAudits.length > 0 && cell.isCurrentMonth && !isSelected && "bg-emerald-50/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                      isToday && "ring-2 ring-emerald-500 text-emerald-700 font-bold",
                      !isToday && cell.isCurrentMonth && "text-gray-900",
                      !cell.isCurrentMonth && "text-gray-300"
                    )}
                  >
                    {cell.day}
                  </span>
                  {dayAudits.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {visibleDots.map((audit) => (
                        <span
                          key={audit.id}
                          className={cn("w-2 h-2 rounded-full", TYPE_COLORS[audit.type])}
                          title={audit.title}
                        />
                      ))}
                      {extraCount > 0 && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Audits */}
          {selectedDate && selectedDateAudits.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Audits on {formatDate(selectedDate)}
              </h3>
              <div className="space-y-2">
                {selectedDateAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn("w-3 h-3 rounded-full", TYPE_COLORS[audit.type])}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{audit.title}</p>
                        <p className="text-xs text-gray-500">
                          {TYPE_LABELS[audit.type]} · {PRIORITY_LABELS[audit.priority]} Priority
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        STATUS_BADGE[audit.status]
                      )}
                    >
                      {STATUS_LABELS[audit.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedDateAudits.length === 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-400 text-center py-2">
                No audits scheduled on {formatDate(selectedDate)}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="font-medium">Legend:</span>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
                {TYPE_LABELS[type]}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Repeat className="h-5 w-5 text-emerald-600" />
              All Audit Schedules
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mt-4">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Frequency
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Next Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Priority
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No audit schedules found. Click &quot;New Audit&quot; to create one.
                    </td>
                  </tr>
                )}
                {schedules.map((schedule) => {
                  const isOverdue =
                    schedule.status !== "COMPLETED" && schedule.nextDate < today;
                  return (
                    <tr
                      key={schedule.id}
                      className={cn(
                        "border-b border-gray-50 hover:bg-gray-50 transition-colors",
                        isOverdue && "bg-red-50/30"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-full flex-shrink-0",
                              TYPE_COLORS[schedule.type]
                            )}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {schedule.title}
                            </p>
                            {schedule.auditor && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {schedule.auditor}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                            TYPE_BADGE[schedule.type]
                          )}
                        >
                          {TYPE_LABELS[schedule.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {FREQ_LABELS[schedule.frequency]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-sm",
                            isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                          )}
                        >
                          {formatDate(schedule.nextDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                            STATUS_BADGE[
                              isOverdue ? "OVERDUE" : schedule.status
                            ]
                          )}
                        >
                          {STATUS_LABELS[isOverdue ? "OVERDUE" : schedule.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                            PRIORITY_BADGE[schedule.priority]
                          )}
                        >
                          {PRIORITY_LABELS[schedule.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleMarkComplete(schedule.id)}
                            className="p-1.5 rounded-lg hover:bg-green-100 transition-colors group"
                            title="Mark Complete"
                          >
                            <CheckCircle className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors group"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 transition-colors group"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
