"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Leaf,
  Users,
  Shield,
  Trophy,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Zap,
  Building2,
  Target,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Upload,
  Award,
  Rocket,
  History,
  Gauge,
  Sparkles,
  Clock,
  Truck,
  TreePine,
  Calendar,
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Grid3X3,
  Globe,
  CalendarClock,
  Activity,
  FileCode,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Environmental",
    href: "/environmental",
    icon: Leaf,
    children: [
      { name: "Carbon Tracking", href: "/environmental/carbon" },
      { name: "Emission Factors", href: "/environmental/emission-factors" },
      { name: "Goals", href: "/environmental/goals" },
    ],
  },
  {
    name: "Social",
    href: "/social",
    icon: Users,
    children: [
      { name: "CSR Activities", href: "/social/csr" },
      { name: "CSR Approval", href: "/social/csr/approve" },
      { name: "Participation", href: "/social/participation" },
      { name: "Diversity", href: "/social/diversity" },
    ],
  },
  {
    name: "Governance",
    href: "/governance",
    icon: Shield,
    children: [
      { name: "Policies", href: "/governance/policies" },
      { name: "Audits", href: "/governance/audits" },
      { name: "Compliance", href: "/governance/compliance" },
    ],
  },
  {
    name: "Gamification",
    href: "/gamification",
    icon: Trophy,
    children: [
      { name: "Challenges", href: "/gamification/challenges" },
      { name: "Challenge Approval", href: "/gamification/challenges/approve" },
      { name: "Badges", href: "/gamification/badges" },
      { name: "Rewards", href: "/gamification/rewards" },
      { name: "Leaderboard", href: "/gamification/leaderboard" },
    ],
  },
  { name: "Benchmarking", href: "/benchmarking", icon: Award },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Frameworks", href: "/frameworks", icon: BookOpen },
  { name: "Risk Matrix", href: "/risk", icon: AlertTriangle },
  { name: "Simulator", href: "/simulator", icon: Target },
  { name: "Deadlines", href: "/deadlines", icon: Clock },
  { name: "Data Import", href: "/import", icon: Upload },
  { name: "Audit Trail", href: "/audit-trail", icon: History },
  { name: "Thresholds", href: "/thresholds", icon: Gauge },
  { name: "Recommendations", href: "/recommendations", icon: Sparkles },
  { name: "Activity Feed", href: "/activity", icon: Activity },
  { name: "API Docs", href: "/api-docs", icon: FileCode },
  { name: "Impact Timeline", href: "/timeline", icon: Clock },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Carbon Offsets", href: "/offset", icon: TreePine },
  { name: "Materiality Matrix", href: "/materiality", icon: Grid3X3 },
  { name: "Stakeholder Portal", href: "/stakeholder", icon: Globe },
  { name: "Data Explorer", href: "/explorer", icon: BarChart3 },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Audit Scheduler", href: "/audit-schedule", icon: CalendarClock },
  { name: "Compliance Calendar", href: "/calendar", icon: Calendar },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  {
    name: "Admin",
    href: "/admin",
    icon: ShieldCheck,
    children: [
      { name: "Users", href: "/admin/users" },
      { name: "Departments", href: "/admin/departments" },
      { name: "Categories", href: "/admin/categories" },
    ],
  },
  { name: "Onboarding", href: "/onboarding", icon: Rocket },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">EcoSphere</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">ESG Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const isExpanded = expanded === item.name;
          const Icon = item.icon;

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700/50 pl-3">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            isChildActive
                              ? "bg-emerald-500/10 text-emerald-400 font-medium"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col bg-[#0f172a] dark:bg-[#0a0f1e]">
        <SidebarContent />
      </div>
    </>
  );
}
