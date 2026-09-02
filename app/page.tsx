'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Sparkles, Users, Cpu, ArrowRight, ShieldCheck, Activity, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-light-surface text-deep-indigo font-sora flex flex-col justify-between">
      {/* Navigation: Pure White Header with subtle pale indigo border */}
      <header className="relative z-10 flex items-center justify-between border-b border-pale-indigo/40 bg-pure-white px-8 py-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-deep-indigo text-pure-white shadow-card-default ring-2 ring-yellow-accent">
            <Mic className="h-5 w-5 text-pure-white" />
          </div>
          <div>
            <span className="text-xl font-medium tracking-tight text-deep-indigo">EchoSphere</span>
            <span className="ml-2.5 rounded-full bg-light-surface px-3 py-0.5 text-xs font-medium text-deep-indigo border border-pale-indigo/40">
              V1 Adaptive Interview
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/recruiter/interviews/new"
            className="rounded-full border border-pale-indigo/60 bg-pure-white px-5 py-2.5 text-deep-indigo hover:border-deep-indigo transition-colors shadow-sm"
          >
            Recruiter Portal
          </Link>
          <Link
            href="/candidate/interview/INT-101/live"
            className="rounded-full bg-deep-indigo px-5 py-2.5 text-pure-white shadow-cta-yellow transition-all hover:bg-deep-indigo/90"
          >
            Launch Voice Demo
          </Link>
        </div>
      </header>

      {/* Hero Section: Centered Wide Column with Editorial Rhythm */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center space-y-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-pale-indigo/60 bg-pure-white px-4 py-1.5 text-xs font-medium text-deep-indigo shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-yellow-accent fill-yellow-accent" />
          Agora Conversational AI + LangGraph Meta-Orchestrator
        </div>

        <div className="space-y-5">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight-hero text-deep-indigo leading-[1.15]">
            Adaptive Multi-Persona <br />
            <span className="text-deep-indigo underline decoration-yellow-accent decoration-wavy decoration-2">
              Voice Interview Intelligence
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-indigo font-normal leading-relaxed tracking-tight-body">
            EchoSphere conducts real-time voice interviews using Agora RTC and AI. Candidate answers are evaluated
            in real time, and specialized interviewer personas dynamically hand off within a single continuous voice call.
          </p>
        </div>

        {/* Action Cards Grid: Elevated Card Frames */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Canonical Demo Card */}
          <div className="group relative overflow-hidden rounded-[35px] border border-pale-indigo/40 bg-pure-white p-9 shadow-card-default transition-all duration-300 hover:shadow-card-elevated hover:border-deep-indigo/40">
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-deep-indigo text-pure-white shadow-sm ring-2 ring-yellow-accent">
                <Activity className="h-6 w-6 text-yellow-accent" />
              </div>
              <span className="rounded-full bg-yellow-accent/20 px-3 py-1 text-xs font-medium text-deep-indigo border border-yellow-accent/50">
                Canonical Demo
              </span>
            </div>

            <h3 className="text-2xl font-medium text-deep-indigo mb-2 tracking-tight">Live Voice Room (Candidate)</h3>
            <p className="text-sm text-muted-indigo font-normal leading-relaxed mb-8">
              Enter the Agora voice room. Alex (Technical) begins by evaluating system design, then seamlessly hands off
              to Jordan (Product) when technical coverage is satisfied.
            </p>

            <Link
              href="/candidate/interview/INT-101/live"
              className="inline-flex items-center gap-2.5 rounded-full bg-deep-indigo px-6 py-3 text-xs font-medium text-pure-white shadow-cta-yellow transition-all hover:bg-deep-indigo/90"
            >
              <span>Start Canonical Demo</span>
              <ArrowRight className="h-4 w-4 text-yellow-accent" />
            </Link>
          </div>

          {/* Recruiter Setup Card */}
          <div className="group relative overflow-hidden rounded-[35px] border border-pale-indigo/40 bg-pure-white p-9 shadow-card-default transition-all duration-300 hover:shadow-card-elevated hover:border-deep-indigo/40">
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-light-surface text-deep-indigo border border-pale-indigo/50">
                <ShieldCheck className="h-6 w-6 text-teal-accent" />
              </div>
              <span className="rounded-full bg-light-surface px-3 py-1 text-xs font-medium text-muted-indigo border border-pale-indigo/40">
                Recruiter Portal
              </span>
            </div>

            <h3 className="text-2xl font-medium text-deep-indigo mb-2 tracking-tight">Recruiter Setup & Reports</h3>
            <p className="text-sm text-muted-indigo font-normal leading-relaxed mb-8">
              Configure job descriptions, select target competencies, generate candidate interview links, and review
              evidence-backed assessment scorecards.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/recruiter/interviews/new"
                className="inline-flex items-center gap-2 rounded-full border border-pale-indigo/60 bg-pure-white px-6 py-3 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-all shadow-sm"
              >
                Configure Interview
              </Link>
              <Link
                href="/recruiter/interviews/INT-101/report"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-medium text-muted-indigo hover:text-deep-indigo transition-colors"
              >
                Sample Report <Award className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights with Sora editorial rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-pale-indigo/30">
          <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 text-left shadow-card-default">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-light-surface text-deep-indigo border border-pale-indigo/40 mb-3">
              <Cpu className="h-5 w-5 text-deep-indigo" />
            </div>
            <div className="font-medium text-base text-deep-indigo tracking-tight">Alex (Technical)</div>
            <div className="text-xs text-muted-indigo font-normal mt-1.5 leading-relaxed">
              Deep architectural probes, distributed systems, caching strategies, and 50k QPS bottlenecks.
            </div>
          </div>

          <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 text-left shadow-card-default">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-light-surface text-deep-indigo border border-pale-indigo/40 mb-3">
              <Users className="h-5 w-5 text-deep-indigo" />
            </div>
            <div className="font-medium text-base text-deep-indigo tracking-tight">Jordan (Product)</div>
            <div className="text-xs text-muted-indigo font-normal mt-1.5 leading-relaxed">
              Business impact, latency effects on user conversion, product metrics, and trade-offs.
            </div>
          </div>

          <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 text-left shadow-card-default">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-light-surface text-deep-indigo border border-pale-indigo/40 mb-3">
              <Award className="h-5 w-5 text-deep-indigo" />
            </div>
            <div className="font-medium text-base text-deep-indigo tracking-tight">Grounded Evidence</div>
            <div className="text-xs text-muted-indigo font-normal mt-1.5 leading-relaxed">
              Direct quote citations, confidence percentages, and contradiction logs generated per round.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-pale-indigo/40 bg-pure-white px-8 py-5 text-center text-xs text-muted-indigo">
        EchoSphere V1 • Agora Conversational AI Hackathon • Member 1 (Intelligence & Orchestrator) + Member 2 (Product, Realtime & Agora)
      </footer>
    </div>
  );
}
