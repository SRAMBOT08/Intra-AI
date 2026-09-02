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
    <div className="min-h-screen bg-light-surface text-deep-indigo font-sora py-12 px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pale-indigo/40 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-accent/20 px-3 py-1 text-xs font-medium text-deep-indigo border border-yellow-accent/50 mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Recruiter Control Center
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-deep-indigo tracking-tight-section">
              Configure Interview Plan
            </h1>
            <p className="text-sm text-muted-indigo font-normal mt-1.5">
              Set up job requirements, select target competencies, and preview adaptive interviewer personas.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-pale-indigo/60 bg-pure-white px-5 py-2.5 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-colors shadow-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Creation Form */}
        {!createdSessionId ? (
          <form onSubmit={handleCreateInterview} className="space-y-6">
            {/* Job Details Card */}
            <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-8 shadow-card-default space-y-5">
              <div className="flex items-center gap-2.5 text-base font-medium text-deep-indigo">
                <Briefcase className="h-5 w-5 text-deep-indigo" />
                Position Details
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-deep-indigo">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-[16px] border border-pale-indigo/60 bg-light-surface px-4 py-3 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-deep-indigo">Job Description</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-[16px] border border-pale-indigo/60 bg-light-surface px-4 py-3 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Competencies Selector Card */}
            <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-8 shadow-card-default space-y-5">
              <div className="flex items-center gap-2.5 text-base font-medium text-deep-indigo">
                <ShieldCheck className="h-5 w-5 text-teal-accent" />
                Required Competency Model
              </div>
              <p className="text-xs text-muted-indigo font-normal">
                Select the target competencies EchoSphere will evaluate during the interview:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      className={`flex flex-col items-start rounded-[24px] border p-5 text-left transition-all ${
                        isSelected
                          ? 'border-deep-indigo bg-light-surface shadow-card-default ring-2 ring-yellow-accent'
                          : 'border-pale-indigo/40 bg-pure-white hover:border-pale-indigo'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-medium text-deep-indigo">{comp.label}</span>
                        <span
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                            isSelected ? 'bg-deep-indigo text-pure-white font-medium' : 'border border-pale-indigo'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-yellow-accent" />}
                        </span>
                      </div>
                      <span className="mt-3 text-xs text-muted-indigo font-normal">Owner: {comp.owner}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default">
                <div className="flex items-center gap-2 font-medium text-sm text-deep-indigo mb-1.5">
                  <Cpu className="h-4 w-4 text-teal-accent" /> Technical Persona: Alex
                </div>
                <p className="text-xs text-muted-indigo font-normal leading-relaxed">
                  Leads Turn 1 & 2. Probes database architecture, caching strategies, and peak traffic scaling.
                </p>
              </div>

              <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default">
                <div className="flex items-center gap-2 font-medium text-sm text-deep-indigo mb-1.5">
                  <Users className="h-4 w-4 text-yellow-accent" /> Product Persona: Jordan
                </div>
                <p className="text-xs text-muted-indigo font-normal leading-relaxed">
                  Takes over Turn 3 via handoff. Probes business metrics, latency drop-off, and customer outcomes.
                </p>
              </div>
            </div>

            {/* Submit Button with Yellow Accent Ring */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 py-4 text-xs font-medium text-pure-white shadow-cta-yellow transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Interview Session...' : 'Generate Candidate Interview Room'}</span>
              <ArrowRight className="h-4 w-4 text-yellow-accent" />
            </button>
          </form>
        ) : (
          /* Success Screen with Candidate URL */
          <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-10 shadow-card-default space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-accent/20 text-deep-indigo border border-teal-accent/40">
              <Check className="h-8 w-8 text-deep-indigo" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-medium text-deep-indigo tracking-tight">Interview Session Created!</h2>
              <p className="text-xs text-muted-indigo font-normal">
                Candidate interview ID: <span className="font-medium text-deep-indigo">{createdSessionId}</span>
              </p>
            </div>

            <div className="rounded-[20px] border border-pale-indigo/40 bg-light-surface p-5 text-left space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-tight text-muted-indigo">Candidate Link</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={candidateUrl}
                  className="flex-1 rounded-full border border-pale-indigo/50 bg-pure-white px-4 py-2.5 text-xs text-deep-indigo"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(candidateUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 px-5 py-2.5 text-xs font-medium text-pure-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-yellow-accent" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={`/candidate/interview/${createdSessionId}/live`}
                className="inline-flex items-center gap-2 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 px-7 py-3 text-xs font-medium text-pure-white shadow-cta-yellow transition-all"
              >
                <span>Enter as Candidate</span>
                <ExternalLink className="h-4 w-4 text-yellow-accent" />
              </Link>
              <button
                type="button"
                onClick={() => setCreatedSessionId(null)}
                className="rounded-full border border-pale-indigo/60 bg-pure-white px-6 py-3 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-colors shadow-sm"
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
