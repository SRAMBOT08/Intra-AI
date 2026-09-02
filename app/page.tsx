'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Sparkles, Users, Cpu, ArrowRight, ShieldCheck, Activity, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Background glow accents */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/20 blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">EchoSphere</span>
            <span className="ml-2 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
              V1 Hackathon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/recruiter/interviews/new"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Recruiter Portal
          </Link>
          <Link
            href="/candidate/interview/INT-101/live"
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-white shadow-lg shadow-cyan-600/25 transition-all"
          >
            Launch Voice Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center space-y-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          Agora Conversational AI + LangGraph Meta-Orchestrator
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
            Adaptive Multi-Persona <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Voice Interview Intelligence
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400 leading-relaxed">
            EchoSphere conducts real-time voice interviews using Agora RTC and AI. Candidate answers are evaluated
            in real time, and specialized interviewer personas dynamically hand off within a single continuous voice call.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Canonical Demo Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl transition-all hover:border-cyan-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Activity className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                Canonical Demo
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Live Voice Room (Candidate)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Enter the Agora voice room. Alex (Technical) begins by evaluating system design, then seamlessly hands off
              to Jordan (Product) when technical coverage is satisfied.
            </p>

            <Link
              href="/candidate/interview/INT-101/live"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 transition-all"
            >
              Start Canonical Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Recruiter Setup Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                Setup & Reports
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Recruiter Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Configure job descriptions, select target competencies, generate candidate interview links, and review
              evidence-backed assessment reports.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/recruiter/interviews/new"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
              >
                Configure Interview
              </Link>
              <Link
                href="/recruiter/interviews/INT-101/report"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Sample Report <Award className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/60">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-left">
            <Cpu className="h-5 w-5 text-cyan-400 mb-2" />
            <div className="font-bold text-sm text-white">Alex (Technical)</div>
            <div className="text-xs text-slate-400 mt-1">Deep architectural probes, distributed systems, and caching.</div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-left">
            <Users className="h-5 w-5 text-amber-400 mb-2" />
            <div className="font-bold text-sm text-white">Jordan (Product)</div>
            <div className="text-xs text-slate-400 mt-1">Business impact, latency effects on user conversion, product metrics.</div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-left">
            <Award className="h-5 w-5 text-purple-400 mb-2" />
            <div className="font-bold text-sm text-white">Evidence-Backed Reports</div>
            <div className="text-xs text-slate-400 mt-1">Direct quote citations, confidence ratings, and contradiction logs.</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-8 py-4 text-center text-xs text-slate-500">
        EchoSphere V1 • Built for the Agora Conversational AI Hackathon • Member 1 (Intelligence & Orchestrator) + Member 2 (Product, Realtime & Agora)
      </footer>
    </div>
  );
}
