"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  FileCode,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Search,
  Copy,
  Check,
} from "lucide-react";

interface Procedure {
  name: string;
  type: "query" | "mutation";
  auth: boolean;
  description: string;
}

interface Router {
  name: string;
  description: string;
  procedures: Procedure[];
}

const ROUTERS: Router[] = [
  {
    name: "user",
    description: "User management — CRUD operations, role assignment",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all users with department info" },
      { name: "get", type: "query", auth: true, description: "Get user by ID" },
      { name: "create", type: "mutation", auth: true, description: "Create a new user" },
      { name: "update", type: "mutation", auth: true, description: "Update user details" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a user" },
    ],
  },
  {
    name: "department",
    description: "Department management and score calculations",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all departments" },
      { name: "listScores", type: "query", auth: true, description: "Get department ESG scores" },
      { name: "create", type: "mutation", auth: true, description: "Create a new department" },
      { name: "update", type: "mutation", auth: true, description: "Update department details" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a department" },
    ],
  },
  {
    name: "category",
    description: "Category management for CSR activities and challenges",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all categories" },
      { name: "create", type: "mutation", auth: true, description: "Create a new category" },
      { name: "update", type: "mutation", auth: true, description: "Update category" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a category" },
    ],
  },
  {
    name: "carbonTransaction",
    description: "Carbon emissions tracking and transaction management",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all carbon transactions" },
      { name: "create", type: "mutation", auth: true, description: "Record a new carbon transaction" },
      { name: "update", type: "mutation", auth: true, description: "Update a carbon transaction" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a carbon transaction" },
    ],
  },
  {
    name: "csrActivity",
    description: "Corporate social responsibility activities and approvals",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all CSR activities" },
      { name: "create", type: "mutation", auth: true, description: "Create a new CSR activity" },
      { name: "approve", type: "mutation", auth: true, description: "Approve a CSR activity" },
      { name: "reject", type: "mutation", auth: true, description: "Reject a CSR activity" },
    ],
  },
  {
    name: "challenge",
    description: "ESG challenges and participation management",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all challenges" },
      { name: "create", type: "mutation", auth: true, description: "Create a new challenge" },
      { name: "approve", type: "mutation", auth: true, description: "Approve challenge participation" },
      { name: "reject", type: "mutation", auth: true, description: "Reject challenge participation" },
    ],
  },
  {
    name: "compliance",
    description: "Compliance issues tracking and resolution",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all compliance issues" },
      { name: "create", type: "mutation", auth: true, description: "Create a compliance issue" },
      { name: "update", type: "mutation", auth: true, description: "Update compliance issue status" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a compliance issue" },
    ],
  },
  {
    name: "audit",
    description: "Audit management and scoring",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all audits" },
      { name: "create", type: "mutation", auth: true, description: "Create a new audit" },
      { name: "update", type: "mutation", auth: true, description: "Update audit details" },
      { name: "delete", type: "mutation", auth: true, description: "Delete an audit" },
    ],
  },
  {
    name: "policy",
    description: "ESG policy management and acknowledgement tracking",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all ESG policies" },
      { name: "create", type: "mutation", auth: true, description: "Create a new policy" },
      { name: "update", type: "mutation", auth: true, description: "Update policy details" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a policy" },
    ],
  },
  {
    name: "badge",
    description: "Badge definitions and assignment tracking",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all badges" },
      { name: "create", type: "mutation", auth: true, description: "Create a new badge" },
      { name: "update", type: "mutation", auth: true, description: "Update badge details" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a badge" },
    ],
  },
  {
    name: "reward",
    description: "Reward catalog and redemption management",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all rewards" },
      { name: "create", type: "mutation", auth: true, description: "Create a new reward" },
      { name: "redeem", type: "mutation", auth: true, description: "Redeem a reward" },
    ],
  },
  {
    name: "notification",
    description: "In-app notification management",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List user notifications" },
      { name: "unreadCount", type: "query", auth: true, description: "Get unread notification count" },
      { name: "create", type: "mutation", auth: true, description: "Create a notification" },
      { name: "markRead", type: "mutation", auth: true, description: "Mark notification as read" },
      { name: "markAllRead", type: "mutation", auth: true, description: "Mark all notifications as read" },
    ],
  },
  {
    name: "report",
    description: "ESG report generation across all pillars",
    procedures: [
      { name: "generate", type: "query", auth: true, description: "Generate report by type (SUMMARY, ENVIRONMENTAL, SOCIAL, GOVERNANCE)" },
    ],
  },
  {
    name: "settings",
    description: "Organization profile and system settings management",
    procedures: [
      { name: "getOrgProfile", type: "query", auth: true, description: "Get organization profile" },
      { name: "updateOrgProfile", type: "mutation", auth: true, description: "Update organization profile" },
      { name: "get", type: "query", auth: true, description: "Get system settings" },
      { name: "update", type: "mutation", auth: true, description: "Update system settings" },
    ],
  },
  {
    name: "dashboard",
    description: "Dashboard aggregations and KPI data",
    procedures: [
      { name: "kpis", type: "query", auth: true, description: "Get dashboard KPI metrics" },
    ],
  },
  {
    name: "benchmark",
    description: "Industry benchmarking data and company metrics",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List industry benchmarks" },
      { name: "companyMetrics", type: "query", auth: true, description: "Get company performance metrics" },
    ],
  },
  {
    name: "threshold",
    description: "Alert threshold configuration and breach detection",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List threshold configurations" },
      { name: "create", type: "mutation", auth: true, description: "Create a threshold config" },
      { name: "update", type: "mutation", auth: true, description: "Update a threshold config" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a threshold config" },
    ],
  },
  {
    name: "timeline",
    description: "ESG impact timeline events",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List timeline events" },
      { name: "create", type: "mutation", auth: true, description: "Create a timeline event" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a timeline event" },
    ],
  },
  {
    name: "supplier",
    description: "Supplier ESG scorecards and assessments",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List all suppliers" },
      { name: "create", type: "mutation", auth: true, description: "Add a new supplier" },
      { name: "assess", type: "mutation", auth: true, description: "Create a supplier assessment" },
      { name: "delete", type: "mutation", auth: true, description: "Delete a supplier" },
    ],
  },
  {
    name: "offset",
    description: "Carbon offset projects and purchase management",
    procedures: [
      { name: "listProjects", type: "query", auth: true, description: "List carbon offset projects" },
      { name: "purchase", type: "mutation", auth: true, description: "Purchase carbon offsets" },
      { name: "stats", type: "query", auth: true, description: "Get offset purchase statistics" },
    ],
  },
  {
    name: "calendar",
    description: "Compliance calendar event management",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List calendar events" },
      { name: "create", type: "mutation", auth: true, description: "Create a calendar event" },
    ],
  },
  {
    name: "emissionFactor",
    description: "Emission factor configuration for carbon calculations",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List emission factors" },
      { name: "create", type: "mutation", auth: true, description: "Create an emission factor" },
      { name: "update", type: "mutation", auth: true, description: "Update an emission factor" },
    ],
  },
  {
    name: "goal",
    description: "Environmental goals and target tracking",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List environmental goals" },
      { name: "create", type: "mutation", auth: true, description: "Create an environmental goal" },
      { name: "update", type: "mutation", auth: true, description: "Update goal progress" },
    ],
  },
  {
    name: "register",
    description: "Public user registration (no auth required)",
    procedures: [
      { name: "create", type: "mutation", auth: false, description: "Register a new user account" },
    ],
  },
  {
    name: "import",
    description: "CSV data import and bulk operations",
    procedures: [
      { name: "importData", type: "mutation", auth: true, description: "Import bulk data from CSV" },
    ],
  },
  {
    name: "auditLog",
    description: "System audit trail and activity logging",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List audit log entries" },
    ],
  },
  {
    name: "recommendation",
    description: "AI-powered ESG recommendations engine",
    procedures: [
      { name: "list", type: "query", auth: true, description: "Get ESG recommendations" },
    ],
  },
  {
    name: "widget",
    description: "Dashboard widget configuration and visibility",
    procedures: [
      { name: "list", type: "query", auth: true, description: "List user widget preferences" },
      { name: "update", type: "mutation", auth: true, description: "Update widget visibility/position" },
    ],
  },
];

function getTRPCCall(router: string, procedure: Procedure): string {
  const hook = procedure.type === "query" ? "useQuery" : "useMutation";
  return `trpc.${router}.${procedure.name}.${hook}()`;
}

export default function ApiDocsPage() {
  const [search, setSearch] = useState("");
  const [expandedRouters, setExpandedRouters] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<"all" | "query" | "mutation">("all");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const totalRouters = ROUTERS.length;
  const totalProcedures = ROUTERS.reduce((acc, r) => acc + r.procedures.length, 0);
  const totalQueries = ROUTERS.reduce(
    (acc, r) => acc + r.procedures.filter((p) => p.type === "query").length,
    0
  );
  const totalMutations = ROUTERS.reduce(
    (acc, r) => acc + r.procedures.filter((p) => p.type === "mutation").length,
    0
  );

  const filteredRouters = useMemo(() => {
    const query = search.toLowerCase().trim();
    return ROUTERS.filter((router) => {
      if (typeFilter !== "all") {
        const hasMatchingType = router.procedures.some((p) => p.type === typeFilter);
        if (!hasMatchingType) return false;
      }
      if (!query) return true;
      if (router.name.toLowerCase().includes(query)) return true;
      if (router.description.toLowerCase().includes(query)) return true;
      return router.procedures.some(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }).map((router) => {
      if (!search && typeFilter === "all") return router;
      const query = search.toLowerCase().trim();
      const filteredProcedures = router.procedures.filter((p) => {
        if (typeFilter !== "all" && p.type !== typeFilter) return false;
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      });
      return { ...router, procedures: filteredProcedures };
    });
  }, [search, typeFilter]);

  const toggleRouter = (name: string) => {
    setExpandedRouters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedRouters(new Set(ROUTERS.map((r) => r.name)));
  };

  const collapseAll = () => {
    setExpandedRouters(new Set());
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(id);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedEndpoint(id);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  const copyAllEndpoints = () => {
    const allEndpoints = ROUTERS.flatMap((router) =>
      router.procedures.map((p) => getTRPCCall(router.name, p))
    ).join("\n");
    copyToClipboard(allEndpoints, "all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-500 mt-1">
            tRPC router reference — {totalRouters} routers, {totalProcedures}+ procedures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Collapse All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Routers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalRouters}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Procedures</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalProcedures}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Queries</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalQueries}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Mutations</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{totalMutations}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routers, procedures, or descriptions..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "query", "mutation"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  typeFilter === filter
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {filter === "all" ? "All" : filter === "query" ? "Queries" : "Mutations"}
              </button>
            ))}
          </div>
          <button
            onClick={copyAllEndpoints}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              copiedEndpoint === "all"
                ? "bg-emerald-500 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800"
            )}
          >
            {copiedEndpoint === "all" ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All Endpoints
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRouters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <FileCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No routers match your search</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          filteredRouters.map((router) => {
            const isExpanded = expandedRouters.has(router.name);
            return (
              <div
                key={router.name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleRouter(router.name)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0">
                      <FileCode className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">
                          {router.name}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          {router.procedures.length} procedure{router.procedures.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{router.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-gray-400 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Procedure
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Auth
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Usage
                            </th>
                            <th className="w-12 px-5 py-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {router.procedures.map((proc) => {
                            const callStr = getTRPCCall(router.name, proc);
                            const procId = `${router.name}.${proc.name}`;
                            return (
                              <tr
                                key={proc.name}
                                className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors"
                              >
                                <td className="px-5 py-3.5">
                                  <span className="font-mono text-sm font-semibold text-gray-900">
                                    {proc.name}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={cn(
                                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                      proc.type === "query"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-emerald-100 text-emerald-700"
                                    )}
                                  >
                                    {proc.type}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  {proc.auth ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                      <Lock className="w-3 h-3" />
                                      Auth
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                      <Unlock className="w-3 h-3" />
                                      Public
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs">
                                  {proc.description}
                                </td>
                                <td className="px-5 py-3.5">
                                  <code className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                    {callStr}
                                  </code>
                                </td>
                                <td className="px-5 py-3.5">
                                  <button
                                    onClick={() => copyToClipboard(callStr, procId)}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-colors",
                                      copiedEndpoint === procId
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    )}
                                    title="Copy to clipboard"
                                  >
                                    {copiedEndpoint === procId ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Reference</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-16 text-xs font-semibold text-gray-400 uppercase">Query</span>
            <code className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              .useQuery()
            </code>
            <span className="text-gray-500">— Read operations, cached and deduplicated</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-16 text-xs font-semibold text-gray-400 uppercase">Mutation</span>
            <code className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              .useMutation()
            </code>
            <span className="text-gray-500">— Write operations, invalidates related queries</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-16 text-xs font-semibold text-gray-400 uppercase">Auth</span>
            <Lock className="w-3.5 h-3.5 mt-0.5 text-amber-500" />
            <span className="text-gray-500">— Requires authenticated session via JWT token</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-16 text-xs font-semibold text-gray-400 uppercase">Public</span>
            <Unlock className="w-3.5 h-3.5 mt-0.5 text-green-500" />
            <span className="text-gray-500">— No authentication required, open endpoint</span>
          </div>
        </div>
      </div>
    </div>
  );
}
