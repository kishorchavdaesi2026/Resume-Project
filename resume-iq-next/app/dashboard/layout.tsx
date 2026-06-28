"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, init } = useAuthStore();

  // Validate session on mount
  useEffect(() => {
    init();
  }, [init]);

  // Route protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark gap-4">
        {/* Glass Loading Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 animate-pulse">
          Decrypting session vault...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // prevent screen flash during redirect
  }

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-[#050810]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Dashboard Panel */}
      <main className="flex-1 overflow-y-auto min-h-screen relative p-8 md:p-12">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
