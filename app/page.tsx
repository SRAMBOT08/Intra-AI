'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  Users,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Share2,
  Play,
  Clock,
  Award,
  Zap,
  Layers,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { GreenhouseNavbar } from '@/components/GreenhouseNavbar';
import { AtsWorkflowSimulator } from '@/components/AtsWorkflowSimulator';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sora flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Global Greenhouse Editorial Navbar */}
      <GreenhouseNavbar variant="light" />

      <main className="flex-1">
        {/* HERO SECTION (Greenhouse Editorial Inspo: Deep Forest Green #102a22, Serif Typography, Topographic Pattern) */}
        <section
          className="relative overflow-hidden pt-20 pb-28 md:pt-24 md:pb-36 text-white"
          style={{ backgroundColor: '#102a22' }}
        >
          {/* Subtle Topographic Background Circles */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1200 800"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="600" cy="400" r="100" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="600" cy="400" r="180" stroke="white" strokeWidth="1.5" />
              <circle cx="600" cy="400" r="260" stroke="white" strokeWidth="1.5" strokeDasharray="8 8" />
              <circle cx="600" cy="400" r="340" stroke="white" strokeWidth="1.5" />
              <circle cx="600" cy="400" r="420" stroke="white" strokeWidth="1.5" strokeDasharray="10 10" />
              <circle cx="600" cy="400" r="500" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-5xl px-6 text-center space-y-8 z-10">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-800/90 px-4 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>INTRA INTELLIGENT RECRUITING</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white leading-[1.12]">
              Every candidate gets a real shot.{' '}
              <br className="hidden sm:inline" />
              You get a real signal.
            </h1>

            {/* Value Proposition Description */}
            <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-200 font-light leading-relaxed">
              When candidates tailor resumes with AI, traditional screening breaks down. Intra connects directly to your candidate applications (LinkedIn, Internshala, Glassdoor), performs instant ATS role matching, dispatches structured voice interviews, and delivers calibrated 1-to-4 rubrics straight to your recruiters.
            </p>

            {/* Platform Integration Subtitle */}
            <p className="text-xs sm:text-sm text-slate-400 italic">
              Automated intake for LinkedIn, Internshala, Glassdoor, and custom job forms; ready for your hiring pipeline.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-8 py-3.5 text-sm font-semibold tracking-tight shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Explore Interactive Flow</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/candidate/interview/INT-101"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 hover:border-white bg-transparent hover:bg-white/10 text-white px-7 py-3.5 text-sm font-semibold tracking-tight transition-all"
              >
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>Try Voice AI Room</span>
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKFLOW SIMULATOR (The Heart of Intra's Product Flow) */}
        <section id="how-it-works" className="relative py-20 bg-slate-50 px-6 lg:px-8 border-b border-slate-200/80">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono">
                The Screening Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                How Intra Works End-to-End
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-slate-500">
                Follow an applicant from application intake to ATS resume qualification, automated 48-hour interview scheduling, and live recruiter scorecard review.
              </p>
            </div>

            {/* 4-Step Interactive Simulator Component */}
            <AtsWorkflowSimulator />
          </div>
        </section>

        {/* THREE CORE PILLARS OF INTRA */}
        <section className="py-24 bg-white px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono">
                Designed for Recruiters & Candidates
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                Built for High-Signal, Fair Hiring
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Conversational Multi-Persona Voice AI */}
              <div className="rounded-3xl border border-slate-200 bg-[#fbfcfb] p-8 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Mic className="h-6 w-6 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900">
                    Adaptive Multi-Persona Voice AI
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Alex evaluates technical architecture and latency SLAs, then seamlessly hands off to Jordan to assess customer empathy and cross-functional leadership—all in one conversational call.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/candidate/interview/INT-101"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Test candidate room</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Calibrated Recruiter Scorecards */}
              <div className="rounded-3xl border border-slate-200 bg-[#fbfcfb] p-8 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
                    <Briefcase className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900">
                    Calibrated 1-to-4 Rubrics & Anti-Cheat
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scores are grounded in exact transcript quotes and demonstrated competency evidence. Recruiters can review questions, calibrate scores, and verify voice biometric integrity.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/recruiter"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    <span>Open recruiter portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Multi-Platform Candidate Ingestion */}
              <div className="rounded-3xl border border-slate-200 bg-[#fbfcfb] p-8 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Share2 className="h-6 w-6 text-amber-700" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900">
                    Multi-Platform Candidate Ingestion
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automatically ingest applicants from LinkedIn, Internshala, Glassdoor, or webhook forms directly into the ATS engine to trigger screening without manual data entry.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/latest"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
                  >
                    <span>View interactive flow demo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS BANNER */}
        <section
          className="py-16 text-white"
          style={{ backgroundColor: '#102a22' }}
        >
          <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-4xl font-serif font-bold text-emerald-400">14 hrs</div>
              <div className="text-xs text-slate-300">Saved per recruiter / week</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-serif font-bold text-emerald-400">71%</div>
              <div className="text-xs text-slate-300">Candidate completion rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-serif font-bold text-emerald-400">99.8%</div>
              <div className="text-xs text-slate-300">Voice biometric anti-cheat integrity</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-serif font-bold text-emerald-400">&lt; 48 hrs</div>
              <div className="text-xs text-slate-300">Time to qualified candidate shortlist</div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="py-20 bg-slate-50 px-6 lg:px-8 border-t border-slate-200">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white border border-slate-200 p-8 md:p-12 text-center space-y-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ready to transform candidate screening?</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Experience the Future of AI Hiring
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Test candidate voice interviews on your own device, or explore the recruiter dashboard to review scorecards, rubrics, and shortlist workflows.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/recruiter"
                className="rounded-full bg-forest-900 hover:bg-forest-800 text-white px-8 py-3 text-xs font-semibold shadow-xs transition-all"
              >
                Open Recruiter Dashboard
              </Link>
              <Link
                href="/candidate/interview/INT-101"
                className="rounded-full border border-slate-300 hover:border-slate-400 bg-white px-8 py-3 text-xs font-semibold text-slate-700 transition-colors"
              >
                Try Voice AI Room &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a1c17] text-slate-400 text-xs pt-16 pb-12 border-t border-forest-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-brand text-white font-serif font-bold text-lg">
                  i
                </span>
                <span className="text-xl font-bold tracking-tight text-white">intra</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Intra is the intelligent hiring platform that pairs structured conversational Voice AI with automated ATS workflows to evaluate candidates fairly at scale.
              </p>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Platform
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/recruiter" className="hover:text-white transition-colors">
                    Recruiter Portal
                  </Link>
                </li>
                <li>
                  <Link href="/candidate/interview/INT-101" className="hover:text-white transition-colors">
                    Candidate Voice AI
                  </Link>
                </li>
                <li>
                  <Link href="/latest" className="hover:text-white transition-colors">
                    Interactive Pipeline Demo
                  </Link>
                </li>
                <li>
                  <Link href="/recruiter/interviews/new" className="hover:text-white transition-colors">
                    Create Role Plan
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Solutions
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/solutions#enterprise" className="hover:text-white transition-colors">
                    Enterprise
                  </Link>
                </li>
                <li>
                  <Link href="/solutions#midmarket" className="hover:text-white transition-colors">
                    High-Growth Tech
                  </Link>
                </li>
                <li>
                  <Link href="/solutions#highvolume" className="hover:text-white transition-colors">
                    High-Volume Hiring
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-forest-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>&copy; {new Date().getFullYear()} Intra AI Technologies, Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <Link href="/solutions" className="hover:text-slate-300">Security & Privacy</Link>
              <Link href="/latest" className="hover:text-slate-300">Platform Demo</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
