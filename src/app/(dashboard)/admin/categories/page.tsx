"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Tag, Plus, Trash2, X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoryManagementPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const utils = trpc.useUtils();

  const { data: categories, isLoading } = trpc.category.list.useQuery({});
  const createMutation = trpc.category.create.useMutation({
    onSuccess: () => {
      toast.success("Category created");
      setShowCreate(false);
      setCreateForm({ name: "", type: "CSR_ACTIVITY" });
      utils.category.list.invalidate({});
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteConfirm(null);
      utils.category.list.invalidate({});
    },
    onError: (err) => toast.error(err.message),
  });

  const [createForm, setCreateForm] = useState({ name: "", type: "CSR_ACTIVITY" as string });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: createForm.name, type: createForm.type as any });
  };

  const filtered = categories?.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeColors: Record<string, string> = {
    CSR_ACTIVITY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CHALLENGE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Category Management</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {categories?.length ?? 0} total categories
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all"
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? "Cancel" : "New Category"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-scale-in">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Create Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
              placeholder="Category name"
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500/50 outline-none"
            />
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500/50 outline-none"
            >
              <option value="CSR_ACTIVITY">CSR Activity</option>
              <option value="CHALLENGE">Challenge</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Category
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "", label: "All" }, { value: "CSR_ACTIVITY", label: "CSR Activity" }, { value: "CHALLENGE", label: "Challenge" }].map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === f.value ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none flex-1"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered && filtered.length > 0 ? (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[cat.type] || ""}`}>
                        {cat.type === "CSR_ACTIVITY" ? "CSR Activity" : "Challenge"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {cat.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirm === cat.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => deleteMutation.mutate({ id: cat.id })}
                            className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(cat.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-400 text-sm">No categories found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
