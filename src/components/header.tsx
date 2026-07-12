"use client";

import { Bell, Search, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/environmental": "Environmental",
  "/environmental/carbon": "Carbon Tracking",
  "/environmental/emission-factors": "Emission Factors",
  "/environmental/goals": "Environmental Goals",
  "/social": "Social",
  "/social/csr": "CSR Activities",
  "/social/participation": "Employee Participation",
  "/social/diversity": "Diversity Metrics",
  "/governance": "Governance",
  "/governance/policies": "ESG Policies",
  "/governance/audits": "Audits",
  "/governance/compliance": "Compliance Issues",
  "/gamification": "Gamification",
  "/gamification/challenges": "Challenges",
  "/gamification/badges": "Badges",
  "/gamification/rewards": "Rewards",
  "/gamification/leaderboard": "Leaderboard",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const pageName = pageNames[pathname || ""] || "EcoSphere";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            Home
          </Link>
          {segments.map((segment, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className={i === segments.length - 1 ? "text-gray-900 font-semibold" : "text-gray-400"}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-48"
            />
          </div>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </div>
      </div>
    </header>
  );
}
