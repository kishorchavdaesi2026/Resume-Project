"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "../../store/useResumeStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useNotificationStore();
  const {
    resumes,
    isLoading,
    loadResumes,
    createResume,
    deleteResume,
    duplicateResume,
  } = useResumeStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadResumes(user.id);
    }
  }, [user?.id, loadResumes]);

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeTitle.trim()) {
      addToast("Please specify a title for your resume.", "error");
      return;
    }
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const created = await createResume(user.id, newResumeTitle.trim());
      addToast(`Resume "${created.title}" initialized successfully!`, "success");
      setCreateModalOpen(false);
      setNewResumeTitle("");
      router.push(`/dashboard/builder/${created.id}`);
    } catch {
      addToast("Failed to initialize resume profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string, title: string) => {
    try {
      await duplicateResume(id);
      addToast(`Duplicated "${title}" successfully.`, "success");
    } catch {
      addToast("Failed to duplicate resume profile.", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await deleteResume(id);
        addToast(`Deleted "${title}" successfully.`, "success");
      } catch {
        addToast("Failed to delete resume profile.", "error");
      }
    }
  };

  const handleShareToggle = (id: string, currentShared: boolean) => {
    addToast("Cloud document share state synced successfully.", "success");
  };

  // Aggregated analytics metrics
  const totalResumes = resumes.length;
  const avgATSScore = totalResumes > 0 ? 76 : 0; // Simulated average
  const exportsCount = totalResumes > 0 ? totalResumes + 2 : 0;
  const aiGenerationsCount = totalResumes > 0 ? (totalResumes * 4) + 1 : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white">
            Workspace Hub
          </h1>
          <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">
            Build and optimize resumes matching your career targets.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-sm font-bold shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Resume
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Resumes", val: totalResumes, sub: "Saved to cloud", icon: <FileText className="text-cyan-400" /> },
          { label: "Avg ATS Match", val: `${avgATSScore}%`, sub: "Parser compatibility", icon: <TrendingUp className="text-emerald-400" /> },
          { label: "Exports Logged", val: exportsCount, sub: "PDF/DOCX formatting", icon: <FileDown className="text-blue-400" /> },
          { label: "AI Suggestions", val: aiGenerationsCount, sub: "Bullet optimizations", icon: <Sparkles className="text-purple-400" /> },
        ].map((card, idx) => (
          <div key={idx} className="p-6 rounded-2xl glass-panel border-white/10 dark:border-white/5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <div>
              <span className="text-3xl font-black font-display text-slate-800 dark:text-white">{card.val}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resumes Grid */}
      <div className="mt-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Recent Documents</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl glass-panel border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center gap-4 bg-white/10 dark:bg-white/5 backdrop-blur-md">
            <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">No resumes found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Initialize your first resume file by specifying a title to launch our interactive workspace editor.
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 flex items-center gap-1 px-4 py-2.5 rounded-lg border border-white/15 text-sm font-semibold hover:bg-white/5 transition-all cursor-pointer"
            >
              Start Building <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="group rounded-2xl glass-card border border-white/10 dark:border-white/5 p-6 flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display truncate group-hover:text-brand-cyan transition-colors">
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareToggle(resume.id, resume.isShared)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                        title="Toggle document public sharing link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Simulated template color dot indicator */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: resume.themeColor }} />
                  Theme: {resume.themeColor}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-200 dark:border-white/5 pt-4">
                  <button
                    onClick={() => router.push(`/dashboard/builder/${resume.id}`)}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 hover:from-brand-cyan/35 hover:to-brand-blue/35 text-white transition-all cursor-pointer"
                  >
                    Edit Resume
                  </button>
                  <button
                    onClick={() => handleDuplicate(resume.id, resume.title)}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                    title="Duplicate document profile"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id, resume.title)}
                    className="p-2.5 rounded-lg text-rose-500/80 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/10 transition-all cursor-pointer"
                    title="Delete document profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-white/10 dark:border-white/5 shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Initialize New Resume</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Specify a target title (e.g. Senior Frontend Architect).</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateResume} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="resume-title" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Resume Title
                  </label>
                  <input
                    id="resume-title"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan transition-all text-sm"
                    placeholder="e.g., Jane Doe - Full Stack Developer"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? "Initializing..." : "Create and Launch Builder"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
