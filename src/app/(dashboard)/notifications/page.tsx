"use client";

import { trpc } from "@/lib/trpc/client";
import { Bell, CheckCircle, AlertTriangle, FileText, Trophy, Gift, CheckCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  COMPLIANCE_ISSUE: AlertTriangle,
  CSR_APPROVAL: CheckCircle,
  CHALLENGE_APPROVAL: Trophy,
  POLICY_REMINDER: FileText,
  BADGE_UNLOCK: Trophy,
  REWARD_REDEMPTION: Gift,
  GENERAL: Bell,
};

const typeColors: Record<string, string> = {
  COMPLIANCE_ISSUE: "from-red-500 to-rose-600",
  CSR_APPROVAL: "from-emerald-500 to-green-600",
  CHALLENGE_APPROVAL: "from-amber-500 to-orange-600",
  POLICY_REMINDER: "from-blue-500 to-indigo-600",
  BADGE_UNLOCK: "from-purple-500 to-violet-600",
  REWARD_REDEMPTION: "from-emerald-500 to-teal-600",
  GENERAL: "from-gray-500 to-gray-600",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = trpc.notification.list.useQuery(undefined, { refetchInterval: 15000 });
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, { refetchInterval: 15000 });
  const utils = trpc.useUtils();

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => { utils.notification.list.invalidate(); utils.notification.unreadCount.invalidate(); },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => { toast.success("All marked as read"); utils.notification.list.invalidate(); utils.notification.unreadCount.invalidate(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount || 0} unread notifications</p>
        </div>
        <button onClick={() => markAllRead.mutate()} disabled={!unreadCount} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
          <CheckCheck className="w-4 h-4" />Mark All Read
        </button>
      </div>

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 h-20 animate-pulse" />) :
          notifications && notifications.length > 0 ? notifications.map((n: any) => {
            const Icon = typeIcons[n.type] || Bell;
            const color = typeColors[n.type] || "from-gray-500 to-gray-600";
            return (
              <div key={n.id} className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all flex items-start gap-4 ${!n.read ? "border-l-4 border-l-emerald-500 bg-emerald-50/20" : "border-gray-100"}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}><Icon className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead.mutate({ id: n.id })} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          }) : (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No notifications yet</p>
            </div>
          )}
      </div>
    </div>
  );
}
