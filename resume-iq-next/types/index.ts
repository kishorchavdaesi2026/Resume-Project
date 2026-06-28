export type UserRole = "user" | "premium" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
}

export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  avatarUrl?: string;
  location: string;
}

export type SectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "languages"
  | "certificates"
  | "achievements";

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  avatarUrl?: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  themeColor: string;
  fontFamily: string;
  fontSize: "sm" | "md" | "lg";
  updatedAt: string;
  isShared: boolean;
  shareSlug: string;
  
  // Embedded section content for easier local & offline storage management
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  achievements: AchievementItem[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
}

export interface AIRequestLog {
  id: string;
  userId: string;
  requestType: string;
  promptTokens: number;
  completionTokens: number;
  timestamp: string;
  status: "success" | "error";
}

export interface ExportHistoryRecord {
  id: string;
  userId: string;
  resumeId: string;
  resumeTitle: string;
  format: "pdf" | "docx";
  fileName: string;
  timestamp: string;
}
