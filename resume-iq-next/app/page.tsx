"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import LiquidGlassNavbar from "../components/LiquidGlassNavbar";
import {
  FeaturesSection,
  TemplatesSection,
  FAQSection,
  Footer,
} from "../components/LandingSections";

// Dynamically import Three.js Hero Canvas with SSR disabled to prevent server-side failures
const HeroCanvas = dynamic(() => import("../components/HeroCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg-light dark:bg-bg-dark text-foreground flex flex-col pt-20 overflow-x-hidden">
      {/* Background Aurora Layers */}
      <div className="aurora-container">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
      </div>

      {/* Sticky Navigation */}
      <LiquidGlassNavbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)]">
          {/* Hero Left Content (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6 relative z-20">
            {/* AI Status Badge */}
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              ResumeIQ Engine v2.0 - Active
            </div>

            {/* Title / Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white leading-[1.1]">
              Elevate Your Profile with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple">
                Next-Gen AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Create a modern, ATS-friendly resume in minutes. Stop writing bullet points manually; let our AI format, score, and align your career milestones with corporate standards.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/register"
                className="relative group overflow-hidden px-8 py-4 rounded-xl text-center text-base font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Build My Resume <ArrowRight className="w-5 h-5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              
              <a
                href="#templates"
                className="px-8 py-4 rounded-xl text-center text-base font-bold border border-slate-200 dark:border-white/10 text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
              >
                Explore Templates
              </a>
            </div>

            {/* Social Trust / Reviews */}
            <div className="flex items-center gap-4 mt-6 border-t border-slate-200 dark:border-white/5 pt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-slate-700 border-2 border-bg-light dark:border-bg-dark flex items-center justify-center text-xs font-bold text-slate-200"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Trusted by 25,000+ builders worldwide.
                </span>
              </div>
            </div>
          </div>

          {/* Hero Right Visuals (7 cols on lg - R3F Canvas) */}
          <div className="lg:col-span-7 flex justify-center items-center relative min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
            <HeroCanvas />
          </div>
        </section>

        {/* Feature Grid */}
        <FeaturesSection />

        {/* Curated Templates Gallery */}
        <TemplatesSection />

        {/* Accordion FAQ Panel */}
        <FAQSection />
      </main>

      {/* Custom Footer */}
      <Footer />
    </div>
  );
}
