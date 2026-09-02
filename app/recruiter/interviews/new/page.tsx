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
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Info,
  X,
  Play,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface QuestionItem {
  id: string;
  order: number;
  question: string;
  weight: number;
  hasBenchmarks: boolean;
  greatAnswerBenchmark: string;
}

export default function RecruiterInterviewConfigPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);

  // Role presets
  const ROLE_PRESETS = [
    {
      title: 'Senior Distributed Systems Engineer',
      location: 'Denver, CO (Remote)',
      salary: '$165,000',
      description:
        'Intra is looking for a Senior Distributed Systems Engineer to design high-throughput backend services, optimize database read paths with Redis and PostgreSQL, and drive architectural scalability decisions.',
      duties:
        '• Architect globally distributed ledger and caching layers using PostgreSQL, Redis, and Apache Kafka.\n• Enforce sub-5ms P99 latency SLA guarantees and tune connection pools.\n• Lead cross-functional post-mortems and mentor engineers.',
      competencies: ['system_design', 'scalability', 'customer_impact'],
    },
    {
      title: 'Senior Product Marketing Manager',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$150,000',
      description:
        'Drive positioning, messaging, and go-to-market strategies for Intra enterprise AI screening solutions.',
      duties:
        '• Craft product positioning and competitive battlecards.\n• Coordinate quarterly product launch enablement with sales and customer success.\n• Measure feature adoption and pipeline influence.',
      competencies: ['product_positioning', 'cross_functional', 'metrics_driven'],
    },
    {
      title: 'Enterprise Account Executive',
      location: 'New York, NY (Remote)',
      salary: '$140,000 base / $280,000 OTE',
      description:
        'Own full-cycle enterprise sales evaluations from discovery to procurement across Fortune 500 talent teams.',
      duties:
        '• Execute MEDDPICC sales qualification across multi-stakeholder deals.\n• Navigate complex InfoSec, legal, and procurement reviews.\n• Achieve $2M+ annual contract value quota.',
      competencies: ['enterprise_sales', 'negotiation', 'stakeholder_management'],
    },
  ];

  // Step 1: Role fields
  const [jobTitle, setJobTitle] = useState(ROLE_PRESETS[0].title);
  const [jobLocation, setJobLocation] = useState(ROLE_PRESETS[0].location);
  const [jobSalary, setJobSalary] = useState(ROLE_PRESETS[0].salary);
  const [isRemote, setIsRemote] = useState(true);
  const [jobDescription, setJobDescription] = useState(ROLE_PRESETS[0].description);
  const [coreDuties, setCoreDuties] = useState(ROLE_PRESETS[0].duties);
  const [competencies, setCompetencies] = useState<string[]>(ROLE_PRESETS[0].competencies);

  // Step 2: Questions
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q1',
      order: 1,
      question:
        'How do you design an active-active cache synchronization layer using Redis and Apache Kafka?',
      weight: 3,
      hasBenchmarks: true,
      greatAnswerBenchmark:
        'A great answer details read-through and write-behind patterns, partition routing by customer key, and jittered expiration leases.',
    },
    {
      id: 'q2',
      order: 2,
      question:
        'Tell us about a time you handled split-brain or network partition issues in distributed state.',
      weight: 3,
      hasBenchmarks: true,
      greatAnswerBenchmark:
        'Candidate articulates quorum consensus, vector clocks or fencing tokens to prevent double-spend or stale state writes.',
    },
    {
      id: 'q3',
      order: 3,
      question:
        'How did your architectural decisions improve business metrics like checkout conversion or latency SLAs?',
      weight: 3,
      hasBenchmarks: true,
      greatAnswerBenchmark:
        'Quantifies business outcomes like 14% conversion improvement or compute overhead reduction.',
    },
  ]);

  // Step 3: Candidate & Dispatch
  const [candidateName, setCandidateName] = useState('Dr. Elena Rostova');
  const [candidateEmail, setCandidateEmail] = useState('elena.rostova@techmail.io');
  const [completionWindowHours, setCompletionWindowHours] = useState<number>(48);
  const [cvText, setCvText] = useState(
    `Principal Distributed Systems Architect with 12+ years experience.
Designed and deployed active-active Payment API and settlement engine processing $4B annually.
Architected globally distributed ledger using PostgreSQL, Redis, and Apache Kafka.
Implemented horizontal scaling, caching strategies, PgBouncer connection pooling, and Change Data Capture via Debezium for sub-5ms P99 latency SLA guarantees.`
  );

  // Add Question Modal
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionBenchmark, setNewQuestionBenchmark] = useState('');
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);

  // Output session
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = (preset: typeof ROLE_PRESETS[0]) => {
    setJobTitle(preset.title);
    setJobLocation(preset.location);
    setJobSalary(preset.salary);
    setJobDescription(preset.description);
    setCoreDuties(preset.duties);
    setCompetencies(preset.competencies);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newItem: QuestionItem = {
      id: `q_${Date.now()}`,
      order: questions.length + 1,
      question: newQuestionText,
      weight: 3,
      hasBenchmarks: true,
      greatAnswerBenchmark:
        newQuestionBenchmark ||
        'Candidate clearly addresses core problem with concrete architectural metrics.',
    };
    setQuestions([...questions, newItem]);
    setNewQuestionText('');
    setNewQuestionBenchmark('');
    setIsAddQuestionModalOpen(false);
  };

  const handleGenerateBenchmarks = () => {
    setIsGeneratingBenchmark(true);
    setTimeout(() => {
      setNewQuestionBenchmark(
        `A great answer will detail specific implementation patterns for ${jobTitle}, explaining architectural trade-offs, quantitative SLA impacts, and cross-functional leadership.`
      );
      setIsGeneratingBenchmark(false);
    }, 500);
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

  const stepsList = [
    { num: 1, title: 'Role Overview', desc: 'Job duties & title' },
    { num: 2, title: 'Voice AI Rubric', desc: 'Interview questions & benchmarks' },
    { num: 3, title: 'Candidate & Dispatch', desc: 'Ingestion & 48h deadline' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sora flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Configuring interview rubric for Voice AI (Alex & Jordan multi-persona).</span>
        </div>
        <Link href="/recruiter" className="text-slate-400 hover:text-slate-700">
          <X className="h-4 w-4" />
        </Link>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/recruiter"
              className="text-slate-400 hover:text-slate-700 text-lg font-bold"
            >
              &larr;
            </Link>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Intra AI Screening Setup
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-0.5">
                Configure Role Rubric: <span className="text-emerald-800">{jobTitle}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateInterview}
              disabled={isSubmitting}
              className="rounded-full bg-forest-900 hover:bg-forest-800 text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Publishing & Training...</span>
                </>
              ) : (
                <>
                  <span>Publish Role & Generate Link</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Banner when created */}
        {createdSessionId && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Interview Plan Successfully Generated!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Session ID: <strong className="font-mono">{createdSessionId}</strong> &bull; Candidate:{' '}
                    <strong>{candidateName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(candidateUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="rounded-full bg-white border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Magic Link'}</span>
                </button>

                <Link
                  href={`/candidate/interview/${createdSessionId}`}
                  className="rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Launch Candidate Room</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3-Step Navigation Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stepsList.map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStep(st.num)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeStep === st.num
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    activeStep === st.num ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {st.num}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Step 0{st.num}</span>
              </div>
              <div className="font-serif font-bold text-slate-900 text-sm mt-2">{st.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{st.desc}</div>
            </button>
          ))}
        </div>

        {/* STEP 1: ROLE OVERVIEW & JOB INGESTION */}
        {activeStep === 1 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">Role Requirements & Presets</h2>
                <p className="text-xs text-slate-500">Pick a 1-click role template or customize your own</p>
              </div>

              {/* 1-Click Role Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
                {ROLE_PRESETS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors cursor-pointer ${
                      jobTitle === p.title
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Location</label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Compensation</label>
                <input
                  type="text"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Job Description</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Core Responsibilities</label>
                <textarea
                  rows={3}
                  value={coreDuties}
                  onChange={(e) => setCoreDuties(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white leading-relaxed font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 text-white px-6 py-2.5 text-xs font-semibold shadow-xs hover:bg-forest-800 transition-colors cursor-pointer"
              >
                <span>Continue to Step 2: Voice AI Rubric</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VOICE AI RUBRICS & BENCHMARKS */}
        {activeStep === 2 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">Voice AI Interview Questions</h2>
                <p className="text-xs text-slate-500">Alex and Jordan will ask these questions and evaluate answers on a 1-to-4 scale</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-greenhouse-blue hover:bg-greenhouse-blue-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Interview Question</th>
                    <th className="py-2.5 px-3">Rubric Benchmark</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-semibold text-slate-400">0{q.order}</td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-sm leading-relaxed">
                        {q.question}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-sm text-[11px] leading-relaxed">
                        {q.greatAnswerBenchmark}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter((item) => item.id !== q.id))}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                &larr; Back to Role Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 text-white px-6 py-2.5 text-xs font-semibold shadow-xs hover:bg-forest-800 transition-colors cursor-pointer"
              >
                <span>Continue to Step 3: Candidate & Dispatch</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CANDIDATE GROUNDING & DISPATCH */}
        {activeStep === 3 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Candidate Credentials & Automated 48h Dispatch
                </h2>
                <p className="text-xs text-slate-500">
                  Ingest resume knowledge grounding and set completion window
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Candidate Email</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Interview Window</label>
                <select
                  value={completionWindowHours}
                  onChange={(e) => setCompletionWindowHours(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours (Recommended)</option>
                  <option value={72}>72 Hours</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Candidate Resume / CV Knowledge (Parsed for Grounding)
              </label>
              <textarea
                rows={4}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                &larr; Back to Rubric Questions
              </button>
              <button
                type="button"
                onClick={handleCreateInterview}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-8 py-2.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Publish Role & Generate Candidate Invitation</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ADD QUESTION MODAL */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-serif font-bold text-slate-900">Add Interview Question</h3>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Can you describe how you scale high-throughput PostgreSQL reads..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-blue-900">
                    AI Rubric Benchmark Generator
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateBenchmarks}
                    disabled={isGeneratingBenchmark}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{isGeneratingBenchmark ? 'Generating...' : 'Generate 4.0 Benchmark'}</span>
                  </button>
                </div>

                {newQuestionBenchmark && (
                  <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs space-y-1">
                    <span className="font-semibold text-emerald-800 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Benchmark: 4.0 | Excellent
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed pt-1">
                      {newQuestionBenchmark}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-greenhouse-blue hover:bg-greenhouse-blue-hover text-white px-6 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Intra AI Technologies. Interview Configuration Suite.
      </footer>
    </div>
  );
}
