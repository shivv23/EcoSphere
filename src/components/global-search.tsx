"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  Users,
  Shield,
  Leaf,
  Trophy,
  Calendar,
  Settings,
  ArrowRight,
  X,
  Command,
  Building2,
  CheckCircle,
  Target,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Grid3X3,
  Globe,
} from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ElementType;
  href: string;
};

const PAGES: SearchResult[] = [
  { id: "page-dashboard", title: "Dashboard", subtitle: "/dashboard", category: "PAGES", icon: LayoutDashboard, href: "/dashboard" },
  { id: "page-carbon", title: "Carbon Tracking", subtitle: "/environmental/carbon", category: "PAGES", icon: Leaf, href: "/environmental/carbon" },
  { id: "page-csr", title: "CSR Activities", subtitle: "/social/csr", category: "PAGES", icon: Users, href: "/social/csr" },
  { id: "page-policies", title: "Policies", subtitle: "/governance/policies", category: "PAGES", icon: FileText, href: "/governance/policies" },
  { id: "page-leaderboard", title: "Leaderboard", subtitle: "/gamification/leaderboard", category: "PAGES", icon: Trophy, href: "/gamification/leaderboard" },
  { id: "page-reports", title: "Reports", subtitle: "/reports", category: "PAGES", icon: BarChart3, href: "/reports" },
  { id: "page-settings", title: "Settings", subtitle: "/settings", category: "PAGES", icon: Settings, href: "/settings" },
  { id: "page-risk", title: "Risk Matrix", subtitle: "/risk", category: "PAGES", icon: Shield, href: "/risk" },
  { id: "page-simulator", title: "Simulator", subtitle: "/simulator", category: "PAGES", icon: Target, href: "/simulator" },
  { id: "page-frameworks", title: "Frameworks", subtitle: "/frameworks", category: "PAGES", icon: BookOpen, href: "/frameworks" },
  { id: "page-explorer", title: "Data Explorer", subtitle: "/explorer", category: "PAGES", icon: BarChart3, href: "/explorer" },
  { id: "page-documents", title: "Documents", subtitle: "/documents", category: "PAGES", icon: FileText, href: "/documents" },
  { id: "page-audit-schedule", title: "Audit Scheduler", subtitle: "/audit-schedule", category: "PAGES", icon: Calendar, href: "/audit-schedule" },
  { id: "page-materiality", title: "Materiality Matrix", subtitle: "/materiality", category: "PAGES", icon: Grid3X3, href: "/materiality" },
  { id: "page-stakeholder", title: "Stakeholder Portal", subtitle: "/stakeholder", category: "PAGES", icon: Globe, href: "/stakeholder" },
];

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; href: string; label: string }> = {
  DEPARTMENTS: { icon: Building2, href: "/admin/departments", label: "Departments" },
  USERS: { icon: Users, href: "/admin/users", label: "Users" },
  POLICIES: { icon: FileText, href: "/governance/policies", label: "Policies" },
  COMPLIANCE: { icon: Shield, href: "/governance/compliance", label: "Compliance" },
  AUDITS: { icon: CheckCircle, href: "/governance/audits", label: "Audits" },
  BADGES: { icon: Trophy, href: "/gamification/badges", label: "Badges" },
  CHALLENGES: { icon: Target, href: "/gamification/challenges", label: "Challenges" },
  PAGES: { icon: ArrowRight, href: "", label: "Pages" },
};

const CATEGORY_ORDER = [
  "DEPARTMENTS",
  "USERS",
  "POLICIES",
  "COMPLIANCE",
  "AUDITS",
  "BADGES",
  "CHALLENGES",
  "PAGES",
];

function matchesQuery(value: unknown, query: string): boolean {
  if (typeof value === "string") return value.toLowerCase().includes(query);
  if (typeof value === "number") return String(value).includes(query);
  return false;
}

function objectMatchesQuery(obj: Record<string, unknown>, query: string): boolean {
  return Object.values(obj).some((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string" || typeof v === "number") return matchesQuery(v, query);
    if (Array.isArray(v)) return v.some((item) => matchesQuery(item, query));
    if (typeof v === "object") return objectMatchesQuery(v as Record<string, unknown>, query);
    return false;
  });
}

function getStringField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (typeof obj[key] === "string" && obj[key]) return obj[key] as string;
  }
  return "";
}

export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

const SHORTCUTS = [
  { keys: "g d", description: "Go to Dashboard", href: "/dashboard" },
  { keys: "g r", description: "Go to Reports", href: "/reports" },
  { keys: "g s", description: "Go to Settings", href: "/settings" },
  { keys: "g a", description: "Go to Admin", href: "/admin" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      if (pendingKey) {
        if (timerRef.current) clearTimeout(timerRef.current);
        const combo = `${pendingKey} ${e.key}`;
        const shortcut = SHORTCUTS.find((s) => s.keys === combo);
        if (shortcut) {
          e.preventDefault();
          router.push(shortcut.href);
        }
        setPendingKey(null);
        return;
      }

      if (e.key === "g") {
        e.preventDefault();
        setPendingKey("g");
        timerRef.current = setTimeout(() => setPendingKey(null), 1000);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingKey, router]);

  if (!showHelp) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
        <button
          onClick={() => setShowHelp(false)}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
        <Command className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-500 dark:text-gray-400">K to open search</span>
      </div>
      <ul className="space-y-1.5">
        {SHORTCUTS.map((s) => (
          <li key={s.keys} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{s.description}</span>
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {s.keys.toUpperCase()}
            </kbd>
          </li>
        ))}
        <li className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Show shortcuts</span>
          <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
            ?
          </kbd>
        </li>
      </ul>
    </div>
  );
}

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: departments } = trpc.department.list.useQuery();
  const { data: users } = trpc.user.list.useQuery();
  const { data: policies } = trpc.policy.list.useQuery();
  const { data: compliance } = trpc.compliance.list.useQuery();
  const { data: audits } = trpc.audit.list.useQuery();
  const { data: badges } = trpc.badge.list.useQuery();
  const { data: challenges } = trpc.challenge.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const all: SearchResult[] = [];

    if (departments && Array.isArray(departments)) {
      for (const d of departments) {
        const obj = d as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `dept-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Department",
            subtitle: getStringField(obj, "description", "code", "email"),
            category: "DEPARTMENTS",
            icon: Building2,
            href: `${CATEGORY_CONFIG.DEPARTMENTS.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (users && Array.isArray(users)) {
      for (const u of users) {
        const obj = u as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `user-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "fullName", "username") || "User",
            subtitle: getStringField(obj, "email", "role", "department"),
            category: "USERS",
            icon: Users,
            href: `${CATEGORY_CONFIG.USERS.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (policies && Array.isArray(policies)) {
      for (const p of policies) {
        const obj = p as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `policy-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Policy",
            subtitle: getStringField(obj, "description", "category", "status"),
            category: "POLICIES",
            icon: FileText,
            href: `${CATEGORY_CONFIG.POLICIES.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (compliance && Array.isArray(compliance)) {
      for (const c of compliance) {
        const obj = c as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `compliance-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title", "framework") || "Compliance",
            subtitle: getStringField(obj, "description", "status", "category"),
            category: "COMPLIANCE",
            icon: Shield,
            href: `${CATEGORY_CONFIG.COMPLIANCE.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (audits && Array.isArray(audits)) {
      for (const a of audits) {
        const obj = a as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `audit-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Audit",
            subtitle: getStringField(obj, "description", "status", "date"),
            category: "AUDITS",
            icon: CheckCircle,
            href: `${CATEGORY_CONFIG.AUDITS.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (badges && Array.isArray(badges)) {
      for (const b of badges) {
        const obj = b as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `badge-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Badge",
            subtitle: getStringField(obj, "description", "category", "points"),
            category: "BADGES",
            icon: Trophy,
            href: `${CATEGORY_CONFIG.BADGES.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (challenges && Array.isArray(challenges)) {
      for (const ch of challenges) {
        const obj = ch as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `challenge-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Challenge",
            subtitle: getStringField(obj, "description", "category", "difficulty"),
            category: "CHALLENGES",
            icon: Target,
            href: `${CATEGORY_CONFIG.CHALLENGES.href}/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        const obj = cat as Record<string, unknown>;
        if (!q || objectMatchesQuery(obj, q)) {
          all.push({
            id: `cat-${getStringField(obj, "id", "_id")}`,
            title: getStringField(obj, "name", "title") || "Category",
            subtitle: getStringField(obj, "description", "type"),
            category: "PAGES",
            icon: ArrowRight,
            href: `/categories/${getStringField(obj, "id", "_id")}`,
          });
        }
      }
    }

    const pageResults: SearchResult[] = q
      ? PAGES.filter(
          (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
        )
      : PAGES;

    all.push(...pageResults);

    return all.slice(0, 20);
  }, [
    query,
    departments,
    users,
    policies,
    compliance,
    audits,
    badges,
    challenges,
    categories,
  ]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }
    return groups;
  }, [results]);

  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groupedResults[cat]) flat.push(...groupedResults[cat]);
    }
    return flat;
  }, [groupedResults]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigateTo = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          navigateTo(flatResults[selectedIndex].href);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }

  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-w-xl w-full mx-auto mt-[20vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything... (Ctrl+K)"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
          />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {flatResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="mb-3 h-8 w-8 opacity-40" />
              <p className="text-sm">No results found</p>
              {query && (
                <p className="mt-1 text-xs text-gray-300 dark:text-gray-500">
                  Try a different search term
                </p>
              )}
            </div>
          )}

          {CATEGORY_ORDER.map((cat) => {
            const items = groupedResults[cat];
            if (!items || items.length === 0) return null;
            const config = CATEGORY_CONFIG[cat];

            return (
              <div key={cat} className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <config.icon className="h-3 w-3 text-gray-400" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {config.label}
                  </span>
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-800">
                    {items.length}
                  </span>
                </div>

                {items.map((result) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isSelected = idx === selectedIndex;
                  const ResultIcon = result.icon;

                  return (
                    <button
                      key={result.id}
                      data-index={idx}
                      onClick={() => navigateTo(result.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isSelected
                            ? "bg-gray-900 text-white dark:bg-gray-700"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        )}
                      >
                        <ResultIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                            {result.subtitle}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-800">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-800">
                ↵
              </kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-800">
                esc
              </kbd>
              close
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-300 dark:text-gray-600">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
