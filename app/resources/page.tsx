'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Play,
  FileText,
  Users,
  Award,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { GreenhouseNavbar } from '@/components/GreenhouseNavbar';

export default function ResourcesPage() {
  const blogs = [
    {
      id: 1,
      category: 'Hiring Flow Stories',
      title: 'How Stripe Scaled System Engineering Screening with Voice AI',
      excerpt:
        'Learn how structured conversational AI reduced recruiter phone screens by 68% while elevating candidate CSAT to 94%.',
      readTime: '6 min read',
      date: 'Aug 24, 2026',
    },
    {
      id: 2,
      category: 'Guidance',
      title: 'Designing Unbiased Technical Rubrics: The 1-to-4 Calibrated Scale',
      excerpt:
        'A comprehensive guide on transitioning from subjective hiring feedback to evidence-backed candidate benchmarks.',
      readTime: '8 min read',
      date: 'Aug 19, 2026',
    },
    {
      id: 3,
      category: 'Customer Stories',
      title: 'Figma’s Journey to Zero Resume Dropout in High-Growth Hiring',
      excerpt:
        'How giving 100% of applicants a conversational voice interview surfaced non-traditional engineering talent.',
      readTime: '5 min read',
      date: 'Aug 12, 2026',
    },
  ];

  const webinars = [
    {
      title: 'The Future of Agentic Voice Recruiting with Agora & LLMs',
      speaker: 'Alex Rivera, Head of Talent Intelligence',
      duration: '45 mins',
      date: 'Sep 12, 2026',
    },
    {
      title: 'Automating High-Volume Candidate Screening with Webhooks & AI',
      speaker: 'Elena Chen, Lead Systems Architect',
      duration: '38 mins',
      date: 'Sep 24, 2026',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sora flex flex-col justify-between">
      <GreenhouseNavbar variant="light" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Intra Hiring Resources & Knowledge Base</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Guidance, Customer Stories & Research
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
            Discover best practices for structured voice interviews, calibrated rubrics, and automated hiring workflows.
          </p>
        </div>

        {/* FEATURED: Talent Maker Book Section (Greenhouse user request) */}
        <section
          id="talent-maker"
          className="rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
          style={{ backgroundColor: '#102a22' }}
        >
          <div className="space-y-4 max-w-2xl">
            <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 border border-emerald-500/30">
              Essential Reading for Talent Leaders
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold leading-tight">
              Talent Makers: How the Best Organizations Win Through Structured Hiring
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-light">
              Explore the foundational playbook on transforming hiring from an administrative burden into a competitive advantage. Packed with real-world case studies and tactical rubrics.
            </p>
            <div className="pt-2">
              <a
                href="#download-book"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all"
              >
                <span>Download Executive Summary (PDF)</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="h-48 w-36 rounded-xl bg-forest-800 border-2 border-emerald-500/40 p-4 flex flex-col justify-between shadow-2xl text-center">
            <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
              Talent Makers
            </div>
            <div className="text-sm font-serif font-bold text-white">
              The Definitive Guide
            </div>
            <div className="text-[9px] text-slate-400">Intra Edition</div>
          </div>
        </section>

        {/* ARTICLES & BLOGS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Latest Guidance & Hiring Flow Stories
            </h2>
            <span className="text-xs text-slate-400 font-medium">Updated Weekly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    {b.category}
                  </span>
                  <h3 className="text-base font-serif font-semibold text-slate-900 leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.excerpt}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{b.readTime}</span>
                  <span className="text-emerald-700 font-semibold hover:underline cursor-pointer">
                    Read article &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WEBINARS & EVENTS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Upcoming Webinars & Masterclasses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webinars.map((w, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{w.date} &bull; {w.duration}</span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-slate-900">{w.title}</h3>
                  <p className="text-xs text-slate-500">Led by {w.speaker}</p>
                </div>

                <button
                  type="button"
                  className="rounded-full bg-forest-900 hover:bg-forest-800 text-white px-4 py-2 text-xs font-semibold shrink-0 transition-colors"
                >
                  Register Free
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Intra AI Technologies. All rights reserved.
      </footer>
    </div>
  );
}
