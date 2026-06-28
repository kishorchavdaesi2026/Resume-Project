"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { databaseService } from "../../services/appwrite";
import { useNotificationStore } from "../../store/useNotificationStore";
import {
  ShieldAlert,
  Users,
  Sparkles,
  FileDown,
  Activity,
  User as UserIcon,
  Trash2,
  Lock,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { AIRequestLog, User } from "../../types";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { addToast } = useNotificationStore();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [aiLogs, setAiLogs] = useState<AIRequestLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch admin logs and data on mount if user is admin
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingData(true);
      try {
        const logs = await databaseService.getAILogs();
        setAiLogs(logs);

        // Fetch mock users list (or from Appwrite DB if real integration is active)
        const mockUsers: User[] = JSON.parse(localStorage.getItem("resumeiq_mock_users") || "[]");
        setUsersList(mockUsers);
      } catch {
        addToast("Failed to retrieve system operations logs.", "error");
      } finally {
        setLoadingData(false);
      }
    };

    if (user?.role === "admin") {
      fetchAdminData();
    }
  }, [user, addToast]);

  const handleRoleToggle = (userId: string, currentRole: string) => {
    const nextRole = currentRole === "premium" ? "user" : "premium";
    
    // Update local storage mock database list
    const mockUsers: User[] = JSON.parse(localStorage.getItem("resumeiq_mock_users") || "[]");
    const idx = mockUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      mockUsers[idx].role = nextRole;
      localStorage.setItem("resumeiq_mock_users", JSON.stringify(mockUsers));
      setUsersList(mockUsers);
      addToast(`User role toggled to ${nextRole.toUpperCase()}`, "success");
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      const mockUsers: User[] = JSON.parse(localStorage.getItem("resumeiq_mock_users") || "[]");
      const filtered = mockUsers.filter((u) => u.id !== userId);
      localStorage.setItem("resumeiq_mock_users", JSON.stringify(filtered));
      setUsersList(filtered);
      addToast("User account removed from database.", "success");
    }
  };

  // ----------------------------------------------------
  // AUTHORIZATION ROUTE SHIELD
  // ----------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-white/5 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#070a13] p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/15 via-slate-900 to-bg-dark/15 z-0" />
        <div className="relative z-10 max-w-md p-8 rounded-2xl glass-panel border border-rose-500/20 shadow-2xl flex flex-col items-center gap-5">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">403 Access Unauthorized</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Administrative permissions are required to inspect analytics logs and template definitions. Contact your subscription owner.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Workspace
          </button>
        </div>
      </div>
    );
  }

  // Admin stats
  const totalUsersCount = usersList.length;
  const proUsersCount = usersList.filter((u) => u.role === "premium").length;
  const totalAIOps = aiLogs.length;
  const successfulOps = aiLogs.filter((l) => l.status === "success").length;

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-[#050810] text-foreground">
      {/* Mini Sidebar back button for Admin */}
      <aside className="w-16 shrink-0 bg-white/5 border-r border-white/5 flex flex-col items-center py-6 gap-6 relative z-30">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-rose-500" /> Admin Command Center
            </h1>
            <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">
              Inspect application workloads, register states, and AI model telemetry logs.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active User Profiles", val: totalUsersCount, sub: "Registered builders", icon: <Users className="text-cyan-400" /> },
              { label: "Premium Accounts", val: proUsersCount, sub: "Paid subscribers", icon: <Sparkles className="text-yellow-500" /> },
              { label: "AI Transactions", val: totalAIOps, sub: "Gemini requests", icon: <Activity className="text-purple-400" /> },
              { label: "Engine Uptime", val: "99.98%", sub: "Service telemetry", icon: <ShieldAlert className="text-emerald-400" /> },
            ].map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl glass-panel border-white/10 dark:border-white/5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</span>
                  {card.icon}
                </div>
                <div>
                  <span className="text-3xl font-black font-display text-slate-800 dark:text-white">{card.val}</span>
                  <span className="block text-[10px] text-slate-450 mt-0.5">{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Users List & AI Telemetry grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* User List Panel (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Registered Users</h2>
              
              {loadingData ? (
                <div className="h-48 rounded-2xl glass-panel animate-pulse" />
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-white/5 text-slate-400 text-xs">No registered users in sandbox database.</div>
              ) : (
                <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 bg-white/10 dark:bg-black/20 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Name / Email</th>
                        <th className="p-4">Plan Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                      {usersList.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                                <span className="text-[10px] text-slate-500">{item.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              item.role === "premium" || item.role === "admin"
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/10"
                            }`}>
                              {item.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleRoleToggle(item.id, item.role)}
                                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all font-semibold cursor-pointer"
                                title="Toggle premium role upgrade"
                              >
                                Toggle Pro
                              </button>
                              <button
                                onClick={() => handleDeleteUser(item.id, item.name)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 cursor-pointer"
                                title="Remove account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AI Logs Telemetry (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">AI Engine Logs</h2>
              
              {loadingData ? (
                <div className="h-48 rounded-2xl glass-panel animate-pulse" />
              ) : aiLogs.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-white/5 text-slate-400 text-xs">No AI requests logged yet.</div>
              ) : (
                <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-xl overflow-y-auto max-h-[300px]">
                  {aiLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/20 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-350 uppercase tracking-wider">{log.requestType}</span>
                        {log.status === "success" ? (
                          <span className="flex items-center gap-0.5 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> OK</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-rose-400 font-bold"><XCircle className="w-3.5 h-3.5" /> FAIL</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2">
                        <span>Tokens: P({log.promptTokens}) C({log.completionTokens})</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
