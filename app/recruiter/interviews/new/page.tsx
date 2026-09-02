'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  ShieldCheck,
  Cpu,
  Users,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function RecruiterInterviewConfigPage() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('Senior Distributed Systems Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Seeking an experienced engineer to design high-throughput backend services, optimize database read paths with Redis, and drive architectural decisions.'
  );

  const [competencies, setCompetencies] = useState<string[]>([
    'system_design',
    'scalability',
    'customer_impact',
  ]);

  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCompetency = (comp: string) => {
    if (competencies.includes(comp)) {
      if (competencies.length > 1) {
        setCompetencies(competencies.filter((c) => c !== comp));
      }
    } else {
      setCompetencies([...competencies, comp]);
    }
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription,
          required_competencies: competencies,
          initial_agent_id: 'technical',
        }),
      });
      const data = await res.json();
      if (data?.interview_id) {
        setCreatedSessionId(data.interview_id);
      }
    } catch (err) {
      console.error('Failed to create interview:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const candidateUrl = createdSessionId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/candidate/interview/${createdSessionId}`
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Recruiter Control Center
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Configure Interview Plan
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Set up job requirements, required competencies, and adaptive interviewer personas.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Creation Form */}
        {!createdSessionId ? (
          <form onSubmit={handleCreateInterview} className="space-y-6">
            {/* Job Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                Position Details
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Job Description</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Competencies Selector Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Required Competency Model
              </div>
              <p className="text-xs text-slate-400">
                Select the target competencies EchoSphere will evaluate during the interview:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'system_design', label: 'System Design', owner: 'Alex (Technical)' },
                  { id: 'scalability', label: 'Scalability', owner: 'Alex (Technical)' },
                  { id: 'customer_impact', label: 'Customer Impact', owner: 'Jordan (Product)' },
                ].map((comp) => {
                  const isSelected = competencies.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => toggleCompetency(comp.id)}
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-cyan-500/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-bold text-white">{comp.label}</span>
                        <span
                          className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-cyan-500 text-black font-bold' : 'border border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                      </div>
                      <span className="mt-2 text-[11px] text-slate-400">Owner: {comp.owner}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1">
                  <Cpu className="h-4 w-4" /> Technical Persona: Alex
                </div>
                <p className="text-xs text-slate-400">
                  Leads Turn 1 & 2. Probes database architecture, caching strategies, and peak traffic scaling.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-1">
                  <Users className="h-4 w-4" /> Product Persona: Jordan
                </div>
                <p className="text-xs text-slate-400">
                  Takes over Turn 3 via handoff. Probes business metrics, latency drop-off, and customer outcomes.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 py-3.5 text-xs font-bold text-white shadow-xl shadow-cyan-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Interview Session...' : 'Generate Candidate Interview Room'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          /* Success Screen with Candidate URL */
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Check className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Interview Session Created!</h2>
              <p className="text-xs text-slate-400">
                Candidate interview ID: <span className="font-mono text-cyan-400 font-bold">{createdSessionId}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Candidate Link</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={candidateUrl}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(candidateUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={`/candidate/interview/${createdSessionId}/live`}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all"
              >
                Enter as Candidate <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setCreatedSessionId(null)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Create Another Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
