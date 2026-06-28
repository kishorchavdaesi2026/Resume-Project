"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { Sun, Moon, Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiquidGlassNavbar() {
  const pathname = usePathname();
  const { user, logout, init } = useAuthStore();
  const [isDark, setIsDark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Initialize auth state and theme state on mount
  useEffect(() => {
    init();
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkTheme = theme === "dark" || (!theme && systemPrefersDark);
    setIsDark(darkTheme);
  }, [init]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Templates", href: "#templates" },
    { name: "AI Power", href: "#ai-features" },
    { name: "FAQ", href: "#faq" },
  ];

  const navbarHeightClass = scrolled ? "py-3 shadow-lg" : "py-5";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-white/10 dark:border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <svg
            className="w-8 h-8 transition-transform duration-500 group-hover:rotate-[180deg]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z"
              fill="url(#nav-logo-grad)"
            />
            <defs>
              <linearGradient
                id="nav-logo-grad"
                x1="2"
                y1="2"
                x2="22"
                y2="22"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-xl font-bold tracking-tight font-display text-slate-800 dark:text-white">
            Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {pathname === "/" && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-brand-cyan dark:text-slate-300 dark:hover:text-brand-cyan transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        )}

        {/* Actions Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 dark:border-white/5 hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="relative group overflow-hidden px-4.5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-cyan to-brand-blue rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span className="relative z-10 flex items-center gap-1">
                  Build Resume <ArrowRight className="w-4 h-4" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full glass-panel border-b border-white/10 backdrop-blur-2xl absolute top-full left-0 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {pathname === "/" &&
                navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              <hr className="border-white/10 my-2" />
              {user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-white/10 text-slate-200 text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full py-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg border border-white/10 text-slate-200 text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-blue text-white text-sm font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    Build Resume
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
