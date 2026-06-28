"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  FileSearch,
  CheckCircle,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";

// ----------------------------------------------------
// FEATURES SECTION
// ----------------------------------------------------
export function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      title: "AI Professional Summary",
      desc: "Instantly compile a tailored, executive professional summary highlighting key career milestones.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Google XYZ Bullet Optimizer",
      desc: "Upgrade work history statements with action-oriented phrases and quantitative business impacts.",
    },
    {
      icon: <FileSearch className="w-6 h-6 text-purple-400" />,
      title: "ATS Real-Time Score",
      desc: "Scan your resume against common parser algorithms to discover layout flags and missing keywords.",
    },
    {
      icon: <FileText className="w-6 h-6 text-pink-400" />,
      title: "Targeted Cover Letter",
      desc: "Auto-generate cover letters matching job descriptions directly, increasing application conversion rates.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Career Advice & Match",
      desc: "Compare your resume profile to targeted postings and receive direct recommendations to bridge qualifications.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
      title: "Private Cloud Encryption",
      desc: "Your professional experience remains secure. Export, lock, or duplicate profiles with signed credentials.",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white mb-4">
            AI-Engineered to Elevate Your Profile
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Stop sending average applications. Leverage enterprise-grade AI writing tools and real-time page builders to get noticed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl glass-card flex flex-col items-start gap-4"
            >
              <div className="p-3.5 rounded-xl bg-white/10 dark:bg-white/5 border border-white/10 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// TEMPLATES SECTION
// ----------------------------------------------------
export function TemplatesSection() {
  const templates = [
    {
      id: "ats-classic",
      name: "ATS Classic",
      desc: "Ultra-clean, single column layout designed to feed perfectly into standard company scanner algorithms.",
      preview: "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 border-t-8 border-slate-600",
      premium: false
    },
    {
      id: "modern-tech",
      name: "Modern Tech",
      desc: "Dual-column layout with dark side header accent, emphasizing key skill chips and certification timelines.",
      preview: "bg-gradient-to-br from-indigo-200 to-slate-300 dark:from-indigo-950/20 dark:to-slate-900 border-t-8 border-blue-500",
      premium: false
    },
    {
      id: "creative-glass",
      name: "Creative Glass",
      desc: "Modern designer look featuring gradient margins, elegant serif header typography, and micro-dividers.",
      preview: "bg-gradient-to-br from-cyan-200 to-purple-300 dark:from-cyan-950/20 dark:to-purple-950/20 border-t-8 border-cyan-400",
      premium: true
    }
  ];

  return (
    <section id="templates" className="py-24 bg-slate-100/50 dark:bg-black/20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white mb-4">
            Curated Elite Designs
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Choose from a selection of templates verified by top industry recruiting managers. Customize colors, sizes, and fonts in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((tpl, idx) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group rounded-2xl glass-panel border border-white/10 dark:border-white/5 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Visual Preview Box */}
                <div className={`h-64 ${tpl.preview} transition-transform duration-500 group-hover:scale-[1.01] relative flex items-center justify-center p-6 overflow-hidden`}>
                  {tpl.premium && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      PREMIUM
                    </span>
                  )}
                  {/* Simulate page lines */}
                  <div className="w-full h-full bg-white/50 dark:bg-slate-900/60 rounded-lg shadow-2xl p-4 flex flex-col gap-3">
                    <div className="w-1/3 h-3 bg-slate-400/40 rounded" />
                    <div className="w-2/3 h-2 bg-slate-400/20 rounded" />
                    <hr className="border-slate-400/20" />
                    <div className="w-full h-2 bg-slate-400/10 rounded" />
                    <div className="w-full h-2 bg-slate-400/10 rounded" />
                    <div className="w-5/6 h-2 bg-slate-400/10 rounded" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display mb-2">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tpl.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-lg border border-white/10 dark:border-white/5 hover:border-brand-cyan/40 hover:bg-brand-cyan/5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Use Template <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// PRICING SECTION
// ----------------------------------------------------
export function PricingSection() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      desc: "Perfect for testing layout options and generating standard resume lists.",
      features: [
        "Create up to 2 Resumes",
        "Access 2 Free Templates",
        "Unlimited PDF Exports",
        "Local Storage Backup",
        "Static Cover Letter templates"
      ],
      cta: "Get Started Free",
      popular: false,
      href: "/register"
    },
    {
      name: "Pro Professional",
      price: "$12",
      desc: "For active job seekers who want direct ATS optimization and AI cover letters.",
      features: [
        "Create Unlimited Resumes",
        "Access All Premium Templates",
        "Full AI Summary Writer",
        "Real-Time ATS Scanning",
        "AI Google XYZ Bullet Rewriter",
        "Unlimited PDF & DOCX Exports",
        "Cloud Storage & QR Sharing"
      ],
      cta: "Start Pro Trial",
      popular: true,
      href: "/register"
    },
    {
      name: "Enterprise",
      price: "$39",
      desc: "For cohorts, universities, and coaching centers needing team dashboards.",
      features: [
        "Everything in Pro Plan",
        "Multi-user Admin Panel",
        "Team Usage Reports & Logs",
        "API access to PDF generators",
        "Premium support channels"
      ],
      cta: "Contact Sales",
      popular: false,
      href: "/register"
    }
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white mb-4">
            Transparent, Value-Focused Pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Start completely free. Upgrade anytime you want to unlock advanced AI capabilities and premium design formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-8 rounded-2xl relative flex flex-col justify-between ${
                tier.popular
                  ? "bg-slate-900 dark:bg-slate-950 border border-brand-cyan shadow-cyan-500/10 shadow-2xl scale-[1.02] md:scale-[1.03] z-10 text-white"
                  : "glass-panel border-white/10 dark:border-white/5"
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-xs font-bold px-4.5 py-1.5 rounded-full shadow-lg">
                  MOST POPULAR
                </span>
              )}
              
              <div>
                <h3 className={`text-xl font-bold font-display ${tier.popular ? "text-cyan-400" : "text-slate-800 dark:text-white"}`}>
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold font-display ${tier.popular ? "text-white" : "text-slate-850 dark:text-white"}`}>{tier.price}</span>
                  <span className={`text-sm ${tier.popular ? "text-slate-400" : "text-slate-650 dark:text-slate-400"}`}>/month</span>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${tier.popular ? "text-slate-350" : "text-slate-650 dark:text-slate-400"}`}>
                  {tier.desc}
                </p>
                
                <hr className={`my-6 ${tier.popular ? "border-white/10" : "border-slate-200 dark:border-white/5"}`} />

                <ul className="flex flex-col gap-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.popular ? "text-cyan-400" : "text-brand-cyan"}`} />
                      <span className={tier.popular ? "text-slate-250" : "text-slate-750 dark:text-slate-350"}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={tier.href}
                  className={`w-full py-3 rounded-lg text-center text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
                    tier.popular
                      ? "bg-gradient-to-r from-brand-cyan to-brand-blue text-white hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20"
                      : "bg-white/10 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:border-brand-cyan/40 hover:bg-brand-cyan/5 text-slate-800 dark:text-white"
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// FAQ SECTION (Collapsible Accordion)
// ----------------------------------------------------
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-white/5 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-2 font-display font-semibold text-lg text-slate-800 dark:text-white hover:text-brand-cyan transition-colors cursor-pointer"
      >
        <span>{q}</span>
        {open ? <Minus className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="py-3 text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const faqs = [
    {
      q: "What makes ResumeIQ templates ATS-friendly?",
      a: "Our templates are structured in single or clean dual columns using standard section header text, web-safe typography, and standard font hierarchies that search algorithms expect. We avoid background graphical lines, complex icons, or non-standard tables that confuse parsing software.",
    },
    {
      q: "Can I use the AI assistant for rewriting specific experience bullets?",
      a: "Yes. In our builder, there is a dedicated 'AI Suggest' assistant next to each section. You can select any work experience bullet point and let the AI instantly rewrite it using performance action verbs and quantified impact metrics.",
    },
    {
      q: "How does the PDF export process work?",
      a: "We render the resume to a print-optimized window, utilizing CSS page-break properties. When you export, our engine converts the styled document directly into a high-fidelity vector-based PDF. This ensures the output maintains precise letter sizing, grid positioning, and text colors.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Absolutely. You can manage your billing directly from your user profile settings page. If you downgrade, your premium resumes will be locked for editing but your documents and data will remain saved safely in your account.",
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Answers to common questions regarding layout styles, formatting exports, and AI subscriptions.
          </p>
        </div>

        <div className="glass-panel border-white/10 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-2">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// FOOTER
// ----------------------------------------------------
export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z"
                fill="url(#foot-logo-grad)"
              />
              <defs>
                <linearGradient
                  id="foot-logo-grad"
                  x1="2"
                  y1="2"
                  x2="22"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-lg font-bold font-display tracking-tight">ResumeIQ</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The next-generation AI resume builder designed to help global builders pass parser screens and land roles.
          </p>
        </div>

        <div>
          <h4 className="font-semibold font-display text-sm uppercase tracking-wider text-slate-350 mb-4">Product</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
            <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
            <li><a href="#templates" className="hover:text-cyan-400 transition-colors">Templates</a></li>
            <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold font-display text-sm uppercase tracking-wider text-slate-350 mb-4">Resources</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">ATS Guidelines</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Career Blog</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold font-display text-sm uppercase tracking-wider text-slate-350 mb-4">Newsletter</h4>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Subscribe to our weekly job-search hacks newsletter.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="name@domain.com"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 w-full"
            />
            <button className="bg-gradient-to-r from-brand-cyan to-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© 2026 ResumeIQ. All rights reserved. Created by DeepMind pair programming.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
