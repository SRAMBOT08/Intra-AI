'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  ShieldCheck,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { GreenhouseNavbar } from '@/components/GreenhouseNavbar';

export default function SolutionsPage() {
  const solutions = [
    {
      id: 'enterprise',
      title: 'Enterprise Organizations',
      subtitle: 'Global scale, custom compliance & two-way ATS sync',
      desc: 'Deploy Intra across distributed business units with granular role-based access control, SOC2 Type II compliance, custom latency SLAs, and bi-directional integration with Greenhouse, Ashby, Workday, and Lever.',
      highlights: [
        'Multi-region deployment and dedicated tenant isolation',
        'Custom calibrated scoring rubrics per hiring committee',
        'Advanced anti-cheat voice biometric verification',
        'Enterprise SLA guarantee and dedicated customer success architect',
      ],
    },
    {
      id: 'midmarket',
      title: 'High-Growth Tech Startups',
      subtitle: 'Screen technical & product talent autonomously',
      desc: 'Scale your engineering and product organizations without burying your senior engineers in early-round screening calls. Let Alex and Jordan rigorously evaluate distributed systems and customer empathy.',
      highlights: [
        'Out-of-the-box system design and product strategy interview kits',
        '12-minute rapid candidate evaluation turnaround',
        'Direct recruiter shortlists delivered to Slack or email',
        'Frictionless candidate experience with zero app downloads',
      ],
    },
    {
      id: 'highvolume',
      title: 'High-Volume Hiring',
      subtitle: 'Zero candidate drop-off with 24/7 AI screening',
      desc: 'Eliminate resume backlogs. Automatically invite 100% of qualified applicants to a conversational voice interview that they can complete on their schedule within a 48-hour window.',
      highlights: [
        'Automated ATS resume parsing and threshold qualification',
        '24/7 candidate interview availability across all time zones',
        '71% average candidate completion rate',
        'Consistent, structured evaluation criteria for every applicant',
      ],
    },
    {
      id: 'fairhiring',
      title: 'Unbiased & Fair Evaluation',
      subtitle: 'Evidence-backed candidate benchmarking',
      desc: 'Remove resume formatting bias and subjective interviewer mood swings. Intra grounds every assessment in exact transcript quotes and specific demonstrated competency evidence.',
      highlights: [
        'Objective 1-to-4 calibrated rating rubric',
        'Evidence-linked assessment findings with audio timestamps',
        'Human-in-the-loop score calibration overrides',
        'Comprehensive audit log for all hiring decisions',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sora flex flex-col justify-between">
      <GreenhouseNavbar variant="light" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>Intra Tailored Solutions</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Hiring Solutions for Every Stage
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
            Whether you are scaling an early-stage engineering team or operating a multi-thousand employee enterprise, Intra adapts to your hiring pipeline.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="space-y-12">
          {solutions.map((sol, index) => (
            <div
              key={sol.id}
              id={sol.id}
              className={`rounded-3xl border border-slate-200 p-8 md:p-12 space-y-6 transition-all ${
                index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white shadow-xs'
              }`}
            >
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono">
                  {sol.subtitle}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                  {sol.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed pt-1">
                  {sol.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {sol.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 shadow-2xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/recruiter"
                  className="inline-flex items-center gap-2 rounded-full bg-forest-900 hover:bg-forest-800 text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition-all"
                >
                  <span>Explore in Recruiter Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/latest"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  See live flow demo &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Intra AI Technologies. Tailored Hiring Solutions.
      </footer>
    </div>
  );
}
