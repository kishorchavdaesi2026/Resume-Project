"use client";

import React, { useState } from "react";
import { useResumeStore } from "../store/useResumeStore";
import { useNotificationStore } from "../store/useNotificationStore";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Plus,
  Trash2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function ResumeEditor() {
  const { currentResume, updatePersonalInfo, updateSummary, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, addProject, updateProject, removeProject, addSkill, removeSkill, addLanguage, removeLanguage, addCertificate, removeCertificate } = useResumeStore();
  const { addToast } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<string>("personal");

  // Local states for additions
  const [newExp, setNewExp] = useState({ company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "" });
  const [newEdu, setNewEdu] = useState({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", current: false, description: "" });
  const [newProj, setNewProj] = useState({ name: "", description: "", url: "", technologies: "" });
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" as any });
  const [newLang, setNewLang] = useState({ name: "", proficiency: "Fluent" as any });
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "", url: "" });

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  if (!currentResume) return null;

  const tabs = [
    { id: "personal", label: "Contact Info", icon: <User className="w-4 h-4" /> },
    { id: "summary", label: "Summary", icon: <FileText className="w-4 h-4" /> },
    { id: "experience", label: "Work History", icon: <Briefcase className="w-4 h-4" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "projects", label: "Projects", icon: <FolderGit2 className="w-4 h-4" /> },
    { id: "skills", label: "Skills & Extras", icon: <Cpu className="w-4 h-4" /> },
  ];

  // ----------------------------------------------------
  // AI HELPERS
  // ----------------------------------------------------
  const handleAISummary = async () => {
    const fullName = `${currentResume.personalInfo.firstName} ${currentResume.personalInfo.lastName}`;
    const skillsList = currentResume.skills.map((s) => s.name);
    const expOverview = currentResume.experience.map((e) => `${e.position} at ${e.company}`).join(", ");
    
    setAiLoading({ ...aiLoading, summary: true });
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, title: currentResume.personalInfo.title, skills: skillsList, experience: expOverview }),
      });
      const data = await res.json();
      if (res.ok) {
        updateSummary(data.summary);
        addToast("AI Summary updated!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to trigger AI writer.", "error");
    } finally {
      setAiLoading({ ...aiLoading, summary: false });
    }
  };

  const handleAIBullet = async (expId: string, bulletText: string) => {
    setAiLoading({ ...aiLoading, [expId]: true });
    try {
      const res = await fetch("/api/ai/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulletText, title: currentResume.personalInfo.title }),
      });
      const data = await res.json();
      if (res.ok) {
        updateExperience(expId, { description: data.improvedText });
        addToast("Bullet rewritten using Google XYZ!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to optimize bullet point.", "error");
    } finally {
      setAiLoading({ ...aiLoading, [expId]: false });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start h-[calc(100vh-210px)] overflow-hidden">
      {/* Vertical Navigation Tabs */}
      <div className="flex flex-row md:flex-col gap-1 w-full md:w-48 shrink-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 pr-0 md:pr-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-cyan-500/15 border-l-2 border-brand-cyan text-brand-cyan"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms Pane */}
      <div className="flex-1 w-full overflow-y-auto h-full pr-1 flex flex-col gap-6">
        
        {/* PERSONAL INFO TAB */}
        {activeTab === "personal" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="Jane"
                  value={currentResume.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="Doe"
                  value={currentResume.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Job Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="Senior React Engineer"
                  value={currentResume.personalInfo.title}
                  onChange={(e) => updatePersonalInfo({ title: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="jane.doe@work.com"
                  value={currentResume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="+1 (555) 019-2834"
                  value={currentResume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="London, UK"
                  value={currentResume.personalInfo.location}
                  onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="https://janedoe.me"
                  value={currentResume.personalInfo.website}
                  onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Professional Summary</h3>
              <button
                onClick={handleAISummary}
                disabled={aiLoading.summary}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 hover:from-brand-cyan/30 hover:to-brand-blue/30 text-xs font-bold text-cyan-400 border border-cyan-500/10 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading.summary ? "AI writing..." : "Write with AI"}
              </button>
            </div>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm resize-none leading-relaxed"
              placeholder="Detail your core leadership accomplishments and values..."
              value={currentResume.summary}
              onChange={(e) => updateSummary(e.target.value)}
            />
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Work History</h3>
            
            {/* Added list */}
            {currentResume.experience.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
                {currentResume.experience.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl glass-panel border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.position}</h4>
                      <p className="text-xs text-slate-500">{item.company} — {item.startDate} to {item.current ? "Present" : item.endDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAIBullet(item.id, item.description)}
                        disabled={aiLoading[item.id]}
                        className="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/15 cursor-pointer"
                        title="Optimize bullet points using Google XYZ"
                      >
                        <Sparkles className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => removeExperience(item.id)}
                        className="p-2 rounded-lg text-rose-450 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Addition form */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Experience Position</span>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newExp.company}
                  onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Position"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newExp.position}
                  onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Location (e.g. SF, CA)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newExp.location}
                  onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Start (e.g. Jan 2024)"
                    className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                    value={newExp.startDate}
                    onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="End"
                    disabled={newExp.current}
                    className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm disabled:opacity-50"
                    value={newExp.current ? "" : newExp.endDate}
                    onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                  />
                </div>
                <label className="col-span-2 flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExp.current}
                    onChange={(e) => setNewExp({ ...newExp, current: e.target.checked })}
                    className="rounded"
                  />
                  I currently work here
                </label>
                <textarea
                  placeholder="Responsibilities & Accomplishments (write bullet points)"
                  className="col-span-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm resize-none"
                  rows={4}
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newExp.company || !newExp.position) {
                    addToast("Company and Position are required.", "error");
                    return;
                  }
                  addExperience(newExp);
                  setNewExp({ company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "" });
                  addToast("Work history added.", "success");
                }}
                className="w-full py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-xs font-semibold hover:opacity-95 cursor-pointer"
              >
                Add Position Item
              </button>
            </div>
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === "education" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Education</h3>
            
            {/* Added list */}
            {currentResume.education.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
                {currentResume.education.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl glass-panel border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.degree} in {item.fieldOfStudy}</h4>
                      <p className="text-xs text-slate-500">{item.school} — {item.startDate} to {item.endDate}</p>
                    </div>
                    <button
                      onClick={() => removeEducation(item.id)}
                      className="p-2 text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Addition form */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Academic Entry</span>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="School Name"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newEdu.school}
                  onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. Bachelor of Science)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g. CS)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm col-span-2"
                  value={newEdu.fieldOfStudy}
                  onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Start Year"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newEdu.startDate}
                  onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="End Year"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newEdu.endDate}
                  onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newEdu.school || !newEdu.degree) {
                    addToast("School and Degree are required.", "error");
                    return;
                  }
                  addEducation(newEdu);
                  setNewEdu({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", current: false, description: "" });
                  addToast("Education logged.", "success");
                }}
                className="w-full py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-xs font-semibold hover:opacity-95 cursor-pointer"
              >
                Add Academic Item
              </button>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Projects</h3>
            
            {/* Added list */}
            {currentResume.projects.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
                {currentResume.projects.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl glass-panel border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.technologies.join(", ")}</p>
                    </div>
                    <button
                      onClick={() => removeProject(item.id)}
                      className="p-2 text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Addition form */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/10 flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Technical Project</span>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newProj.name}
                  onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Project URL (optional)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newProj.url}
                  onChange={(e) => setNewProj({ ...newProj, url: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Technologies (comma separated)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm col-span-2"
                  value={newProj.technologies}
                  onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                />
                <textarea
                  placeholder="Project overview & contributions"
                  className="col-span-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm resize-none"
                  rows={3}
                  value={newProj.description}
                  onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newProj.name) {
                    addToast("Project Name is required.", "error");
                    return;
                  }
                  const formattedProj = {
                    ...newProj,
                    technologies: newProj.technologies.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
                  };
                  addProject(formattedProj);
                  setNewProj({ name: "", description: "", url: "", technologies: "" });
                  addToast("Project item added.", "success");
                }}
                className="w-full py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-xs font-semibold hover:opacity-95 cursor-pointer"
              >
                Add Project Item
              </button>
            </div>
          </div>
        )}

        {/* SKILLS & EXTRAS TAB */}
        {activeTab === "skills" && (
          <div className="flex flex-col gap-6">
            
            {/* Skills */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills Tags</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentResume.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5 bg-white/5 text-xs font-semibold"
                  >
                    {s.name} <span className="text-[9px] text-slate-400 font-normal">({s.level})</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(s.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
                <select
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 dark:bg-bg-dark focus:outline-none focus:border-brand-cyan text-xs font-bold"
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSkill.name.trim()) return;
                    addSkill(newSkill);
                    setNewSkill({ name: "", level: "Intermediate" });
                  }}
                  className="px-4 bg-white/10 dark:bg-white/5 border border-white/10 text-cyan-400 rounded-lg text-xs font-bold hover:bg-white/15 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentResume.languages.map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5 bg-white/5 text-xs font-semibold"
                  >
                    {l.name} <span className="text-[9px] text-slate-400 font-normal">({l.proficiency})</span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(l.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Spanish"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newLang.name}
                  onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
                />
                <select
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 dark:bg-bg-dark focus:outline-none focus:border-brand-cyan text-xs font-bold"
                  value={newLang.proficiency}
                  onChange={(e) => setNewLang({ ...newLang, proficiency: e.target.value as any })}
                >
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newLang.name.trim()) return;
                    addLanguage(newLang);
                    setNewLang({ name: "", proficiency: "Fluent" });
                  }}
                  className="px-4 bg-white/10 dark:bg-white/5 border border-white/10 text-cyan-400 rounded-lg text-xs font-bold hover:bg-white/15 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</h4>
              <div className="flex flex-col gap-2 mb-2">
                {currentResume.certificates.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-white/5 bg-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="block text-[10px] text-slate-500">{c.issuer} ({c.date})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertificate(c.id)}
                      className="p-1 text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-white/5 bg-slate-50/50 dark:bg-black/10">
                <input
                  type="text"
                  placeholder="Cert Name (e.g. AWS Solutions Architect)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm col-span-2"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g. Amazon)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Date (e.g. 2025)"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/5 bg-white/5 focus:outline-none focus:border-brand-cyan text-sm"
                  value={newCert.date}
                  onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCert.name) return;
                    addCertificate(newCert);
                    setNewCert({ name: "", issuer: "", date: "", url: "" });
                    addToast("Certification logged.", "success");
                  }}
                  className="col-span-2 py-2 bg-white/10 dark:bg-white/5 border border-white/10 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-white/15 cursor-pointer"
                >
                  Add Certification
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
