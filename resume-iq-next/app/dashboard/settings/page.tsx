"use client";

import { useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNotificationStore } from "../../../store/useNotificationStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Sparkles, ShieldCheck, Mail, Globe, Phone, MapPin, Key } from "lucide-react";
import { isAppwriteConfigured } from "../../../services/appwrite";

// Profile schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Password schemas
const passwordSchema = z.object({
  oldPassword: z.string().min(6, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, login } = useAuthStore();
  const { addToast } = useNotificationStore();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      title: "Senior Software Engineer", // demo fallback
      phone: "+1 (555) 019-2834",
      website: "https://janedoe.dev",
      location: "San Francisco, CA",
    }
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSave = async (data: ProfileFormData) => {
    setProfileSaving(true);
    try {
      // Simulate API saving
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Update name in local auth state
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            name: data.name
          }
        });
      }
      addToast("Profile settings saved successfully.", "success");
    } catch {
      addToast("Failed to save profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSave = async (data: PasswordFormData) => {
    setPasswordSaving(true);
    try {
      // Simulate API saving
      await new Promise((resolve) => setTimeout(resolve, 800));
      addToast("Credentials password updated successfully.", "success");
      resetPasswordForm();
    } catch {
      addToast("Password change validation failed.", "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUpgrade = () => {
    if (user) {
      useAuthStore.setState({
        user: { ...user, role: "premium" }
      });
      addToast("Welcome to Pro membership! Premium resume template unlocked.", "success");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">
          Manage your account credentials, default fields, and membership.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Forms column (8 cols equivalent) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* General Profile Section */}
          <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" /> General Profile
            </h2>
            
            <form onSubmit={handleProfileSubmit(onProfileSave)} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  {...regProfile("name")}
                />
                {profileErrors.name && <span className="text-xs text-rose-500">{profileErrors.name.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Job Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                  placeholder="e.g. Principal Architect"
                  {...regProfile("title")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    {...regProfile("phone")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    {...regProfile("website")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    {...regProfile("location")}
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
                >
                  {profileSaving ? "Saving profile..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" /> Security Credentials
            </h2>

            <form onSubmit={handlePasswordSubmit(onPasswordSave)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    placeholder="••••••••"
                    {...regPassword("oldPassword")}
                  />
                  {passwordErrors.oldPassword && <span className="text-xs text-rose-500">{passwordErrors.oldPassword.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    placeholder="••••••••"
                    {...regPassword("newPassword")}
                  />
                  {passwordErrors.newPassword && <span className="text-xs text-rose-500">{passwordErrors.newPassword.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-black/10 focus:outline-none focus:border-brand-cyan text-sm"
                    placeholder="••••••••"
                    {...regPassword("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="text-xs text-rose-500">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
                >
                  {passwordSaving ? "Verifying..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
          
        </div>

        {/* Right billing details column (4 cols equivalent) */}
        <div className="flex flex-col gap-6">
          
          {/* Plan/Billing Box */}
          <div className="glass-panel border border-white/10 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-yellow-500" /> Plan & Subscription
            </h3>
            
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Current Tier</span>
              <span className="text-2xl font-black font-display text-slate-800 dark:text-white mt-1 block">
                {user?.role === "premium" || user?.role === "admin" ? "Pro Membership" : "Starter Free Plan"}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              {user?.role === "premium" || user?.role === "admin"
                ? "You have full unlocked access to all ATS-compliant layouts, resume cloning, and premium cover letter writes."
                : "Unlock executive layouts, unlimited documents cloud backups, and direct ATS matching analyses."}
            </p>

            {!(user?.role === "premium" || user?.role === "admin") && (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.01] transition-all cursor-pointer"
              >
                Upgrade to Pro - $12/mo
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-450 border-t border-slate-200 dark:border-white/5 pt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Payments secured by Stripe checkout.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
