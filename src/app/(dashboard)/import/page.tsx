"use client";

import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertTriangle, History, Trash2 } from "lucide-react";
import Papa from "papaparse";

type EntityOption = {
  value: string;
  label: string;
  description: string;
};

const ENTITY_OPTIONS: EntityOption[] = [
  { value: "carbonTransactions", label: "Carbon Transactions", description: "Track emissions and carbon offset data" },
  { value: "users", label: "Users", description: "Import employee and team member records" },
  { value: "departments", label: "Departments", description: "Import organizational department data" },
  { value: "csrActivities", label: "CSR Activities", description: "Import corporate social responsibility activities" },
];

type ImportLogEntry = {
  id: number;
  entity: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  status: "success" | "partial" | "failed";
  timestamp: string;
};

export default function ImportPage() {
  const [entity, setEntity] = useState("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);
  const [importLogs, setImportLogs] = useState<ImportLogEntry[]>([]);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.import.importData.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      setImportLogs((prev) => [
        {
          id: Date.now(),
          entity,
          fileName,
          totalRows: result.total,
          importedRows: result.imported,
          status: result.imported === result.total ? "success" : result.imported > 0 ? "partial" : "failed",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setImporting(false);
    },
    onError: () => {
      setImporting(false);
      setParseError("Import failed. Please check your data and try again.");
    },
  });

  const handleFile = useCallback((file: File) => {
    setParseError("");
    setImportResult(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError("Error parsing CSV: " + results.errors[0].message);
          return;
        }
        const data = results.data as any[];
        if (data.length === 0) {
          setParseError("CSV file is empty or has no valid rows.");
          return;
        }
        setCsvHeaders(results.meta.fields || Object.keys(data[0]));
        setCsvData(data);
      },
      error: (err) => {
        setParseError("Failed to parse CSV: " + err.message);
      },
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!entity || csvData.length === 0) return;
    setImporting(true);
    setImportResult(null);
    setParseError("");
    importMutation.mutate({ entity, data: csvData });
  };

  const clearFile = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFileName("");
    setImportResult(null);
    setParseError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewRows = csvData.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
        <p className="text-gray-500 mt-1">Import data from CSV files into the system</p>
      </div>

      {/* Entity Selector */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">1. Select Entity Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ENTITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEntity(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                entity === opt.value
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">2. Upload CSV File</h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-emerald-500 bg-emerald-50"
              : csvData.length > 0
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          {csvData.length > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500">{csvData.length} rows detected</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 mt-1"
              >
                <Trash2 className="w-3 h-3" />Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-gray-300" />
              <p className="font-medium text-gray-700">Drag and drop your CSV file here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
          )}
        </div>
        {parseError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{parseError}
          </div>
        )}
      </div>

      {/* CSV Preview Table */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            3. Preview (first {previewRows.length} rows of {csvData.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {csvHeaders.map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {csvHeaders.map((h) => (
                      <td key={h} className="px-3 py-2 text-gray-800 whitespace-nowrap max-w-[200px] truncate">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Button and Result */}
      {csvData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">4. Import Data</h2>
            <button
              onClick={handleImport}
              disabled={!entity || importing}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />Import {csvData.length} Rows
                </>
              )}
            </button>
          </div>
          {!entity && csvData.length > 0 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />Please select an entity type above
            </p>
          )}
          {importResult && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              importResult.imported === importResult.total
                ? "bg-emerald-50 text-emerald-700"
                : importResult.imported > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
            }`}>
              {importResult.imported === importResult.total ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : importResult.imported > 0 ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  Successfully imported {importResult.imported} of {importResult.total} rows
                </p>
                {importResult.imported < importResult.total && (
                  <p className="text-xs mt-0.5 opacity-75">
                    {importResult.total - importResult.imported} rows were skipped due to errors
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import History */}
      {importLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />Import History
          </h2>
          <div className="space-y-2">
            {importLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {log.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : log.status === "partial" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.fileName}
                      <span className="text-gray-400 mx-1.5">&middot;</span>
                      <span className="text-gray-500">{ENTITY_OPTIONS.find((e) => e.value === log.entity)?.label || log.entity}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {log.importedRows}/{log.totalRows}
                  </p>
                  <p className="text-xs text-gray-400">rows imported</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
