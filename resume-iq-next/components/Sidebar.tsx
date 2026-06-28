"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import {
  FileText,
  Palette,
  History,
  Settings,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Sparkles
} from "lucide-react";
import { isAppwriteConfigured } from "../services/appwrite";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = [
    { name: "My Resumes", href: "/dashboard", icon: <FileText className="w-5 h-5" /> },
    { name: "Templates", href: "/dashboard/templates", icon: <Palette className="w-5 h-5" /> },
    { name: "Export History", href: "/dashboard/export-history", icon: <History className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-6 bg-white/70 dark:bg-bg-dark/75 border-r border-slate-200 dark:border-white/5 relative z-30 h-screen sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Brand/Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z"
              fill="url(#side-logo-grad)"
            />
            <defs>
              <linearGradient id="side-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-white">
            Resume<span className="text-cyan-400">IQ</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-brand-cyan/15 to-brand-blue/15 border-l-4 border-brand-cyan text-brand-cyan shadow-sm"
                    : "text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="h-px bg-slate-200 dark:border-white/5 my-3" />
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  pathname.startsWith("/admin")
                    ? "bg-rose-500/10 border-l-4 border-rose-500 text-rose-400 shadow-sm"
                    : "text-slate-600 hover:text-rose-400 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 flex items-center justify-center border border-brand-cyan/20">
            <UserIcon className="w-5 h-5 text-brand-cyan" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || "Resume Builder"}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {user?.email || "builder@resumeiq.ai"}
            </span>
          </div>
        </div>

        {user?.role === "premium" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider self-start">
            <Sparkles className="w-3.5 h-3.5" /> Pro Member
          </div>
        )}

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-rose-400 text-sm font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
