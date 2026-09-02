'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { GreenhouseNavbar } from '@/components/GreenhouseNavbar';

export default function CommunityPage() {
  const discussions = [
    {
      author: 'Maya Lin',
      company: 'Databricks',
      topic: 'Calibrating LLM voice rubrics for Staff vs Principal engineers',
      replies: 28,
      tags: ['Rubrics', 'System Design'],
    },
    {
      author: 'David Vance',
      company: 'Scale AI',
      topic: 'Handling candidate interview anxiety with AI voice interviewers',
      replies: 42,
      tags: ['Candidate Experience', 'Voice AI'],
    },
    {
      author: 'Sarah Jenkins',
      company: 'Notion',
      topic: 'Best practices for two-way sync between Intra and Greenhouse ATS',
      replies: 19,
      tags: ['Integrations', 'Greenhouse'],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sora flex flex-col justify-between">
      <GreenhouseNavbar variant="light" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Intra Talent Community</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Connect with 12,000+ Talent Leaders
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
            Join recruiters, heads of talent acquisition, and hiring managers exchanging rubric benchmarks, Voice AI strategies, and hiring flow innovations.
          </p>
        </div>

        {/* Community Benefits Banner */}
        <section
          className="rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
          style={{ backgroundColor: '#102a22' }}
        >
          <div className="space-y-4 max-w-2xl">
            <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 border border-emerald-500/30">
              Free Membership for Verified Recruiters
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold leading-snug">
              Access Private Masterclasses, Rubric Templates, and Local Meetups
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
              Collaborate with peers from leading tech and enterprise companies. Benchmark your candidate completion rates and learn modern hiring practices.
            </p>
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all"
              >
                <span>Join Talent Network</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Discussions Forum */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Trending Community Discussions
            </h2>
            <button
              type="button"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              + Start a discussion
            </button>
          </div>

          <div className="space-y-3">
            {discussions.map((d, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{d.author}</span>
                    <span className="text-[11px] text-slate-400">&bull; {d.company}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{d.topic}</h3>
                  <div className="flex items-center gap-2 pt-1">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>{d.replies} replies</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Intra AI Technologies. Community Portal.
      </footer>
    </div>
  );
}
