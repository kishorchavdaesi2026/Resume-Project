import { create } from "zustand";
import { Resume, ExperienceItem, EducationItem, ProjectItem, SkillItem, LanguageItem, CertificateItem, AchievementItem, PersonalInfo } from "../types";
import { databaseService } from "../services/appwrite";

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadResumes: (userId: string) => Promise<void>;
  loadResume: (id: string) => Promise<Resume | null>;
  createResume: (userId: string, title: string) => Promise<Resume>;
  updateResume: (updates: Partial<Resume>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<Resume>;
  
  // Builder specific modifiers (Synchronous local updates)
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  
  addExperience: (item: Omit<ExperienceItem, "id">) => void;
  updateExperience: (id: string, updates: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (items: ExperienceItem[]) => void;

  addEducation: (item: Omit<EducationItem, "id">) => void;
  updateEducation: (id: string, updates: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (items: EducationItem[]) => void;

  addProject: (item: Omit<ProjectItem, "id">) => void;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (items: ProjectItem[]) => void;

  addSkill: (item: Omit<SkillItem, "id">) => void;
  updateSkill: (id: string, updates: Partial<SkillItem>) => void;
  removeSkill: (id: string) => void;

  addLanguage: (item: Omit<LanguageItem, "id">) => void;
  updateLanguage: (id: string, updates: Partial<LanguageItem>) => void;
  removeLanguage: (id: string) => void;

  addCertificate: (item: Omit<CertificateItem, "id">) => void;
  updateCertificate: (id: string, updates: Partial<CertificateItem>) => void;
  removeCertificate: (id: string) => void;

  addAchievement: (item: Omit<AchievementItem, "id">) => void;
  updateAchievement: (id: string, updates: Partial<AchievementItem>) => void;
  removeAchievement: (id: string) => void;

  saveCurrentResume: () => Promise<void>;
  setCurrentResume: (resume: Resume | null) => void;
  clearError: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadResumes: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await databaseService.getResumes(userId);
      set({ resumes });
    } catch (err: any) {
      set({ error: err.message || "Failed to load resumes" });
    } finally {
      set({ isLoading: false });
    }
  },

  loadResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await databaseService.getResume(id);
      if (resume) {
        set({ currentResume: resume });
        return resume;
      }
      return null;
    } catch (err: any) {
      set({ error: err.message || "Failed to load resume" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createResume: async (userId, title) => {
    set({ isLoading: true, error: null });
    try {
      const newResume = await databaseService.createResume(userId, title);
      set((state) => ({
        resumes: [newResume, ...state.resumes],
        currentResume: newResume,
      }));
      return newResume;
    } catch (err: any) {
      set({ error: err.message || "Failed to create resume" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateResume: async (updates) => {
    const { currentResume } = get();
    if (!currentResume) return;

    // Apply local state change immediately
    const updatedResume = {
      ...currentResume,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      currentResume: updatedResume,
      resumes: state.resumes.map((r) => (r.id === currentResume.id ? updatedResume : r)),
    }));

    // Async save to database
    set({ isSaving: true });
    try {
      await databaseService.updateResume(currentResume.id, updates);
    } catch (err: any) {
      console.error("Autosave failed:", err);
    } finally {
      set({ isSaving: false });
    }
  },

  deleteResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.deleteResume(id);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
        currentResume: state.currentResume?.id === id ? null : state.currentResume,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete resume" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  duplicateResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const duplicated = await databaseService.duplicateResume(id);
      set((state) => ({
        resumes: [duplicated, ...state.resumes],
        currentResume: duplicated,
      }));
      return duplicated;
    } catch (err: any) {
      set({ error: err.message || "Failed to duplicate resume" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // builder modifiers:
  updatePersonalInfo: (info) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      personalInfo: {
        ...currentResume.personalInfo,
        ...info,
      },
    });
  },

  updateSummary: (summary) => {
    const { updateResume } = get();
    updateResume({ summary });
  },

  addExperience: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: ExperienceItem = {
      ...item,
      id: "exp_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      experience: [...currentResume.experience, newItem],
    });
  },

  updateExperience: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      experience: currentResume.experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    });
  },

  removeExperience: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      experience: currentResume.experience.filter((exp) => exp.id !== id),
    });
  },

  reorderExperience: (items) => {
    const { updateResume } = get();
    updateResume({ experience: items });
  },

  addEducation: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: EducationItem = {
      ...item,
      id: "edu_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      education: [...currentResume.education, newItem],
    });
  },

  updateEducation: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      education: currentResume.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    });
  },

  removeEducation: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      education: currentResume.education.filter((edu) => edu.id !== id),
    });
  },

  reorderEducation: (items) => {
    const { updateResume } = get();
    updateResume({ education: items });
  },

  addProject: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: ProjectItem = {
      ...item,
      id: "proj_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      projects: [...currentResume.projects, newItem],
    });
  },

  updateProject: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      projects: currentResume.projects.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj)),
    });
  },

  removeProject: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      projects: currentResume.projects.filter((proj) => proj.id !== id),
    });
  },

  reorderProjects: (items) => {
    const { updateResume } = get();
    updateResume({ projects: items });
  },

  addSkill: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: SkillItem = {
      ...item,
      id: "skill_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      skills: [...currentResume.skills, newItem],
    });
  },

  updateSkill: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      skills: currentResume.skills.map((skill) => (skill.id === id ? { ...skill, ...updates } : skill)),
    });
  },

  removeSkill: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      skills: currentResume.skills.filter((skill) => skill.id !== id),
    });
  },

  addLanguage: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: LanguageItem = {
      ...item,
      id: "lang_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      languages: [...currentResume.languages, newItem],
    });
  },

  updateLanguage: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      languages: currentResume.languages.map((lang) => (lang.id === id ? { ...lang, ...updates } : lang)),
    });
  },

  removeLanguage: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      languages: currentResume.languages.filter((lang) => lang.id !== id),
    });
  },

  addCertificate: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: CertificateItem = {
      ...item,
      id: "cert_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      certificates: [...currentResume.certificates, newItem],
    });
  },

  updateCertificate: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      certificates: currentResume.certificates.map((cert) => (cert.id === id ? { ...cert, ...updates } : cert)),
    });
  },

  removeCertificate: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      certificates: currentResume.certificates.filter((cert) => cert.id !== id),
    });
  },

  addAchievement: (item) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    const newItem: AchievementItem = {
      ...item,
      id: "ach_" + Math.random().toString(36).substr(2, 9),
    };
    updateResume({
      achievements: [...currentResume.achievements, newItem],
    });
  },

  updateAchievement: (id, updates) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      achievements: currentResume.achievements.map((ach) => (ach.id === id ? { ...ach, ...updates } : ach)),
    });
  },

  removeAchievement: (id) => {
    const { currentResume, updateResume } = get();
    if (!currentResume) return;
    updateResume({
      achievements: currentResume.achievements.filter((ach) => ach.id !== id),
    });
  },

  saveCurrentResume: async () => {
    const { currentResume } = get();
    if (!currentResume) return;
    set({ isSaving: true });
    try {
      await databaseService.updateResume(currentResume.id, currentResume);
    } catch (err: any) {
      set({ error: err.message || "Failed to save resume changes" });
    } finally {
      set({ isSaving: false });
    }
  },

  setCurrentResume: (resume) => set({ currentResume: resume }),
  clearError: () => set({ error: null }),
}));
