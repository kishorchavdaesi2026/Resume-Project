"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { databaseService } from "../../../services/appwrite";
import { useNotificationStore } from "../../../store/useNotificationStore";
import { FileText, Download, Trash2, Calendar, FileDown, AlertCircle } from "lucide-react";
import { ExportHistoryRecord } from "../../../types";

export default function ExportHistoryPage() {
  const { user } = useAuthStore();
  const { addToast } = useNotificationStore();
  const [exports, setExports] = useState<ExportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await databaseService.getExportHistory(user.id);
      setExports(data);
    } catch {
      addToast("Failed to retrieve export logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this export record?")) {
      try {
        await databaseService.deleteExportRecord(id);
        setExports(exports.filter((item) => item.id !== id));
        addToast("Export record deleted.", "success");
      } catch {
        addToast("Failed to delete record.", "error");
      }
    }
  };

  const handleDownloadAgain = (record: ExportHistoryRecord) => {
    addToast(`Re-downloading "${record.fileName}"...`, "info");
    
    // Simulate triggering a download of a dummy file representing the resume
    try {
      const element = document.createElement("a");
      const fileContent = `ResumeIQ Saved Export Log\nDocument: ${record.resumeTitle}\nFormat: ${record.format.toUpperCase()}\nExport Date: ${new Date(record.timestamp).toLocaleString()}\n\nNote: Open the editor to regenerate a live PDF dynamically.`;
      const file = new Blob([fileContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = record.fileName + ".txt"; // fallback to text placeholder
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      addToast("Download started.", "success");
    } catch {
      addToast("Download trigger failed.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white">
          Export History
        </h1>
        <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">
          Review and re-download your previously compiled PDF & DOCX files.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl glass-panel border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : exports.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-white/10 dark:bg-white/5 backdrop-blur-md flex flex-col items-center gap-4">
          <FileDown className="w-12 h-12 text-slate-400 dark:text-slate-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No exports logged</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Open your resumes inside the workspace editor and select download to capture history logs here.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 bg-white/10 dark:bg-black/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 md:p-5">Document Name</th>
                  <th className="p-4 md:p-5">Format</th>
                  <th className="p-4 md:p-5">Compiled Date</th>
                  <th className="p-4 md:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
                {exports.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 md:p-5 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-xs">{item.resumeTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        item.format === "pdf"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                      }`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="p-4 md:p-5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadAgain(item)}
                          className="p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/10 transition-all cursor-pointer"
                          title="Re-download copy"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
                          title="Delete export record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
