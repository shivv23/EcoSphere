"use client";

import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Table,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";

type DataSourceKey = "carbon" | "csr" | "compliance" | "audit" | "policy" | "challenge";

type SortDir = "asc" | "desc";

interface SortState {
  column: string;
  direction: SortDir;
}

interface FilterState {
  search: string;
  status: string;
  dateStart: string;
  dateEnd: string;
  columnFilters: Record<string, string>;
}

const PER_PAGE_OPTIONS = [10, 25, 50];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600",
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-gray-100 text-gray-600",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
  Scheduled: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const DATA_SOURCE_LABELS: Record<DataSourceKey, string> = {
  carbon: "Carbon Transactions",
  csr: "CSR Activities",
  compliance: "Compliance",
  audit: "Audits",
  policy: "Policies",
  challenge: "Challenges",
};

interface ColumnDef {
  key: string;
  label: string;
  accessor: (row: any) => string | number | null | undefined;
  dateField?: boolean;
}

function getStatusBadgeClass(value: string): string {
  if (!value) return "bg-gray-100 text-gray-600";
  const upper = String(value).toUpperCase().replace(/ /g, "_");
  return STATUS_COLORS[upper] || STATUS_COLORS[value] || "bg-gray-100 text-gray-600";
}

function formatDate(val: any): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const COLUMN_DEFINITIONS: Record<DataSourceKey, ColumnDef[]> = {
  carbon: [
    { key: "date", label: "Date", accessor: (r) => formatDate(r.date), dateField: true },
    { key: "department", label: "Department", accessor: (r) => r.department?.name ?? "—" },
    { key: "source", label: "Category", accessor: (r) => r.source ?? "—" },
    { key: "quantity", label: "Quantity", accessor: (r) => r.quantity ?? 0 },
    { key: "unit", label: "Unit", accessor: (r) => r.emissionFactor?.unit ?? "tCO2e" },
    { key: "scope", label: "Scope", accessor: (r) => `Scope ${r.scope}` },
    { key: "totalEmissions", label: "Emissions (tCO2e)", accessor: (r) => r.totalEmissions?.toFixed(2) ?? "0.00" },
  ],
  csr: [
    { key: "date", label: "Date", accessor: (r) => formatDate(r.date), dateField: true },
    { key: "title", label: "Title", accessor: (r) => r.title ?? "—" },
    { key: "department", label: "Department", accessor: (r) => r.department?.name ?? "—" },
    { key: "category", label: "Category", accessor: (r) => r.category?.name ?? "—" },
    { key: "status", label: "Status", accessor: (r) => r.status ?? "—" },
    { key: "points", label: "Points", accessor: (r) => r.pointsEarned ?? 0 },
    { key: "participants", label: "Participants", accessor: (r) => r._count?.participations ?? 0 },
  ],
  compliance: [
    { key: "title", label: "Title", accessor: (r) => r.title ?? "—" },
    { key: "severity", label: "Severity", accessor: (r) => r.severity ?? "—" },
    { key: "status", label: "Status", accessor: (r) => r.status ?? "—" },
    { key: "owner", label: "Owner", accessor: (r) => r.owner?.name ?? "—" },
    { key: "dueDate", label: "Due Date", accessor: (r) => formatDate(r.dueDate), dateField: true },
    { key: "createdAt", label: "Created", accessor: (r) => formatDate(r.createdAt), dateField: true },
  ],
  audit: [
    { key: "title", label: "Title", accessor: (r) => r.title ?? "—" },
    { key: "type", label: "Type", accessor: (r) => r.status ?? "—" },
    { key: "auditDate", label: "Date", accessor: (r) => formatDate(r.auditDate), dateField: true },
    { key: "score", label: "Score", accessor: (r) => r.score ?? "—" },
    { key: "status", label: "Status", accessor: (r) => r.status ?? "—" },
    { key: "auditor", label: "Auditor", accessor: (r) => r.auditor ?? "System" },
  ],
  policy: [
    { key: "title", label: "Title", accessor: (r) => r.title ?? "—" },
    { key: "category", label: "Category", accessor: (r) => r.category ?? "—" },
    { key: "version", label: "Version", accessor: (r) => r.version ?? "—" },
    { key: "status", label: "Status", accessor: (r) => (r.status ? "Active" : "Inactive") },
    { key: "effectiveDate", label: "Effective Date", accessor: (r) => formatDate(r.effectiveDate), dateField: true },
  ],
  challenge: [
    { key: "title", label: "Title", accessor: (r) => r.title ?? "—" },
    { key: "type", label: "Type", accessor: (r) => r.category?.name ?? "—" },
    { key: "difficulty", label: "Difficulty", accessor: (r) => r.difficulty ?? "—" },
    { key: "status", label: "Status", accessor: (r) => r.status ?? "—" },
    { key: "startDate", label: "Start Date", accessor: (r) => formatDate(r.createdAt), dateField: true },
    { key: "endDate", label: "End Date", accessor: (r) => formatDate(r.deadline), dateField: true },
    { key: "xp", label: "XP", accessor: (r) => r.xpReward ?? 0 },
  ],
};

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<DataSourceKey>("carbon");
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    dateStart: "",
    dateEnd: "",
    columnFilters: {},
  });

  const carbonQuery = trpc.carbonTransaction.list.useQuery({});
  const csrQuery = trpc.csrActivity.list.useQuery({});
  const complianceQuery = trpc.compliance.list.useQuery({});
  const auditQuery = trpc.audit.list.useQuery({});
  const policyQuery = trpc.policy.list.useQuery({});
  const challengeQuery = trpc.challenge.list.useQuery({});
  const departmentQuery = trpc.department.list.useQuery();

  const queryMap: Record<DataSourceKey, { data: any[] | undefined; isLoading: boolean }> = {
    carbon: { data: carbonQuery.data as any[], isLoading: carbonQuery.isLoading },
    csr: { data: csrQuery.data as any[], isLoading: csrQuery.isLoading },
    compliance: { data: complianceQuery.data as any[], isLoading: complianceQuery.isLoading },
    audit: { data: auditQuery.data as any[], isLoading: auditQuery.isLoading },
    policy: { data: policyQuery.data as any[], isLoading: policyQuery.isLoading },
    challenge: { data: challengeQuery.data as any[], isLoading: challengeQuery.isLoading },
  };

  const currentData = queryMap[activeTab];
  const columns = COLUMN_DEFINITIONS[activeTab];

  const availableStatuses = useMemo(() => {
    const data = currentData.data ?? [];
    const statuses = new Set<string>();
    data.forEach((row: any) => {
      if (row.status) statuses.add(String(row.status));
      if (row.severity) statuses.add(String(row.severity));
    });
    return Array.from(statuses).sort();
  }, [currentData.data]);

  const filteredData = useMemo(() => {
    let rows = [...(currentData.data ?? [])];
    const search = filters.search.toLowerCase().trim();

    if (search) {
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = col.accessor(row);
          return val !== null && val !== undefined && String(val).toLowerCase().includes(search);
        })
      );
    }

    if (filters.status) {
      rows = rows.filter((row) => {
        if (row.status && String(row.status).toUpperCase() === filters.status.toUpperCase()) return true;
        if (row.severity && String(row.severity).toUpperCase() === filters.status.toUpperCase()) return true;
        return false;
      });
    }

    if (filters.dateStart) {
      const start = new Date(filters.dateStart);
      if (!isNaN(start.getTime())) {
        rows = rows.filter((row) => {
          const dateCol = columns.find((c) => c.dateField);
          if (!dateCol) return true;
          const raw = row[dateCol.key === "date" ? "date" : dateCol.key === "startDate" ? "createdAt" : dateCol.key === "dueDate" ? "dueDate" : dateCol.key === "auditDate" ? "auditDate" : dateCol.key === "endDate" ? "deadline" : dateCol.key === "effectiveDate" ? "effectiveDate" : "createdAt"];
          if (!raw) return true;
          return new Date(raw) >= start;
        });
      }
    }

    if (filters.dateEnd) {
      const end = new Date(filters.dateEnd);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        rows = rows.filter((row) => {
          const dateCol = columns.find((c) => c.dateField);
          if (!dateCol) return true;
          const raw = row[dateCol.key === "date" ? "date" : dateCol.key === "startDate" ? "createdAt" : dateCol.key === "dueDate" ? "dueDate" : dateCol.key === "auditDate" ? "auditDate" : dateCol.key === "endDate" ? "deadline" : dateCol.key === "effectiveDate" ? "effectiveDate" : "createdAt"];
          if (!raw) return true;
          return new Date(raw) <= end;
        });
      }
    }

    Object.entries(filters.columnFilters).forEach(([colKey, filterVal]) => {
      if (!filterVal) return;
      const fLower = filterVal.toLowerCase();
      rows = rows.filter((row) => {
        const col = columns.find((c) => c.key === colKey);
        if (!col) return true;
        const val = col.accessor(row);
        return val !== null && val !== undefined && String(val).toLowerCase().includes(fLower);
      });
    });

    if (sort) {
      const col = columns.find((c) => c.key === sort.column);
      if (col) {
        rows.sort((a, b) => {
          const aVal = col.accessor(a);
          const bVal = col.accessor(b);
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          const aNum = Number(aVal);
          const bNum = Number(bVal);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
          }
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (aStr < bStr) return sort.direction === "asc" ? -1 : 1;
          if (aStr > bStr) return sort.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return rows;
  }, [currentData.data, columns, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * perPage, safePage * perPage);

  const handleSort = useCallback(
    (colKey: string) => {
      setSort((prev) => {
        if (prev?.column === colKey) {
          if (prev.direction === "asc") return { column: colKey, direction: "desc" };
          return null;
        }
        return { column: colKey, direction: "asc" };
      });
      setPage(1);
    },
    []
  );

  const handleSearch = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, search: val }));
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, status: val }));
    setPage(1);
  }, []);

  const handleDateStart = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, dateStart: val }));
    setPage(1);
  }, []);

  const handleDateEnd = useCallback((val: string) => {
    setFilters((prev) => ({ ...prev, dateEnd: val }));
    setPage(1);
  }, []);

  const handleColumnFilter = useCallback((colKey: string, val: string) => {
    setFilters((prev) => ({
      ...prev,
      columnFilters: { ...prev.columnFilters, [colKey]: val },
    }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", status: "", dateStart: "", dateEnd: "", columnFilters: {} });
    setSort(null);
    setPage(1);
  }, []);

  const handleTabChange = useCallback((tab: DataSourceKey) => {
    setActiveTab(tab);
    setSort(null);
    setFilters({ search: "", status: "", dateStart: "", dateEnd: "", columnFilters: {} });
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.dateStart) count++;
    if (filters.dateEnd) count++;
    Object.values(filters.columnFilters).forEach((v) => {
      if (v) count++;
    });
    return count;
  }, [filters]);

  const exportRows = useMemo(() => {
    return filteredData.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        obj[col.label] = col.accessor(row) ?? "";
      });
      return obj;
    });
  }, [filteredData, columns]);

  const handleExportCSV = useCallback(() => {
    if (!exportRows.length) return;
    const headers = columns.map((c) => c.label);
    const csvLines = [headers.join(",")];
    exportRows.forEach((row) => {
      csvLines.push(
        headers
          .map((h) => {
            const val = String(row[h] ?? "");
            return val.includes(",") || val.includes('"') || val.includes("\n")
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(",")
      );
    });
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esg-explorer-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportRows, columns, activeTab]);

  const handleExportExcel = useCallback(() => {
    if (!exportRows.length) return;
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const colWidths = columns.map((c) => ({
      wch: Math.max(c.label.length, ...exportRows.map((r) => String(r[c.label] ?? "").length)) + 2,
    }));
    ws["!cols"] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, DATA_SOURCE_LABELS[activeTab]);
    XLSX.writeFile(wb, `esg-explorer-${activeTab}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [exportRows, columns, activeTab]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG Data Explorer</h1>
          <p className="text-gray-500 mt-1">
            Query, filter, and analyze all ESG data in one place
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Source Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            "carbon",
            "csr",
            "compliance",
            "audit",
            "policy",
            "challenge",
          ] as DataSourceKey[]
        ).map((tab) => {
          const q = queryMap[tab];
          const count = q.data?.length ?? 0;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <Table className="w-4 h-4" />
              {DATA_SOURCE_LABELS[tab]}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search across all columns..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateStart}
              onChange={(e) => handleDateStart(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
              title="Start date"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={(e) => handleDateEnd(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all"
              title="End date"
            />
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                Search: &ldquo;{filters.search}&rdquo;
                <button
                  onClick={() => handleSearch("")}
                  className="ml-0.5 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                Status: {filters.status}
                <button
                  onClick={() => handleStatusFilter("")}
                  className="ml-0.5 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateStart && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                From: {filters.dateStart}
                <button
                  onClick={() => handleDateStart("")}
                  className="ml-0.5 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateEnd && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                To: {filters.dateEnd}
                <button
                  onClick={() => handleDateEnd("")}
                  className="ml-0.5 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
            {Object.entries(filters.columnFilters).map(([key, val]) =>
              val ? (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                >
                  {columns.find((c) => c.key === key)?.label}: {val}
                  <button
                    onClick={() => handleColumnFilter(key, "")}
                    className="ml-0.5 hover:text-gray-900"
                  >
                    ×
                  </button>
                </span>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Summary Bar + Export Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-900">{filteredData.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{(currentData.data ?? []).length}</span>{" "}
            {DATA_SOURCE_LABELS[activeTab].toLowerCase()}
          </span>
          {sort && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
              Sorted by {columns.find((c) => c.key === sort.column)?.label}{" "}
              {sort.direction === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!exportRows.length}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!exportRows.length}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/80">
                {columns.map((col) => {
                  const isSorted = sort?.column === col.key;
                  return (
                    <th key={col.key} className="sticky top-0 z-10">
                      <div className="flex flex-col gap-1.5 px-4 py-3">
                        <button
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors select-none"
                        >
                          {col.label}
                          <ArrowUpDown
                            className={cn(
                              "w-3.5 h-3.5 shrink-0",
                              isSorted ? "text-gray-900" : "text-gray-300"
                            )}
                          />
                          {isSorted && (
                            sort!.direction === "asc" ? (
                              <ChevronUp className="w-3 h-3 text-gray-900" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-900" />
                            )
                          )}
                        </button>
                        <input
                          type="text"
                          value={filters.columnFilters[col.key] ?? ""}
                          onChange={(e) => handleColumnFilter(col.key, e.target.value)}
                          placeholder="Filter..."
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all w-full"
                        />
                      </div>
                      <div className="h-px bg-gray-200" />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {currentData.isLoading ? (
                Array.from({ length: Math.min(perPage, 5) }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row: any, idx: number) => (
                  <tr
                    key={row.id ?? idx}
                    className={cn(
                      "border-b border-gray-50 transition-colors hover:bg-gray-50/70",
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    )}
                  >
                    {columns.map((col) => {
                      const value = col.accessor(row);
                      const displayVal = value === null || value === undefined ? "—" : String(value);

                      const isStatusCell =
                        col.key === "status" ||
                        col.key === "severity" ||
                        (col.key === "scope" && activeTab === "carbon");
                      const isBadgeable =
                        isStatusCell ||
                        (typeof value === "string" &&
                          (STATUS_COLORS[value?.toUpperCase()] ||
                            STATUS_COLORS[value?.replace(/ /g, "_")?.toUpperCase()]));

                      return (
                        <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                          {isBadgeable && value ? (
                            <span
                              className={cn(
                                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                                getStatusBadgeClass(String(value))
                              )}
                            >
                              {displayVal}
                            </span>
                          ) : (
                            <span
                              className={cn(
                                col.key === "title" || col.key === "owner"
                                  ? "font-medium text-gray-900"
                                  : ""
                              )}
                            >
                              {displayVal}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center text-gray-400"
                  >
                    <Table className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      {hasActiveFilters
                        ? "No records match the current filters"
                        : `No ${DATA_SOURCE_LABELS[activeTab].toLowerCase()} found`}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-sm text-gray-900 underline underline-offset-2 hover:text-gray-600"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-gray-900/10 outline-none cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{safePage}</span> of{" "}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
