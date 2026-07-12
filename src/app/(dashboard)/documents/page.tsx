"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  Folder,
  FolderOpen,
  Eye,
  Calendar,
  Tag,
  Plus,
  LayoutGrid,
  List,
  X,
  FileSpreadsheet,
  File,
  ChevronDown,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

type DocCategory = "POLICY" | "REPORT" | "EVIDENCE" | "CERTIFICATION" | "AUDIT" | "OTHER";
type DocStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

interface ESGDocument {
  id: string;
  name: string;
  category: DocCategory;
  description: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  fileType: string;
  version: string;
  status: DocStatus;
  relatedEntity?: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "ecosphere-documents";

const CATEGORY_CONFIG: Record<DocCategory, { label: string; color: string; bg: string; border: string; icon: string }> = {
  POLICY:        { label: "Policy",        color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30",   border: "border-l-blue-500",   icon: "bg-blue-500" },
  REPORT:        { label: "Report",        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-l-emerald-500", icon: "bg-emerald-500" },
  EVIDENCE:      { label: "Evidence",      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30",  border: "border-l-amber-500",  icon: "bg-amber-500" },
  CERTIFICATION: { label: "Certification", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-l-purple-500", icon: "bg-purple-500" },
  AUDIT:         { label: "Audit",         color: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30",     border: "border-l-red-500",    icon: "bg-red-500" },
  OTHER:         { label: "Other",         color: "text-gray-600 dark:text-gray-400",   bg: "bg-gray-100 dark:bg-gray-900/30",   border: "border-l-gray-400",   icon: "bg-gray-400" },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: "Active",   color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ARCHIVED: { label: "Archived", color: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-gray-800" },
  DRAFT:    { label: "Draft",    color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900/30" },
};

const FILE_TYPE_ICONS: Record<string, { color: string }> = {
  pdf:  { color: "text-red-500" },
  xlsx: { color: "text-emerald-500" },
  csv:  { color: "text-gray-500" },
  docx: { color: "text-blue-500" },
};

const SEED_DOCS: ESGDocument[] = [
  { id: "seed-1",  name: "ESG Policy 2026",                      category: "POLICY",        description: "Comprehensive ESG policy covering environmental, social, and governance commitments for 2026.",                   tags: ["esg", "policy", "2026"],                      uploadedAt: "2026-01-15T09:00:00Z", uploadedBy: "ESG Admin",      fileSize: 245,  fileType: "pdf",  version: "2.0", status: "ACTIVE" },
  { id: "seed-2",  name: "Q1 2026 Carbon Report",                 category: "REPORT",        description: "Quarterly carbon emissions report covering Scope 1, 2, and 3 emissions for Q1 2026.",                              tags: ["carbon", "emissions", "q1"],                   uploadedAt: "2026-04-10T14:30:00Z", uploadedBy: "System Admin",   fileSize: 1820, fileType: "xlsx", version: "1.0", status: "ACTIVE" },
  { id: "seed-3",  name: "Annual Sustainability Report",          category: "REPORT",        description: "Comprehensive annual sustainability report with metrics across all ESG pillars.",                                tags: ["annual", "sustainability"],                     uploadedAt: "2026-03-01T08:00:00Z", uploadedBy: "ESG Admin",      fileSize: 4500, fileType: "pdf",  version: "3.0", status: "ACTIVE" },
  { id: "seed-4",  name: "GRI Standards Certification",          category: "CERTIFICATION", description: "Official GRI Standards certification confirming compliance with reporting guidelines.",                          tags: ["gri", "standards", "certification"],           uploadedAt: "2026-02-20T11:15:00Z", uploadedBy: "Compliance",     fileSize: 340,  fileType: "pdf",  version: "1.0", status: "ACTIVE" },
  { id: "seed-5",  name: "ISO 14001 Certificate",                category: "CERTIFICATION", description: "ISO 14001 environmental management system certificate, valid through December 2027.",                             tags: ["iso", "14001", "ems"],                         uploadedAt: "2026-01-05T10:00:00Z", uploadedBy: "Compliance",     fileSize: 520,  fileType: "pdf",  version: "1.0", status: "ACTIVE" },
  { id: "seed-6",  name: "Audit Evidence — Safety Inspection",   category: "EVIDENCE",      description: "Photographic and documentary evidence from the Q1 workplace safety inspection audit.",                            tags: ["safety", "inspection", "audit"],               uploadedAt: "2026-03-28T16:45:00Z", uploadedBy: "Audit Team",     fileSize: 3200, fileType: "pdf",  version: "1.0", status: "ACTIVE" },
  { id: "seed-7",  name: "Employee Training Records",            category: "EVIDENCE",      description: "Records of ESG training sessions completed by employees in Q1 2026.",                                             tags: ["training", "employees", "records"],            uploadedAt: "2026-04-02T09:30:00Z", uploadedBy: "HR Admin",       fileSize: 890,  fileType: "xlsx", version: "1.0", status: "ACTIVE" },
  { id: "seed-8",  name: "Supply Chain Assessment",              category: "AUDIT",         description: "Preliminary supply chain ESG risk assessment for Tier 1 and Tier 2 suppliers.",                                   tags: ["supply-chain", "risk", "assessment"],          uploadedAt: "2026-05-15T13:00:00Z", uploadedBy: "Procurement",    fileSize: 1450, fileType: "pdf",  version: "0.1", status: "DRAFT"  },
  { id: "seed-9",  name: "Diversity & Inclusion Report",         category: "REPORT",        description: "Annual diversity and inclusion report covering workforce demographics and initiatives.",                         tags: ["diversity", "inclusion", "social"],            uploadedAt: "2026-04-20T12:00:00Z", uploadedBy: "HR Admin",       fileSize: 1100, fileType: "pdf",  version: "1.0", status: "ACTIVE" },
  { id: "seed-10", name: "Board Governance Charter",             category: "POLICY",        description: "Corporate governance charter defining board structure, responsibilities, and ethical standards.",                tags: ["governance", "board", "charter"],              uploadedAt: "2026-01-10T08:00:00Z", uploadedBy: "Governance",     fileSize: 380,  fileType: "pdf",  version: "4.0", status: "ACTIVE" },
];

// ── Helpers ────────────────────────────────────────────────────────────

function generateId(): string {
  return `doc-${Date.now()}-${Math.floor(Date.now() * 36).toString(36).slice(-6)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatSize(kb: number): string {
  if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${kb} KB`;
}

// ── Sub-components ─────────────────────────────────────────────────────

function StatsRow({ docs }: { docs: ESGDocument[] }) {
  const total = docs.length;
  const active = docs.filter((d) => d.status === "ACTIVE").length;
  const archived = docs.filter((d) => d.status === "ARCHIVED").length;
  const draft = docs.filter((d) => d.status === "DRAFT").length;

  const items = [
    { label: "Total Documents", value: total, icon: Folder,      color: "bg-gray-500" },
    { label: "Active",          value: active, icon: FolderOpen, color: "bg-emerald-500" },
    { label: "Archived",        value: archived, icon: Folder,    color: "bg-gray-400" },
    { label: "Draft",           value: draft, icon: FileText,    color: "bg-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", item.color)}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategorySummary({ docs }: { docs: ESGDocument[] }) {
  const counts = useMemo(() => {
    const map: Record<DocCategory, number> = { POLICY: 0, REPORT: 0, EVIDENCE: 0, CERTIFICATION: 0, AUDIT: 0, OTHER: 0 };
    docs.forEach((d) => map[d.category]++);
    return map;
  }, [docs]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {(Object.keys(CATEGORY_CONFIG) as DocCategory[]).map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        return (
          <div key={cat} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", cfg.icon)} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{counts[cat]}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{cfg.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UploadForm({
  onSave,
  onCancel,
}: {
  onSave: (doc: ESGDocument) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocCategory>("POLICY");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState<DocStatus>("DRAFT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: generateId(),
      name: name.trim(),
      category,
      description: description.trim(),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Current User",
      fileSize: 128,
      fileType: "pdf",
      version,
      status,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Document Metadata</h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Document Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              placeholder="e.g. ESG Policy 2026"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              {(Object.keys(CATEGORY_CONFIG) as DocCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
              placeholder="Brief description of the document..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              placeholder="esg, policy, 2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Version</label>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                placeholder="1.0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocStatus)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              >
                {(Object.keys(STATUS_CONFIG) as DocStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
          >
            Add Document
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentCard({
  doc,
  onView,
  onDelete,
}: {
  doc: ESGDocument;
  onView: (doc: ESGDocument) => void;
  onDelete: (id: string) => void;
}) {
  const catCfg = CATEGORY_CONFIG[doc.category];
  const statusCfg = STATUS_CONFIG[doc.status];
  const ftCfg = FILE_TYPE_ICONS[doc.fileType] ?? { color: "text-gray-400" };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5 group",
        catCfg.border
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <FileText className={cn("w-5 h-5", ftCfg.color)} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {doc.fileType.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(doc)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
            </button>
            <button
              onClick={() => onDelete(doc.id)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Name & description */}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{doc.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{doc.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", catCfg.bg, catCfg.color)}>
            {catCfg.label}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", statusCfg.bg, statusCfg.color)}>
            {statusCfg.label}
          </span>
        </div>

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {doc.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(doc.uploadedAt)}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
            <span>v{doc.version}</span>
            <span>{formatSize(doc.fileSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentTableRow({
  doc,
  onView,
  onDelete,
}: {
  doc: ESGDocument;
  onView: (doc: ESGDocument) => void;
  onDelete: (id: string) => void;
}) {
  const catCfg = CATEGORY_CONFIG[doc.category];
  const statusCfg = STATUS_CONFIG[doc.status];

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className={cn("w-4 h-4 flex-shrink-0", FILE_TYPE_ICONS[doc.fileType]?.color ?? "text-gray-400")} />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[220px]">{doc.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", catCfg.bg, catCfg.color)}>
          {catCfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", statusCfg.bg, statusCfg.color)}>
          {statusCfg.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">v{doc.version}</td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(doc.uploadedAt)}</td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatSize(doc.fileSize)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onView(doc)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="View">
            <Eye className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
          </button>
          <button onClick={() => onDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DocumentDetailModal({
  doc,
  onClose,
}: {
  doc: ESGDocument;
  onClose: () => void;
}) {
  const catCfg = CATEGORY_CONFIG[doc.category];
  const statusCfg = STATUS_CONFIG[doc.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", catCfg.icon)}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">v{doc.version} &middot; {doc.fileType.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">{doc.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Category</p>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", catCfg.bg, catCfg.color)}>
              {catCfg.label}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Status</p>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", statusCfg.bg, statusCfg.color)}>
              {statusCfg.label}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Uploaded</p>
            <p className="text-gray-900 dark:text-white">{formatDate(doc.uploadedAt)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Size</p>
            <p className="text-gray-900 dark:text-white">{formatSize(doc.fileSize)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Uploaded By</p>
            <p className="text-gray-900 dark:text-white">{doc.uploadedBy}</p>
          </div>
          {doc.relatedEntity && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Related Entity</p>
              <p className="text-gray-900 dark:text-white">{doc.relatedEntity}</p>
            </div>
          )}
        </div>

        {doc.tags.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ESGDocument[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<DocCategory | "">("");
  const [filterStatus, setFilterStatus] = useState<DocStatus | "">("");
  const [detailDoc, setDetailDoc] = useState<ESGDocument | null>(null);

  // Load from localStorage (seed on first visit)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDocuments(JSON.parse(raw));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DOCS));
        setDocuments(SEED_DOCS);
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DOCS));
      setDocuments(SEED_DOCS);
    }
  }, []);

  const persist = (docs: ESGDocument[]) => {
    setDocuments(docs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  };

  const handleAddDocument = (doc: ESGDocument) => {
    persist([doc, ...documents]);
    setShowUpload(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    persist(documents.filter((d) => d.id !== id));
  };

  // Filter + search
  const filteredDocs = useMemo(() => {
    let result = documents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterCategory) result = result.filter((d) => d.category === filterCategory);
    if (filterStatus) result = result.filter((d) => d.status === filterStatus);
    return result;
  }, [documents, searchQuery, filterCategory, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all ESG documents, policies, and evidence</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm",
            showUpload
              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showUpload ? "Cancel" : "Upload Document"}
        </button>
      </div>

      {/* Upload form */}
      {showUpload && <UploadForm onSave={handleAddDocument} onCancel={() => setShowUpload(false)} />}

      {/* Stats */}
      <StatsRow docs={documents} />

      {/* Category Summary */}
      <CategorySummary docs={documents} />

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name, description, or tags..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as DocCategory | "")}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              <option value="">All Categories</option>
              {(Object.keys(CATEGORY_CONFIG) as DocCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DocStatus | "")}
              className="appearance-none px-4 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            >
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_CONFIG) as DocStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "grid"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2 transition-colors",
                viewMode === "list"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document list */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No documents found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {searchQuery || filterCategory || filterStatus ? "Try adjusting your search or filters" : "Upload your first document to get started"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onView={setDetailDoc} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Uploaded</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Size</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredDocs.map((doc) => (
                <DocumentTableRow key={doc.id} doc={doc} onView={setDetailDoc} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detailDoc && <DocumentDetailModal doc={detailDoc} onClose={() => setDetailDoc(null)} />}
    </div>
  );
}
