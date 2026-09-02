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
  User,
  FileText,
  FileCode,
} from 'lucide-react';
import Link from 'next/link';

export default function RecruiterInterviewConfigPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('Dr. Elena Rostova');
  const [candidateEmail, setCandidateEmail] = useState('elena.rostova@example.com');
  const [cvText, setCvText] = useState(
    `Principal Distributed Systems Architect with 12+ years experience.
Designed and deployed active-active Payment API and settlement engine processing $4B annually.
Architected globally distributed ledger using PostgreSQL, Redis, and Apache Kafka.
Implemented horizontal scaling, caching strategies, and connection pooling for sub-5ms P99 latency SLA guarantees.`
  );

  const [jobTitle, setJobTitle] = useState('Senior Distributed Systems Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Seeking an experienced engineer to design high-throughput backend services, optimize database read paths with Redis and PostgreSQL, and drive architectural scalability decisions.'
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

  const handleLoadSampleCV = () => {
    setCvText(
      `Principal Distributed Systems Architect with 12+ years experience.
Designed and deployed active-active Payment API and settlement engine processing $4B annually.
Architected globally distributed ledger using PostgreSQL, Redis, Apache Kafka, and CockroachDB.
Implemented horizontal scaling, caching strategies, PgBouncer connection pooling, and Change Data Capture via Debezium for sub-5ms P99 latency SLA guarantees.`
    );
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          cv_text: cvText,
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
              Set up candidate profile, CV ingestion, job requirements, and preview adaptive interviewer personas.
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
            {/* Candidate Details & CV Ingestion Card */}
            <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-8 shadow-card-default space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-base font-medium text-deep-indigo">
                  <User className="h-5 w-5 text-deep-indigo" />
                  Candidate Profile & CV Knowledge
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleCV}
                  className="inline-flex items-center gap-1.5 rounded-full border border-pale-indigo/60 bg-light-surface px-3 py-1 text-[11px] font-medium text-deep-indigo hover:border-deep-indigo transition-colors"
                >
                  <FileCode className="h-3 w-3 text-teal-accent" />
                  Load Sample Architect CV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-deep-indigo">Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full rounded-[16px] border border-pale-indigo/60 bg-light-surface px-4 py-3 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-deep-indigo">Candidate Email</label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full rounded-[16px] border border-pale-indigo/60 bg-light-surface px-4 py-3 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-deep-indigo flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-deep-indigo" />
                    CV / Resume Text (Extracted to Persistent Knowledge Graph)
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste candidate resume text, skills, projects, and experience..."
                  className="w-full rounded-[16px] border border-pale-indigo/60 bg-light-surface px-4 py-3 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors leading-relaxed font-mono"
                  required
                />
              </div>
            </div>

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

            {/* Multi-Persona Preview Card */}
            <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-8 shadow-card-default space-y-4">
              <div className="flex items-center gap-2 text-base font-medium text-deep-indigo">
                <Users className="h-5 w-5 text-deep-indigo" />
                Adaptive Interviewer Panel
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[20px] border border-pale-indigo/40 bg-light-surface p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-deep-indigo text-pure-white flex items-center justify-center font-medium text-sm flex-shrink-0">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-medium text-deep-indigo">Alex — Technical Interviewer</div>
                    <div className="text-[11px] text-muted-indigo mt-0.5">
                      Evaluates architecture, system design, and database read/write bottlenecks.
                    </div>
                  </div>
                </div>
                <div className="rounded-[20px] border border-pale-indigo/40 bg-light-surface p-4 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-teal-accent text-deep-indigo flex items-center justify-center font-medium text-sm flex-shrink-0">
                    J
                  </div>
                  <div>
                    <div className="text-xs font-medium text-deep-indigo">Jordan — Product Lead</div>
                    <div className="text-[11px] text-muted-indigo mt-0.5">
                      Evaluates customer conversion, merchant trust, and cross-functional impact.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-deep-indigo py-4 text-sm font-medium text-pure-white shadow-cta-yellow transition-all hover:bg-deep-indigo/90 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Ingesting CV & Initializing Knowledge Graph...</span>
              ) : (
                <>
                  <span>Create Interview & Generate Session</span>
                  <ArrowRight className="h-4 w-4 text-yellow-accent" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="rounded-[35px] border border-pale-indigo/40 bg-pure-white p-10 shadow-card-default space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-accent/20 border border-teal-accent/40">
              <Sparkles className="h-8 w-8 text-deep-indigo" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-deep-indigo">Interview Session Ready!</h2>
              <p className="text-xs text-muted-indigo max-w-md mx-auto">
                Candidate Knowledge Graph is populated with verified facts. Share this link with the candidate to start the adaptive Agora voice interview:
              </p>
            </div>

            <div className="flex items-center gap-2 max-w-xl mx-auto rounded-[18px] border border-pale-indigo/60 bg-light-surface p-2">
              <input
                type="text"
                readOnly
                value={candidateUrl}
                className="w-full bg-transparent px-3 text-xs text-deep-indigo font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(candidateUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-full bg-deep-indigo px-4 py-2 text-xs font-medium text-pure-white transition-colors hover:bg-deep-indigo/90 flex-shrink-0 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-yellow-accent" /> : <Copy className="h-3.5 w-3.5 text-yellow-accent" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/candidate/interview/${createdSessionId}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-yellow-accent px-6 py-3 text-xs font-medium text-deep-indigo shadow-card-default hover:bg-yellow-accent/90 transition-all cursor-pointer"
              >
                <span>Join Live Interview as Candidate</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCreatedSessionId(null)}
                className="w-full sm:w-auto rounded-full border border-pale-indigo/60 bg-pure-white px-6 py-3 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-colors"
              >
                Configure Another Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
