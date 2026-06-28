import { create } from "zustand";
import { User } from "../types";
import { authService } from "../services/appwrite";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  init: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginOAuth: (provider: "google" | "linkedin") => Promise<void>;
  loginWithGoogleCredential: (email: string, name: string, avatarUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts loading while verifying session
  error: null,

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to restore session", isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, pass);
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to log in", isAuthenticated: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, pass, name) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(email, pass, name);
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to register", isAuthenticated: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginOAuth: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      await authService.loginOAuth(provider);
      // In sandbox mode, fetch session immediately
      const user = await authService.getCurrentUser();
      if (user) {
        set({ user, isAuthenticated: true });
      }
    } catch (err: any) {
      set({ error: err.message || "OAuth login failed", isAuthenticated: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogleCredential: async (email, name, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.loginWithGoogleCredential(email, name, avatarUrl);
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.message || "Google Sign-In failed", isAuthenticated: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to log out" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
