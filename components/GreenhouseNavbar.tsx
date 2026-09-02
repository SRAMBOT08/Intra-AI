'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Search,
  Sparkles,
  ArrowRight,
  X,
  Mic,
  Users,
  Briefcase,
  Zap,
  Globe,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  Sliders,
  TrendingUp,
  Cpu,
  Share2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface GreenhouseNavbarProps {
  variant?: 'light' | 'dark';
}

export function GreenhouseNavbar({ variant = 'light' }: GreenhouseNavbarProps) {
  const pathname = usePathname();
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isSolutionMenuOpen, setIsSolutionMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close menus on route change or ESC
  useEffect(() => {
    setIsProductMenuOpen(false);
    setIsSolutionMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProductMenuOpen(false);
        setIsSolutionMenuOpen(false);
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDark = variant === 'dark';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
          isProductMenuOpen
            ? 'bg-forest-900 border-b border-forest-700/60 text-white shadow-lg'
            : isDark
            ? 'bg-forest-900 text-white border-b border-forest-800'
            : 'bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200/80 shadow-2xs'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            {/* Intra Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-brand text-white font-serif font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                i
              </span>
              <div className="flex items-baseline">
                <span
                  className={`text-2xl font-bold tracking-tight ${
                    isProductMenuOpen || isDark ? 'text-white' : 'text-forest-900'
                  }`}
                  style={{ fontFamily: 'var(--font-sora), Inter, sans-serif' }}
                >
                  intra
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-brand ml-0.5" />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium tracking-tight">
              {/* Product Mega Menu Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsProductMenuOpen(!isProductMenuOpen);
                  setIsSolutionMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
                  isProductMenuOpen
                    ? 'text-emerald-400 font-semibold'
                    : isDark
                    ? 'text-slate-200 hover:text-white'
                    : 'text-slate-700 hover:text-forest-900'
                }`}
              >
                <span>Platform</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isProductMenuOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* How It Works Link */}
              <Link
                href="/#how-it-works"
                className={`py-1.5 transition-colors ${
                  isDark ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-forest-900'
                }`}
              >
                How It Works
              </Link>

              {/* Recruiter Portal */}
              <Link
                href="/recruiter"
                className={`py-1.5 transition-colors ${
                  pathname.startsWith('/recruiter')
                    ? 'text-emerald-600 font-semibold'
                    : isDark
                    ? 'text-slate-200 hover:text-white'
                    : 'text-slate-700 hover:text-forest-900'
                }`}
              >
                Recruiter Portal
              </Link>

              {/* Live Flow Demo */}
              <Link
                href="/latest"
                className={`py-1.5 flex items-center gap-1.5 transition-colors ${
                  pathname === '/latest'
                    ? 'text-emerald-600 font-semibold'
                    : isDark
                    ? 'text-slate-200 hover:text-white'
                    : 'text-slate-700 hover:text-forest-900'
                }`}
              >
                <span>Pipeline Demo</span>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/25">
                  Interactive
                </span>
              </Link>

              {/* Solutions Link */}
              <Link
                href="/solutions"
                className={`py-1.5 transition-colors ${
                  pathname === '/solutions'
                    ? 'text-emerald-600 font-semibold'
                    : isDark
                    ? 'text-slate-200 hover:text-white'
                    : 'text-slate-700 hover:text-forest-900'
                }`}
              >
                Solutions
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Intra"
              className={`p-2 rounded-full transition-colors ${
                isProductMenuOpen || isDark
                  ? 'text-slate-300 hover:text-white hover:bg-forest-800'
                  : 'text-slate-600 hover:text-forest-900 hover:bg-slate-100'
              }`}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Candidate Room CTA */}
            <Link
              href="/candidate/interview/INT-101"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-tight transition-all border ${
                isProductMenuOpen || isDark
                  ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40'
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-emerald-600" />
              <span>Try Candidate Voice AI</span>
            </Link>

            {/* Recruiter Portal CTA (Greenhouse Royal Blue) */}
            <Link
              href="/recruiter"
              className="inline-flex items-center justify-center rounded-full bg-greenhouse-blue hover:bg-greenhouse-blue-hover text-white px-5 py-2 text-xs font-semibold tracking-tight shadow-xs transition-all hover:shadow"
            >
              Recruiter Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH FOREST GREEN MEGA MENU (Platform & Flow Architecture) */}
      {isProductMenuOpen && (
        <div
          className="fixed inset-x-0 top-[60px] bottom-0 z-30 bg-forest-900/98 backdrop-blur-md overflow-y-auto text-white animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ backgroundColor: '#102a22' }}
        >
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 border-b border-forest-700/60 pb-10">
              {/* Column 1: CORE PRODUCTS */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-5 font-mono">
                  Core Modules
                </h3>
                <div className="space-y-4">
                  <Link
                    href="/recruiter"
                    className="group block p-3.5 -mx-3.5 rounded-2xl hover:bg-forest-800/80 transition-colors border border-transparent hover:border-forest-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-brand text-white">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="text-base font-semibold text-white group-hover:text-emerald-300">
                        Intra Recruiting Portal
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                      HR and recruiter command center for job rubrics, candidate pipeline tracking, and 1-to-4 calibrated scorecards.
                    </p>
                  </Link>

                  <Link
                    href="/candidate/interview/INT-101"
                    className="group block p-3.5 -mx-3.5 rounded-2xl hover:bg-forest-800/80 transition-colors border border-transparent hover:border-forest-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/40">
                        <Mic className="h-4 w-4" />
                      </div>
                      <span className="text-base font-semibold text-white group-hover:text-emerald-300">
                        Intra Voice AI Room
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                      Autonomous conversational voice screening room. Multi-persona handoff (Alex Technical + Jordan Product) with real-time waveform streaming.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Column 2: END-TO-END PIPELINE */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-5 font-mono">
                  The Screening Lifecycle
                </h3>
                <ul className="space-y-3 text-xs font-normal">
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="text-slate-200 hover:text-emerald-300 flex items-start gap-2.5 transition-colors p-1.5 rounded-xl hover:bg-forest-800/50"
                    >
                      <Share2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">1. Multi-Channel Application Ingest</div>
                        <p className="text-[11px] text-slate-400">LinkedIn, Internshala, Glassdoor & webhook forms</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="text-slate-200 hover:text-emerald-300 flex items-start gap-2.5 transition-colors p-1.5 rounded-xl hover:bg-forest-800/50"
                    >
                      <Cpu className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">2. AI ATS Matching & Parsing</div>
                        <p className="text-[11px] text-slate-400">Extracts skills, calculates match % & qualifies threshold</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#how-it-works"
                      className="text-slate-200 hover:text-emerald-300 flex items-start gap-2.5 transition-colors p-1.5 rounded-xl hover:bg-forest-800/50"
                    >
                      <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">3. Automated Schedule Dispatch</div>
                        <p className="text-[11px] text-slate-400">Sends time-windowed magic link (48-hour completion deadline)</p>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/recruiter"
                      className="text-slate-200 hover:text-emerald-300 flex items-start gap-2.5 transition-colors p-1.5 rounded-xl hover:bg-forest-800/50"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">4. Scorecard, Anti-Cheat & Shortlist</div>
                        <p className="text-[11px] text-slate-400">Evidence quotes, 1-4 rubrics, biometric verification</p>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: INTEGRATIONS & CONFIGURATION */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-5 font-mono">
                  Integrations & Workflows
                </h3>
                <div className="space-y-3 text-xs">
                  <Link
                    href="/latest"
                    className="block p-3 rounded-2xl bg-forest-800/60 border border-forest-700/60 hover:bg-forest-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Automated Pipeline Demo</span>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                        Live Flow
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Simulate end-to-end candidate intake, ATS scoring, and voice interview dispatch.
                    </p>
                  </Link>

                  <Link
                    href="/recruiter/interviews/new"
                    className="block p-3 rounded-2xl bg-forest-800/60 border border-forest-700/60 hover:bg-forest-800 transition-colors"
                  >
                    <div className="font-semibold text-white">Role & Rubric Setup Wizard</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Configure job requirements and generate AI benchmarks for Voice AI.
                    </p>
                  </Link>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsProductMenuOpen(false)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Close Menu</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Intra Voice AI powered by Agora RTC + Adaptive LLM Intelligence</span>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/candidate/interview/INT-101" className="text-emerald-400 hover:underline font-semibold">
                  Launch Candidate Demo &rarr;
                </Link>
                <Link href="/recruiter" className="text-white hover:underline font-semibold">
                  Open Recruiter Portal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL (Cmd+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-20 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates, roles, rubrics, or documentation..."
                className="w-full text-sm outline-hidden text-slate-900 placeholder:text-slate-400 font-sora"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3 text-xs space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2">
                Quick Navigation
              </div>
              <Link
                href="/recruiter"
                onClick={() => setIsSearchOpen(false)}
                className="block p-2 rounded-xl hover:bg-emerald-50 text-slate-700 font-medium hover:text-emerald-900"
              >
                Recruiter Dashboard & Candidates
              </Link>
              <Link
                href="/candidate/interview/INT-101"
                onClick={() => setIsSearchOpen(false)}
                className="block p-2 rounded-xl hover:bg-emerald-50 text-slate-700 font-medium hover:text-emerald-900"
              >
                Candidate Voice AI Interview Room
              </Link>
              <Link
                href="/latest"
                onClick={() => setIsSearchOpen(false)}
                className="block p-2 rounded-xl hover:bg-emerald-50 text-slate-700 font-medium hover:text-emerald-900"
              >
                Interactive Screening Pipeline Demo
              </Link>
              <Link
                href="/recruiter/interviews/new"
                onClick={() => setIsSearchOpen(false)}
                className="block p-2 rounded-xl hover:bg-emerald-50 text-slate-700 font-medium hover:text-emerald-900"
              >
                Create New Role & Benchmark Rubric
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
