"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { Mail, Lock, User as UserIcon, UserPlus, ArrowLeft } from "lucide-react";
import { isAppwriteConfigured } from "../../services/appwrite";

// Form validation schema
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register: signup, loginOAuth, loginWithGoogleCredential, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Handle store errors
  useEffect(() => {
    if (error) {
      addToast(error, "error");
      clearError();
    }
  }, [error, addToast, clearError]);

  // Listen for the redirect hash containing the Google OAuth access token
  useEffect(() => {
    const handleHashAuth = async () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const state = params.get("state");

      if (accessToken && state === "google_oauth") {
        // Clear hash from URL immediately so it doesn't linger or refresh-loop
        window.history.replaceState({}, document.title, window.location.pathname);
        
        addToast("Authenticating with Google...", "info");
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!res.ok) throw new Error("Failed to fetch Google profile");
          const profile = await res.json();
          if (profile && profile.email) {
            const { email, name, picture } = profile;
            await loginWithGoogleCredential(email, name, picture);
            addToast("Welcome back! Logged in via Google.", "success");
            router.push("/dashboard");
          }
        } catch (fetchErr) {
          console.error("Google profile fetch error:", fetchErr);
          addToast("Failed to fetch Google profile info.", "error");
        }
      }
    };

    handleHashAuth();
  }, [addToast, loginWithGoogleCredential, router]);

  const triggerGoogleOAuth = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      addToast("Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.", "error");
      return;
    }

    try {
      const redirectUri = window.location.origin + "/register";
      const scope = "openid email profile";
      const responseType = "token";
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=google_oauth`;

      addToast("Redirecting to Google...", "info");
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error("Google OAuth redirect error:", err);
      addToast("Failed to redirect to Google Sign-in.", "error");
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signup(data.email, data.password, data.name);
      addToast("Account created successfully! Welcome to ResumeIQ.", "success");
      router.push("/dashboard");
    } catch {
      // Error handled by useEffect
    }
  };

  const handleOAuth = async (provider: "google" | "linkedin") => {
    try {
      await loginOAuth(provider);
      if (!isAppwriteConfigured) {
        addToast(`Welcome! Account created and logged in via ${provider === "google" ? "Google" : "LinkedIn"} sandbox.`, "success");
        router.push("/dashboard");
      }
    } catch {
      // Error handled by store trigger
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-light dark:bg-bg-dark flex items-stretch overflow-hidden">
      {/* Background Auroras */}
      <div className="aurora-container">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-3"></div>
      </div>

      {/* Left Panel: Form Section (40%) */}
      <main className="w-full lg:w-[40%] flex flex-col justify-between p-8 md:p-12 relative z-10 bg-white/40 dark:bg-bg-dark/45 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Form Card */}
        <div className="w-full max-w-md mx-auto my-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-850 dark:text-white">
              Create Free Account
            </h1>
            <p className="text-sm text-slate-650 dark:text-slate-400">
              Build your first resume in less than 3 minutes.
            </p>
          </div>

          {/* Social Signin Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={triggerGoogleOAuth}
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-2.86-4.53z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth("linkedin")}
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-sky-500 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-3 my-1">
            <hr className="border-slate-200 dark:border-white/5 flex-1" />
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">or sign up with email</span>
            <hr className="border-slate-200 dark:border-white/5 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  className={`w-full pl-10.5 pr-4 py-2.5 rounded-xl border bg-white/5 dark:bg-black/10 focus:bg-white dark:focus:bg-black/35 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all text-sm ${
                    errors.name
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-brand-cyan"
                  }`}
                  placeholder="Jane Doe"
                  {...register("name")}
                />
              </div>
              {errors.name && <span className="text-xs text-rose-500 font-medium">{errors.name.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  className={`w-full pl-10.5 pr-4 py-2.5 rounded-xl border bg-white/5 dark:bg-black/10 focus:bg-white dark:focus:bg-black/35 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all text-sm ${
                    errors.email
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-brand-cyan"
                  }`}
                  placeholder="builder@resumeiq.ai"
                  {...register("email")}
                />
              </div>
              {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  className={`w-full pl-10.5 pr-4 py-2.5 rounded-xl border bg-white/5 dark:bg-black/10 focus:bg-white dark:focus:bg-black/35 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all text-sm ${
                    errors.password
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-brand-cyan"
                  }`}
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && <span className="text-xs text-rose-500 font-medium">{errors.password.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  className={`w-full pl-10.5 pr-4 py-2.5 rounded-xl border bg-white/5 dark:bg-black/10 focus:bg-white dark:focus:bg-black/35 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all text-sm ${
                    errors.confirmPassword
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-brand-cyan"
                  }`}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Creating Account..." : <>Get Started <UserPlus className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center mt-2">
            <p className="text-sm text-slate-650 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-cyan font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-400 mt-6 border-t border-slate-200 dark:border-white/5 pt-6">
          © 2026 ResumeIQ. Built for global builders.
          {!isAppwriteConfigured && <span className="block text-[10px] text-cyan-400/80 mt-1 font-semibold">Demo Sandbox Mode Active</span>}
        </footer>
      </main>

      {/* Right Panel: Marketing Visuals (60%) */}
      <section className="hidden lg:flex lg:w-[60%] bg-slate-900 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-slate-900 to-purple-950/20 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />

        <div className="relative z-10 max-w-lg text-center flex flex-col gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-cyan to-brand-blue flex items-center justify-center shadow-xl">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold font-display text-white tracking-tight">
            Elevate your engineering profile.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            By building with ResumeIQ, you benefit from pre-compiled parsing compliance guidelines built directly into the UI components. Rest easy knowing your formatting translates perfectly into standard recruiter ATS databases.
          </p>
          <div className="flex gap-8 mt-4 border-t border-white/5 pt-6 w-full justify-around">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">25k+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Users Active</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">94%</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Parser Score avg</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">10M+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">AI Words Written</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
