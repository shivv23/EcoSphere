"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Leaf, Users, Shield, Trophy, FileText, Settings, Bell, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

const tabs = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Env", href: "/environmental", icon: Leaf },
  { name: "Social", href: "/social", icon: Users },
  { name: "Gov", href: "/governance", icon: Shield },
  { name: "Game", href: "/gamification", icon: Trophy },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "More", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const unreadCount = trpc.notification.unreadCount.useQuery(undefined, { refetchInterval: 30000 });
  const unread = unreadCount.data ?? 0;

  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          const isMore = tab.name === "More";
          return (
            <Link key={tab.href} href={tab.href} className={cn("relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors min-w-0", active ? "text-emerald-500" : "text-gray-400")}>
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {isMore && unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold px-0.5">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[48px]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
