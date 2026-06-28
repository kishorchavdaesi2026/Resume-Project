"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";
import { useResumeStore } from "../../../store/useResumeStore";
import { useNotificationStore } from "../../../store/useNotificationStore";
import { Plus, Check, Star, Palette, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createResume } = useResumeStore();
  const { addToast } = useNotificationStore();

  const [selectedTpl, setSelectedTpl] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const templates = [
    {
      id: "ats-classic",
      name: "ATS Classic",
      desc: "Perfect format for standard recruitment systems. Standard fonts, linear column flow, and high parsing compliance.",
      preview: "bg-slate-900 border-t-8 border-slate-600",
      isPremium: false,
    },
    {
      id: "modern-tech",
      name: "Modern Tech",
      desc: "Grid layout featuring a highlighted sidebar for skills, language ratings, and certifications. Great for software engineers.",
      preview: "bg-indigo-950/20 border-t-8 border-blue-500",
      isPremium: false,
    },
    {
      id: "creative-glass",
      name: "Creative Glass",
      desc: "Vibrant layout with glassmorphism touches and linear gradient markers. Designed to catch human recruiters' eyes.",
      preview: "bg-purple-950/20 border-t-8 border-cyan-400",
      isPremium: true,
    },
  ];

  const handleSelect = (id: string, premium: boolean) => {
    if (premium && user?.role !== "premium" && user?.role !== "admin") {
      addToast("The Creative Glass layout requires a Pro Subscription.", "error");
      return;
    }
    setSelectedTpl(id);
    setResumeTitle("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl) return;
    if (!resumeTitle.trim()) {
      addToast("Please provide a title for this document.", "error");
      return;
    }
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const created = await createResume(user.id, resumeTitle.trim());
      // Override default template ID
      await useResumeStore.getState().updateResume({ templateId: selectedTpl });
      addToast(`Document created successfully with layout: ${selectedTpl}`, "success");
      router.push(`/dashboard/builder/${created.id}`);
    } catch {
      addToast("Failed to initialize resume profile.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white">
          Document Layouts
        </h1>
        <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">
          Select a verified layout design to initialize your profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Template List (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => {
            const isSelected = selectedTpl === tpl.id;
            const isPro = tpl.isPremium;
            const locked = isPro && user?.role !== "premium" && user?.role !== "admin";

            return (
              <div
                key={tpl.id}
                onClick={() => handleSelect(tpl.id, tpl.isPremium)}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-brand-cyan bg-brand-cyan/5 scale-[1.01]"
                    : "border-white/10 dark:border-white/5 bg-white/40 dark:bg-bg-dark/45 hover:border-white/20 hover:bg-white/5 dark:hover:bg-white/5"
                }`}
              >
                <div>
                  <div className={`h-40 ${tpl.preview} relative flex items-center justify-center p-4 overflow-hidden`}>
                    {isPro && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                        <Star className="w-2.5 h-2.5 fill-current" /> PRO
                      </span>
                    )}

                    <div className="w-4/5 h-full bg-slate-900/60 rounded-t-lg shadow-2xl p-3 flex flex-col gap-2 translate-y-3">
                      <div className="w-1/3 h-2 bg-slate-400/40 rounded" />
                      <div className="w-1/2 h-1.5 bg-slate-400/20 rounded" />
                      <hr className="border-slate-400/10" />
                      <div className="w-full h-1 bg-slate-400/10 rounded" />
                      <div className="w-full h-1 bg-slate-400/10 rounded" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-2">
                    <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white flex items-center justify-between">
                      {tpl.name}
                      {isSelected && <Check className="w-5 h-5 text-brand-cyan" />}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className={`block w-full text-center py-2 rounded-lg text-xs font-semibold border ${
                    isSelected
                      ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                      : locked
                        ? "border-amber-500/20 text-amber-500 bg-amber-500/5 cursor-not-allowed"
                        : "border-white/10 dark:border-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/5"
                  }`}>
                    {locked ? "Upgrade to Unlock" : isSelected ? "Selected" : "Select Layout"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creator Panel (4 cols) */}
        <div className="lg:col-span-4 relative">
          <AnimatePresence mode="wait">
            {selectedTpl ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-6 rounded-2xl glass-panel border border-white/10 dark:border-white/5 shadow-2xl flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Palette className="w-5 h-5 text-brand-cyan" />
                    Layout Selected
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Launch your builder editor by specifying a document title.
                  </p>
                </div>

                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="res-title" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Document Title
                    </label>
                    <input
                      id="res-title"
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                      placeholder="e.g., Software Architect Resume"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? "Launching Editor..." : "Launch Builder Editor"}
                  </button>

                  <button
                    onClick={() => setSelectedTpl(null)}
                    type="button"
                    className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear selection
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-white/10 dark:bg-white/5 backdrop-blur-md flex flex-col items-center gap-3">
                <Palette className="w-10 h-10 text-slate-400 dark:text-slate-650" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Preview Layout Details</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select any resume design on the left panel to review layout parameters, check compatibility levels, and initialize editing.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
