import { Client, Account, Databases, Storage, ID, Query } from "appwrite";
import { Resume, User, ExportHistoryRecord, AIRequestLog } from "../types";

// Check if Appwrite env variables are configured
export const isAppwriteConfigured = (() => {
  const endpoint = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    : process.env.APPWRITE_ENDPOINT;
  const project = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_APPWRITE_PROJECT
    : process.env.APPWRITE_PROJECT;

  return !!(
    endpoint &&
    project &&
    project.trim() !== "" &&
    project !== "your_appwrite_project_id"
  );
})();

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;

if (isAppwriteConfigured) {
  try {
    client = new Client();
    client
      .setEndpoint(
        (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT)!
      )
      .setProject(
        (process.env.NEXT_PUBLIC_APPWRITE_PROJECT || process.env.APPWRITE_PROJECT)!
      );

    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);
  } catch (error) {
    console.error("Failed to initialize Appwrite client:", error);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "ResumeIQ: Appwrite credentials are not configured. Falling back to Local Storage / Demo mode. " +
        "Configure NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT to connect to Appwrite."
    );
  }
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK DB HELPERS (For fallback mode)
// ----------------------------------------------------
const getMockData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setMockData = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

const MOCK_USERS_KEY = "resumeiq_mock_users";
const MOCK_RESUMES_KEY = "resumeiq_mock_resumes";
const MOCK_EXPORT_HISTORY_KEY = "resumeiq_mock_exports";
const MOCK_AI_LOGS_KEY = "resumeiq_mock_ai_logs";
const CURRENT_USER_KEY = "resumeiq_current_user";

// Default template structure
const createDefaultResume = (userId: string, title: string): Resume => ({
  id: "resume_" + Math.random().toString(36).substr(2, 9),
  userId,
  title,
  templateId: "ats-classic",
  themeColor: "#2563EB",
  fontFamily: "var(--font-inter)",
  fontSize: "md",
  updatedAt: new Date().toISOString(),
  isShared: false,
  shareSlug: "",
  personalInfo: {
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  certificates: [],
  achievements: [],
});

// Default Mock User
const DEFAULT_MOCK_USER: User = {
  id: "user_mock123",
  email: "builder@resumeiq.ai",
  name: "Jane Doe",
  role: "premium",
  createdAt: new Date().toISOString(),
};

// ----------------------------------------------------
// AUTH SERVICE WRAPPER
// ----------------------------------------------------
export const authService = {
  async register(email: string, pass: string, name: string): Promise<User> {
    if (isAppwriteConfigured && account) {
      const id = ID.unique();
      await account.create(id, email, pass, name);
      // Automatically log in
      await account.createEmailPasswordSession(email, pass);
      const userDetails = await account.get();
      const user: User = {
        id: userDetails.$id,
        email: userDetails.email,
        name: userDetails.name,
        role: "user",
        createdAt: userDetails.$createdAt,
      };
      return user;
    } else {
      const users = getMockData<User[]>(MOCK_USERS_KEY, [DEFAULT_MOCK_USER]);
      if (users.some((u) => u.email === email)) {
        throw new Error("A user with this email already exists.");
      }
      const newUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      setMockData(MOCK_USERS_KEY, users);
      setMockData(CURRENT_USER_KEY, newUser);
      return newUser;
    }
  },

  async login(email: string, pass: string): Promise<User> {
    if (isAppwriteConfigured && account) {
      await account.createEmailPasswordSession(email, pass);
      const userDetails = await account.get();
      // Role checking could query the DB, default to "user" on first login
      const user: User = {
        id: userDetails.$id,
        email: userDetails.email,
        name: userDetails.name,
        role: email.includes("admin") ? "admin" : "premium", // simple mapping for demo
        createdAt: userDetails.$createdAt,
      };
      return user;
    } else {
      const users = getMockData<User[]>(MOCK_USERS_KEY, [DEFAULT_MOCK_USER]);
      const user = users.find((u) => u.email === email);
      if (!user) {
        throw new Error("Invalid credentials.");
      }
      setMockData(CURRENT_USER_KEY, user);
      return user;
    }
  },
  
  async loginOAuth(provider: "google" | "linkedin"): Promise<void> {
    if (isAppwriteConfigured && account) {
      const redirectSuccess = window.location.origin + "/dashboard";
      const redirectFailure = window.location.origin + "/login";
      await account.createOAuth2Session(provider as any, redirectSuccess, redirectFailure);
    } else {
      const mockGoogleUser: User = {
        id: `user_${provider}123`,
        email: `${provider}.builder@gmail.com`,
        name: `${provider === "google" ? "Google" : "LinkedIn"} Builder`,
        role: "premium",
        createdAt: new Date().toISOString()
      };
      
      const users = getMockData<User[]>(MOCK_USERS_KEY, [DEFAULT_MOCK_USER]);
      if (!users.some((u) => u.id === mockGoogleUser.id)) {
        users.push(mockGoogleUser);
        setMockData(MOCK_USERS_KEY, users);
      }
      setMockData(CURRENT_USER_KEY, mockGoogleUser);
    }
  },

  async logout(): Promise<void> {
    if (isAppwriteConfigured && account) {
      await account.deleteSession("current");
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (isAppwriteConfigured && account) {
      try {
        const userDetails = await account.get();
        return {
          id: userDetails.$id,
          email: userDetails.email,
          name: userDetails.name,
          role: userDetails.email.includes("admin") ? "admin" : "premium",
          createdAt: userDetails.$createdAt,
        };
      } catch {
        return null;
      }
    } else {
      return getMockData<User | null>(CURRENT_USER_KEY, null);
    }
  },

  async loginWithGoogleCredential(email: string, name: string, avatarUrl?: string): Promise<User> {
    const googleUser: User = {
      id: "user_google_" + btoa(email).replace(/=/g, "").substr(0, 15),
      email,
      name,
      role: "premium",
      createdAt: new Date().toISOString(),
      avatarUrl: avatarUrl || ""
    };

    const users = getMockData<User[]>(MOCK_USERS_KEY, [DEFAULT_MOCK_USER]);
    if (!users.some((u) => u.email === email)) {
      users.push(googleUser);
      setMockData(MOCK_USERS_KEY, users);
    }
    setMockData(CURRENT_USER_KEY, googleUser);
    return googleUser;
  },
};

// ----------------------------------------------------
// DATABASE SERVICE WRAPPER
// ----------------------------------------------------
export const databaseService = {
  async getResumes(userId: string): Promise<Resume[]> {
    if (isAppwriteConfigured && databases) {
      // In a real Appwrite setup, you'd fetch from collections.
      // For this SaaS template, we bridge Appwrite actions to fall back gracefully.
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          [Query.equal("userId", userId)]
        );
        return response.documents.map((doc) => ({
          id: doc.$id,
          userId: doc.userId,
          title: doc.title,
          templateId: doc.templateId,
          themeColor: doc.themeColor,
          fontFamily: doc.fontFamily,
          fontSize: doc.fontSize,
          updatedAt: doc.$updatedAt,
          isShared: doc.isShared,
          shareSlug: doc.shareSlug,
          personalInfo: JSON.parse(doc.personalInfo),
          summary: doc.summary,
          experience: JSON.parse(doc.experience),
          education: JSON.parse(doc.education),
          projects: JSON.parse(doc.projects),
          skills: JSON.parse(doc.skills),
          languages: JSON.parse(doc.languages),
          certificates: JSON.parse(doc.certificates),
          achievements: JSON.parse(doc.achievements),
        }));
      } catch (err) {
        console.warn("Appwrite error fetching resumes, using mock data:", err);
      }
    }
    // Mock Mode
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    return resumes.filter((r) => r.userId === userId);
  },

  async getResume(id: string): Promise<Resume | null> {
    if (isAppwriteConfigured && databases) {
      try {
        const doc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          id
        );
        return {
          id: doc.$id,
          userId: doc.userId,
          title: doc.title,
          templateId: doc.templateId,
          themeColor: doc.themeColor,
          fontFamily: doc.fontFamily,
          fontSize: doc.fontSize,
          updatedAt: doc.$updatedAt,
          isShared: doc.isShared,
          shareSlug: doc.shareSlug,
          personalInfo: JSON.parse(doc.personalInfo),
          summary: doc.summary,
          experience: JSON.parse(doc.experience),
          education: JSON.parse(doc.education),
          projects: JSON.parse(doc.projects),
          skills: JSON.parse(doc.skills),
          languages: JSON.parse(doc.languages),
          certificates: JSON.parse(doc.certificates),
          achievements: JSON.parse(doc.achievements),
        };
      } catch {
        // Fallback
      }
    }
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    return resumes.find((r) => r.id === id) || null;
  },

  async createResume(userId: string, title: string): Promise<Resume> {
    const newResume = createDefaultResume(userId, title);
    if (isAppwriteConfigured && databases) {
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          newResume.id,
          {
            userId: newResume.userId,
            title: newResume.title,
            templateId: newResume.templateId,
            themeColor: newResume.themeColor,
            fontFamily: newResume.fontFamily,
            fontSize: newResume.fontSize,
            isShared: newResume.isShared,
            shareSlug: newResume.shareSlug,
            personalInfo: JSON.stringify(newResume.personalInfo),
            summary: newResume.summary,
            experience: JSON.stringify(newResume.experience),
            education: JSON.stringify(newResume.education),
            projects: JSON.stringify(newResume.projects),
            skills: JSON.stringify(newResume.skills),
            languages: JSON.stringify(newResume.languages),
            certificates: JSON.stringify(newResume.certificates),
            achievements: JSON.stringify(newResume.achievements),
          }
        );
        return newResume;
      } catch (err) {
        console.warn("Appwrite error creating resume, saving mock:", err);
      }
    }
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    resumes.push(newResume);
    setMockData(MOCK_RESUMES_KEY, resumes);
    return newResume;
  },

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    if (isAppwriteConfigured && databases) {
      try {
        const payload: Record<string, any> = { ...updates };
        // Serialize object structures
        if (updates.personalInfo) payload.personalInfo = JSON.stringify(updates.personalInfo);
        if (updates.experience) payload.experience = JSON.stringify(updates.experience);
        if (updates.education) payload.education = JSON.stringify(updates.education);
        if (updates.projects) payload.projects = JSON.stringify(updates.projects);
        if (updates.skills) payload.skills = JSON.stringify(updates.skills);
        if (updates.languages) payload.languages = JSON.stringify(updates.languages);
        if (updates.certificates) payload.certificates = JSON.stringify(updates.certificates);
        if (updates.achievements) payload.achievements = JSON.stringify(updates.achievements);

        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          id,
          payload
        );
      } catch (err) {
        console.warn("Appwrite error updating resume, saving mock:", err);
      }
    }
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    const idx = resumes.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Resume not found");

    const updatedResume = {
      ...resumes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    resumes[idx] = updatedResume;
    setMockData(MOCK_RESUMES_KEY, resumes);
    return updatedResume;
  },

  async deleteResume(id: string): Promise<void> {
    if (isAppwriteConfigured && databases) {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          id
        );
        return;
      } catch (err) {
        console.warn("Appwrite error deleting resume, deleting mock:", err);
      }
    }
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    const filtered = resumes.filter((r) => r.id !== id);
    setMockData(MOCK_RESUMES_KEY, filtered);
  },

  async duplicateResume(id: string): Promise<Resume> {
    const original = await this.getResume(id);
    if (!original) throw new Error("Original resume not found");

    const duplicated: Resume = {
      ...original,
      id: "resume_" + Math.random().toString(36).substr(2, 9),
      title: `${original.title} (Copy)`,
      updatedAt: new Date().toISOString(),
      isShared: false,
      shareSlug: "",
    };

    if (isAppwriteConfigured && databases) {
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLL || "resumes",
          duplicated.id,
          {
            userId: duplicated.userId,
            title: duplicated.title,
            templateId: duplicated.templateId,
            themeColor: duplicated.themeColor,
            fontFamily: duplicated.fontFamily,
            fontSize: duplicated.fontSize,
            isShared: duplicated.isShared,
            shareSlug: duplicated.shareSlug,
            personalInfo: JSON.stringify(duplicated.personalInfo),
            summary: duplicated.summary,
            experience: JSON.stringify(duplicated.experience),
            education: JSON.stringify(duplicated.education),
            projects: JSON.stringify(duplicated.projects),
            skills: JSON.stringify(duplicated.skills),
            languages: JSON.stringify(duplicated.languages),
            certificates: JSON.stringify(duplicated.certificates),
            achievements: JSON.stringify(duplicated.achievements),
          }
        );
        return duplicated;
      } catch (err) {
        console.warn("Appwrite error duplicating resume, saving mock:", err);
      }
    }
    const resumes = getMockData<Resume[]>(MOCK_RESUMES_KEY, []);
    resumes.push(duplicated);
    setMockData(MOCK_RESUMES_KEY, resumes);
    return duplicated;
  },

  // Export History Methods
  async getExportHistory(userId: string): Promise<ExportHistoryRecord[]> {
    if (isAppwriteConfigured && databases) {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_EXPORTS_COLL || "exportHistory",
          [Query.equal("userId", userId), Query.orderDesc("timestamp")]
        );
        return response.documents.map((doc) => ({
          id: doc.$id,
          userId: doc.userId,
          resumeId: doc.resumeId,
          resumeTitle: doc.resumeTitle,
          format: doc.format,
          fileName: doc.fileName,
          timestamp: doc.timestamp,
        }));
      } catch (err) {
        console.warn("Appwrite error fetching exports, using mock:", err);
      }
    }
    const exports = getMockData<ExportHistoryRecord[]>(MOCK_EXPORT_HISTORY_KEY, []);
    return exports.filter((e) => e.userId === userId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async addExportRecord(record: Omit<ExportHistoryRecord, "id" | "timestamp">): Promise<ExportHistoryRecord> {
    const newRecord: ExportHistoryRecord = {
      ...record,
      id: "exp_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    if (isAppwriteConfigured && databases) {
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_EXPORTS_COLL || "exportHistory",
          newRecord.id,
          newRecord
        );
        return newRecord;
      } catch (err) {
        console.warn("Appwrite error saving export log, saving mock:", err);
      }
    }
    const exports = getMockData<ExportHistoryRecord[]>(MOCK_EXPORT_HISTORY_KEY, []);
    exports.push(newRecord);
    setMockData(MOCK_EXPORT_HISTORY_KEY, exports);
    return newRecord;
  },

  async deleteExportRecord(id: string): Promise<void> {
    if (isAppwriteConfigured && databases) {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_EXPORTS_COLL || "exportHistory",
          id
        );
        return;
      } catch (err) {
        console.warn("Appwrite error deleting export log, deleting mock:", err);
      }
    }
    const exports = getMockData<ExportHistoryRecord[]>(MOCK_EXPORT_HISTORY_KEY, []);
    const filtered = exports.filter((e) => e.id !== id);
    setMockData(MOCK_EXPORT_HISTORY_KEY, filtered);
  },

  // AI request logging
  async addAILog(userId: string, type: string, promptTokens: number, completionTokens: number, status: "success" | "error"): Promise<AIRequestLog> {
    const log: AIRequestLog = {
      id: "ai_" + Math.random().toString(36).substr(2, 9),
      userId,
      requestType: type,
      promptTokens,
      completionTokens,
      timestamp: new Date().toISOString(),
      status,
    };

    if (isAppwriteConfigured && databases) {
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_AI_LOGS_COLL || "aiRequests",
          log.id,
          log
        );
        return log;
      } catch (err) {
        console.warn("Appwrite error saving AI log, saving mock:", err);
      }
    }
    const logs = getMockData<AIRequestLog[]>(MOCK_AI_LOGS_KEY, []);
    logs.push(log);
    setMockData(MOCK_AI_LOGS_KEY, logs);
    return log;
  },

  async getAILogs(): Promise<AIRequestLog[]> {
    if (isAppwriteConfigured && databases) {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "main",
          process.env.NEXT_PUBLIC_APPWRITE_AI_LOGS_COLL || "aiRequests",
          [Query.limit(100), Query.orderDesc("timestamp")]
        );
        return response.documents.map((doc) => ({
          id: doc.$id,
          userId: doc.userId,
          requestType: doc.requestType,
          promptTokens: doc.promptTokens,
          completionTokens: doc.completionTokens,
          timestamp: doc.timestamp,
          status: doc.status,
        }));
      } catch (err) {
        console.warn("Appwrite error fetching AI logs, using mock:", err);
      }
    }
    return getMockData<AIRequestLog[]>(MOCK_AI_LOGS_KEY, []).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
};
