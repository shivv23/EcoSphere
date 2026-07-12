"use client";

import { Bell, Search, ChevronRight, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { trpc } from "@/lib/trpc/client";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/environmental": "Environmental",
  "/environmental/carbon": "Carbon Tracking",
  "/environmental/emission-factors": "Emission Factors",
  "/environmental/goals": "Environmental Goals",
  "/social": "Social",
  "/social/csr": "CSR Activities",
  "/social/csr/approve": "CSR Approval",
  "/social/participation": "Employee Participation",
  "/social/diversity": "Diversity Metrics",
  "/governance": "Governance",
  "/governance/policies": "ESG Policies",
  "/governance/audits": "Audits",
  "/governance/compliance": "Compliance Issues",
  "/gamification": "Gamification",
  "/gamification/challenges": "Challenges",
  "/gamification/challenges/approve": "Challenge Approval",
  "/gamification/badges": "Badges",
  "/gamification/rewards": "Rewards",
  "/gamification/leaderboard": "Leaderboard",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/admin": "Admin",
  "/admin/users": "User Management",
  "/admin/departments": "Department Management",
  "/admin/categories": "Category Management",
  "/benchmarking": "Industry Benchmarking",
  "/import": "Data Import",
  "/audit-trail": "Audit Trail",
  "/thresholds": "Alert Thresholds",
  "/recommendations": "Recommendations",
  "/timeline": "Impact Timeline",
  "/suppliers": "Supplier Directory",
  "/offset": "Carbon Offsets",
  "/calendar": "Compliance Calendar",
  "/onboarding": "Onboarding",
};

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const unreadCount = trpc.notification.unreadCount.useQuery(undefined, { refetchInterval: 30000 });
  const segments = pathname?.split("/").filter(Boolean) || [];
  const pageName = pageNames[pathname || ""] || "EcoSphere";

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            Home
          </Link>
          {segments.map((segment, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className={i === segments.length - 1 ? "text-gray-900 dark:text-gray-100 font-semibold" : "text-gray-400"}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-48"
            />
          </div>
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {(unreadCount.data ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                {unreadCount.data! > 99 ? "99+" : unreadCount.data}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
