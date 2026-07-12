"use client";

import { trpc } from "@/lib/trpc/client";
import { X, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical } from "lucide-react";
import { useState } from "react";

interface WidgetCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function WidgetCustomizer({ open, onClose }: WidgetCustomizerProps) {
  const utils = trpc.useUtils();
  const widgetsQuery = trpc.widget.list.useQuery();
  const updateWidget = trpc.widget.update.useMutation({
    onSuccess: () => utils.widget.list.invalidate(),
  });
  const reorderWidgets = trpc.widget.reorder.useMutation({
    onSuccess: () => utils.widget.list.invalidate(),
  });

  const widgets = widgetsQuery.data ?? [];

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;
    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
    reorderWidgets.mutate({
      widgets: newWidgets.map((w, i) => ({ id: w.id, position: i })),
    });
  };

  const toggleVisibility = (id: string, currentVisible: boolean) => {
    updateWidget.mutate({ id, visible: !currentVisible });
  };

  const changeSize = (id: string, size: string) => {
    updateWidget.mutate({ id, size });
  };

  const SIZES = ["small", "medium", "large"];

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      <div className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-2xl animate-[slideInRight_0.3s_ease-out] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Customize Dashboard</h2>
            <p className="text-sm text-gray-500">Toggle, reorder, and resize widgets</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {widgetsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  className={`rounded-xl border p-4 transition-all ${
                    widget.visible
                      ? "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{widget.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{widget.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveWidget(index, "up")}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveWidget(index, "down")}
                        disabled={index === widgets.length - 1}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleVisibility(widget.id, widget.visible)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          widget.visible
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {widget.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Size:</span>
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSize(widget.id, s)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors capitalize ${
                          widget.size === s
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
