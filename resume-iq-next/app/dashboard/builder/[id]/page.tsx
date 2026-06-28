"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useResumeStore } from "../../../../store/useResumeStore";
import { useNotificationStore } from "../../../../store/useNotificationStore";
import ResumeEditor from "../../../../components/ResumeEditor";
import ResumePreview from "../../../../components/ResumePreview";
import { exportToPdf } from "../../../../utils/exportPdf";
import { exportToDocx } from "../../../../utils/exportDocx";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Cpu,
  Bookmark,
  FileCheck,
  Wand2,
  FileDown,
  Info,
  Maximize2,
  Minimize2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuilderPage() {
  const router = useRouter();
  const { id } = useParams();
  const { addToast } = useNotificationStore();
  const {
    currentResume,
    loadResume,
    updateResume,
    isSaving,
    isLoading
  } = useResumeStore();

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<"ats" | "jobMatch" | "cover" | "interview">("ats");
  const [zoom, setZoom] = useState<number>(0.85);

  // AI Inputs & Results
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<{ score: number; feedback: string[]; missingKeywords: string[] } | null>(null);
  const [matchResult, setMatchResult] = useState<{ matchPercentage: number; matchedKeywords: string[]; gapKeywords: string[]; recommendations: string[] } | null>(null);
  const [coverResult, setCoverResult] = useState<string>("");
  const [questionsResult, setQuestionsResult] = useState<{ question: string; suggestedAnswer: string }[]>([]);

  // Rename title state
  const [titleText, setTitleText] = useState("");

  useEffect(() => {
    if (id) {
      loadResume(id as string).then((res) => {
        if (res) setTitleText(res.title);
      });
    }
  }, [id, loadResume]);

  const handleTitleBlur = () => {
    if (titleText.trim() && titleText !== currentResume?.title) {
      updateResume({ title: titleText.trim() });
      addToast("Document title renamed.", "success");
    }
  };

  const triggerPdf = async () => {
    if (!currentResume) return;
    addToast("Compiling document layers...", "info");
    const res = await exportToPdf(currentResume, "resume-a4-sheet");
    if (res.success) {
      addToast(`Document downloaded successfully: ${res.fileName}`, "success");
    } else {
      addToast(res.error || "Failed to compile PDF.", "error");
    }
  };

  const triggerDocx = async () => {
    if (!currentResume) return;
    addToast("Structuring Word document binary...", "info");
    const res = await exportToDocx(currentResume);
    if (res.success) {
      addToast(`Word document compiled successfully: ${res.fileName}`, "success");
    } else {
      addToast(res.error || "Failed to compile Word document.", "error");
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // ----------------------------------------------------
  // AI ASSISTANT DRAWER ACTIONS
  // ----------------------------------------------------
  const runATSScan = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const resumeContent = `${currentResume.personalInfo.title}\n${currentResume.summary}\n` +
        currentResume.experience.map((e) => `${e.position} ${e.company} ${e.description}`).join("\n");

      const res = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setAtsResult(data.ats);
        addToast("ATS score completed!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to run scanner.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const runJobMatch = async () => {
    if (!currentResume || !jobDescription.trim()) {
      addToast("Please paste a job description first.", "error");
      return;
    }
    setAiLoading(true);
    try {
      const resumeContent = `${currentResume.personalInfo.title}\n${currentResume.summary}\n` +
        currentResume.experience.map((e) => `${e.position} ${e.company} ${e.description}`).join("\n");

      const res = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeContent, jobDescription }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatchResult(data.match);
        addToast("Job alignment completed!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to run job matcher.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const runCoverLetter = async () => {
    if (!currentResume || !jobDescription.trim()) {
      addToast("Please paste a job description first.", "error");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeSummary: currentResume.summary || "Technical Professional", jobDescription, companyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoverResult(data.coverLetter);
        addToast("Cover letter created!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to write cover letter.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const runInterviewPrep = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeSummary: currentResume.summary || "Technical Professional", title: currentResume.personalInfo.title }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestionsResult(data.questions);
        addToast("Custom interview preparation checklist loaded!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to prepare interview.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading || !currentResume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-white/5 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Decrypting document structure...</p>
      </div>
    );
  }

  // Configurations list
  const themeColors = ["#2563EB", "#06b6d4", "#8b5cf6", "#10B981", "#EF4444", "#F59E0B"];
  const fontFamilies = [
    { label: "Inter (Sans)", value: "var(--font-inter)" },
    { label: "Space Grotesk", value: "var(--font-space-grotesk)" },
    { label: "Georgia (Serif)", value: "Georgia, serif" },
  ];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Workspace Sticky Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white/5 text-slate-500 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <input
              type="text"
              className="bg-transparent border-none outline-none text-xl font-bold font-display text-slate-800 dark:text-white focus:border-b focus:border-brand-cyan/40 max-w-sm truncate"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleBlur}
            />
            <span className="text-[10px] text-slate-500 mt-0.5">
              {isSaving ? "Autosaving to Appwrite..." : "Changes synced to cloud"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center gap-1.5 border border-slate-200 dark:border-white/5 px-2.5 py-1.5 rounded-xl bg-white/5 backdrop-blur-md">
            <button
              onClick={() => setZoom(Math.max(zoom - 0.05, 0.5))}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:bg-white/10"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-400 font-bold px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(zoom + 0.05, 1.2))}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:bg-white/10"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={triggerPdf}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-xs font-bold shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={triggerDocx}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            DOCX
          </button>
          <button
            onClick={triggerPrint}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Print directly from browser"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* AI Panel trigger */}
          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              aiPanelOpen
                ? "bg-cyan-500/15 border-brand-cyan text-brand-cyan"
                : "border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </button>
        </div>
      </header>

      {/* Main Workspace Workspace (Form left, preview right, relative to drawer) */}
      <div className="flex-1 flex gap-6 relative overflow-hidden">
        {/* Editor & customizer (50%) */}
        <div className="flex-1 lg:max-w-[48%] flex flex-col gap-6 overflow-y-auto h-full pr-2 pb-12">
          {/* Customizer Panel */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 dark:border-white/5 shadow-lg flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layout Customizer</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Template select */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Design Style</label>
                <select
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 dark:bg-bg-dark text-xs font-bold focus:outline-none"
                  value={currentResume.templateId}
                  onChange={(e) => updateResume({ templateId: e.target.value })}
                >
                  <option value="ats-classic">ATS Classic</option>
                  <option value="modern-tech">Modern Tech</option>
                  <option value="creative-glass">Creative Glass</option>
                </select>
              </div>

              {/* Font select */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Typography</label>
                <select
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 dark:bg-bg-dark text-xs font-bold focus:outline-none"
                  value={currentResume.fontFamily}
                  onChange={(e) => updateResume({ fontFamily: e.target.value })}
                >
                  {fontFamilies.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Size Select */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Scale/Size</label>
                <select
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 dark:bg-bg-dark text-xs font-bold focus:outline-none"
                  value={currentResume.fontSize}
                  onChange={(e) => updateResume({ fontSize: e.target.value as any })}
                >
                  <option value="sm">Small (ATS friendly)</option>
                  <option value="md">Regular</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>

            {/* Colors picker */}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase">Theme Color:</span>
              <div className="flex gap-2.5">
                {themeColors.map((color) => {
                  const active = currentResume.themeColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => updateResume({ themeColor: color })}
                      className="w-5.5 h-5.5 rounded-full border border-white/10 relative transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
                      {active && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <ResumeEditor />
        </div>

        {/* Live preview pane (50%) */}
        <div className="hidden lg:flex flex-1 justify-center items-start bg-slate-950/45 dark:bg-black/20 border border-white/5 rounded-3xl overflow-y-auto h-full p-8 shadow-inner select-none relative">
          <div
            className="origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <ResumePreview resume={currentResume} />
          </div>
        </div>

        {/* AI PANEL DRAWER SLIDEOUT */}
        <AnimatePresence>
          {aiPanelOpen && (
            <>
              {/* Overlay on mobile to block */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setAiPanelOpen(false)}
                className="absolute inset-0 z-40 bg-black lg:hidden"
              />

              {/* Drawer Container (w-96 or larger) */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute lg:relative right-0 top-0 h-full w-96 shrink-0 z-55 bg-slate-900/95 dark:bg-bg-dark/95 border-l border-slate-200 dark:border-white/5 backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-base font-bold font-display text-white flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                    AI Career Assistant
                  </h3>
                  <button
                    onClick={() => setAiPanelOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Subnav tools */}
                <div className="grid grid-cols-4 gap-1 border-b border-white/5 pb-3">
                  {[
                    { id: "ats", label: "ATS" },
                    { id: "jobMatch", label: "Match" },
                    { id: "cover", label: "Cover" },
                    { id: "interview", label: "Prep" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAiTool(tab.id as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                        activeAiTool === tab.id
                          ? "bg-cyan-500/20 text-cyan-400 font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ACTIVE TOOL VIEW */}
                <div className="flex-1 overflow-y-auto pr-1 text-sm leading-relaxed flex flex-col gap-5">
                  
                  {/* TOOL 1: ATS ANALYZER */}
                  {activeAiTool === "ats" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">ATS Compatibility Scanner</span>
                        <button
                          onClick={runATSScan}
                          disabled={aiLoading}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/10 cursor-pointer disabled:opacity-50"
                        >
                          {aiLoading ? "Scanning..." : "Scan Resume"}
                        </button>
                      </div>

                      {atsResult ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-slate-950/20">
                            <span className="text-3xl font-black font-display text-cyan-400">{atsResult.score}%</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Estimated Parser Match</span>
                              <span className="text-[10px] text-slate-400">Score of 80%+ recommended.</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-350 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-cyan-400" /> Improvement Advice:</span>
                            <ul className="flex flex-col gap-2 text-xs text-slate-400 list-disc pl-4.5">
                              {atsResult.feedback.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>

                          {atsResult.missingKeywords.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                              <span className="text-xs font-bold text-slate-350">Missing Core Keywords:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {atsResult.missingKeywords.map((k) => (
                                  <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/10 font-bold uppercase tracking-wider">{k}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 rounded-xl border border-dashed border-white/5 flex flex-col items-center gap-3">
                          <FileCheck className="w-10 h-10 text-slate-650" />
                          <p className="text-xs text-slate-400 max-w-[200px]">Trigger scanning to analyze layout hierarchies and missing keywords.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TOOL 2: JOB MATCHER */}
                  {activeAiTool === "jobMatch" && (
                    <div className="flex flex-col gap-4">
                      <span className="text-xs font-bold text-slate-400 uppercase">Paste Targeted Job Description</span>
                      <textarea
                        rows={5}
                        placeholder="Paste full description bullets here..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/10 focus:outline-none focus:border-brand-cyan text-xs leading-relaxed"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />

                      <button
                        onClick={runJobMatch}
                        disabled={aiLoading || !jobDescription.trim()}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {aiLoading ? "Analyzing matches..." : "Analyze Alignment Match"}
                      </button>

                      {matchResult && (
                        <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-slate-950/20">
                            <span className="text-3xl font-black font-display text-emerald-400">{matchResult.matchPercentage}%</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Posting Keyword Match</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                            <span className="font-bold text-slate-350">Matched Keywords:</span>
                            <div className="flex flex-wrap gap-1">
                              {matchResult.matchedKeywords.map((k) => <span key={k} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase">{k}</span>)}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
                            <span className="font-bold text-slate-350">Competency Gaps:</span>
                            <div className="flex flex-wrap gap-1">
                              {matchResult.gapKeywords.map((k) => <span key={k} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase">{k}</span>)}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                            <span className="text-xs font-bold text-slate-350">Refactoring Advice:</span>
                            <ul className="flex flex-col gap-2 text-xs text-slate-400 list-disc pl-4.5">
                              {matchResult.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TOOL 3: COVER LETTER */}
                  {activeAiTool === "cover" && (
                    <div className="flex flex-col gap-4">
                      <span className="text-xs font-bold text-slate-400 uppercase">Write Covering Letter</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Target Company (optional)"
                          className="col-span-2 px-3 py-2 rounded-lg border border-white/10 bg-black/10 text-xs"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <textarea
                          rows={4}
                          placeholder="Paste targeted job description..."
                          className="col-span-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/10 text-xs leading-relaxed"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={runCoverLetter}
                        disabled={aiLoading || !jobDescription.trim()}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {aiLoading ? "Writing Cover Letter..." : "Compile Cover Letter"}
                      </button>

                      {coverResult && (
                        <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                          <textarea
                            rows={12}
                            readOnly
                            className="w-full p-4 rounded-xl border border-white/5 bg-slate-950/20 text-slate-300 text-xs leading-relaxed resize-none focus:outline-none"
                            value={coverResult}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(coverResult);
                              addToast("Cover letter copied to clipboard.", "success");
                            }}
                            className="w-full py-2 rounded-lg border border-white/15 text-xs text-center font-bold text-slate-300 hover:text-white cursor-pointer hover:bg-white/5"
                          >
                            Copy Copy text
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TOOL 4: INTERVIEW PREPARATION */}
                  {activeAiTool === "interview" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Interview Q&A checklist</span>
                        <button
                          onClick={runInterviewPrep}
                          disabled={aiLoading}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/10 cursor-pointer disabled:opacity-50"
                        >
                          {aiLoading ? "Compiling..." : "Generate Qs"}
                        </button>
                      </div>

                      {questionsResult.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {questionsResult.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-950/20 flex flex-col gap-2">
                              <span className="font-extrabold text-xs text-white">Q: {item.question}</span>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="font-bold text-cyan-400 block not-italic mb-1">Tailored Response strategy:</span>
                                {item.suggestedAnswer}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 rounded-xl border border-dashed border-white/5 flex flex-col items-center gap-3">
                          <Cpu className="w-10 h-10 text-slate-650" />
                          <p className="text-xs text-slate-400 max-w-[200px]">Compile customized behavioral and technical questions matching this document profile.</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
