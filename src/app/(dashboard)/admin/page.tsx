"use client";

import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { ShieldCheck, Users, Building2, Tag, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: users, isLoading: loadingUsers } = trpc.user.list.useQuery();
  const { data: departments, isLoading: loadingDepts } = trpc.department.list.useQuery();
  const { data: categories, isLoading: loadingCats } = trpc.category.list.useQuery({});

  const statCards = [
    {
      label: "Total Users",
      value: users?.length ?? 0,
      isLoading: loadingUsers,
      href: "/admin/users",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Departments",
      value: departments?.length ?? 0,
      isLoading: loadingDepts,
      href: "/admin/departments",
      icon: Building2,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Categories",
      value: categories?.length ?? 0,
      isLoading: loadingCats,
      href: "/admin/categories",
      icon: Tag,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const managementLinks = [
    {
      name: "User Management",
      description: "Manage users, roles, and department assignments",
      href: "/admin/users",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "Department Management",
      description: "Create and manage organizational departments",
      href: "/admin/departments",
      icon: Building2,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      name: "Category Management",
      description: "Manage CSR activity and challenge categories",
      href: "/admin/categories",
      icon: Tag,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Manage users, departments, and categories
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 card-hover group animate-scale-in"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              {stat.isLoading ? (
                <div className="h-8 w-16 mt-1 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {managementLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 card-hover group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-emerald-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                <div className="flex items-center gap-1 mt-3 text-sm text-emerald-600 font-medium">
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
