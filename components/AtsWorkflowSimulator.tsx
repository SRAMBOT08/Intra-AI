'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Mail,
  Clock,
  ArrowRight,
  FileText,
  User,
  Phone,
  Briefcase,
  Share2,
  Cpu,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';

interface CandidateApplication {
  name: string;
  email: string;
  phone: string;
  source: 'LinkedIn' | 'Internshala' | 'Glassdoor' | 'Direct Form';
  role: string;
  cvText: string;
}

export function AtsWorkflowSimulator() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [candidate, setCandidate] = useState<CandidateApplication>({
    name: 'Elena Rostova',
    email: 'elena.rostova@techmail.io',
    phone: '+1 (555) 382-9012',
    source: 'LinkedIn',
    role: 'Senior Distributed Systems Engineer',
    cvText: `Principal Distributed Systems Architect with 12+ years experience.
Architected globally distributed ledger with PostgreSQL, Redis, and Apache Kafka.
Implemented connection pooling and asynchronous cache-aside patterns to achieve sub-5ms P99 latency SLA guarantees.`,
  });

  const [atsScore, setAtsScore] = useState<number>(94);
  const [isProcessingAts, setIsProcessingAts] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Dynamic interview deadline (48 hours from now)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineStr = `${tomorrow.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })} at 5:00 PM`;

  const handleSourceSelect = (src: 'LinkedIn' | 'Internshala' | 'Glassdoor' | 'Direct Form') => {
    if (src === 'LinkedIn') {
      setCandidate({
        name: 'Elena Rostova',
        email: 'elena.rostova@techmail.io',
        phone: '+1 (555) 382-9012',
        source: 'LinkedIn',
        role: 'Senior Distributed Systems Engineer',
        cvText: `Principal Distributed Systems Architect with 12+ years experience.
Architected globally distributed ledger with PostgreSQL, Redis, and Apache Kafka.
Implemented connection pooling and asynchronous cache-aside patterns to achieve sub-5ms P99 latency SLA guarantees.`,
      });
    } else if (src === 'Internshala') {
      setCandidate({
        name: 'Aarav Sharma',
        email: 'aarav.sharma@intern.dev',
        phone: '+91 98450 12345',
        source: 'Internshala',
        role: 'Backend Engineering Fellow',
        cvText: `Full-stack & systems developer. Built asynchronous microservices in Go and Python FastAPI.
Created real-time event streaming pipeline processing 25,000 events/sec with Kafka and Redis.`,
      });
    } else if (src === 'Glassdoor') {
      setCandidate({
        name: 'Jordan Alvarez',
        email: 'jordan.alvarez@cloudops.org',
        phone: '+1 (415) 791-8820',
        source: 'Glassdoor',
        role: 'Staff Infrastructure Lead',
        cvText: `Infrastructure architect specializing in Kubernetes, multi-region failover, and zero-downtime database migrations.
Maintained 99.999% uptime for core financial checkout services.`,
      });
    } else {
      setCandidate({
        name: 'Josh Blake',
        email: 'josh.blake@saaspro.com',
        phone: '+1 (303) 612-4411',
        source: 'Direct Form',
        role: 'Senior Product Marketing Manager',
        cvText: `Led GTM product launches across 4 enterprise B2B SaaS platforms.
Collaborated with engineering & sales to boost organic adoption by 42% in 2 quarters.`,
      });
    }
  };

  const runAtsEvaluation = () => {
    setIsProcessingAts(true);
    setTimeout(() => {
      setIsProcessingAts(false);
      setActiveStep(2);
    }, 800);
  };

  const dispatchScheduleEmail = () => {
    setEmailSent(true);
    setTimeout(() => {
      setActiveStep(3);
    }, 400);
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-xl text-slate-800">
      {/* Header with Greenhouse Workflow steps */}
      <div className="border-b border-slate-100 pb-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-2">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              Live ATS & Voice AI Integration Flow
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900">
              From Candidate Application to AI Interview & Recruiter Shortlist
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Connect external platforms (LinkedIn, Internshala, Glassdoor) via webhooks & API, parse ATS requirements, and dispatch dynamic voice interview windows.
            </p>
          </div>

          {/* Step Badges */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeStep === 1
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Intake
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeStep === 2
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. ATS Match
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeStep === 3
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Automated Email
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeStep === 4
                  ? 'bg-forest-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Voice AI & Scorecard
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Application Intake Form */}
      {activeStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Choose Integration Source (or type custom applicant details):
              </label>
              <span className="text-xs text-slate-400">Endpoint: /api/candidate-intake</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['LinkedIn', 'Internshala', 'Glassdoor', 'Direct Form'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSourceSelect(s)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold border transition-all ${
                    candidate.source === s
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Candidate Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={candidate.name}
                  onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Candidate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={candidate.email}
                  onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={candidate.phone}
                  onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Parsed CV / Resume Experience
            </label>
            <textarea
              rows={3}
              value={candidate.cvText}
              onChange={(e) => setCandidate({ ...candidate, cvText: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Selected Role:{' '}
              <strong className="text-slate-800 font-semibold">{candidate.role}</strong>
            </span>
            <button
              type="button"
              onClick={runAtsEvaluation}
              disabled={isProcessingAts}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              {isProcessingAts ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Running ATS Parser...</span>
                </>
              ) : (
                <>
                  <span>Ingest & Run ATS Role Match</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ATS Role Matching & Competency Extraction */}
      {activeStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-serif font-bold text-2xl shadow-sm">
                {atsScore}%
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  ATS Match Score: High Priority Qualified
                </div>
                <h4 className="text-lg font-semibold text-slate-900">
                  {candidate.name} &bull; {candidate.role}
                </h4>
                <p className="text-xs text-slate-600">
                  Direct match against 4 required competencies. Cleared automated threshold.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Auto-Invite Triggered
              </span>
            </div>
          </div>

          {/* Extracted Rubric Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Matched Role Criteria
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">High-Throughput Distributed Architecture</span>
                  <span className="text-emerald-700 font-semibold">98% Match</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Database Caching (Redis / Kafka)</span>
                  <span className="text-emerald-700 font-semibold">95% Match</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Latency SLA & Concurrency Tuning</span>
                  <span className="text-emerald-700 font-semibold">92% Match</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Automated Scheduling Policy
              </h5>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>
                    Interview Window:{' '}
                    <strong className="text-slate-900 font-medium">Within 48 hours</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <span>
                    Recipient:{' '}
                    <strong className="text-slate-900 font-medium">{candidate.email}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                  <span>
                    AI Interviewers:{' '}
                    <strong className="text-slate-900 font-medium">Alex (Technical) & Jordan (Product)</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              &larr; Back to Candidate Intake
            </button>
            <button
              type="button"
              onClick={dispatchScheduleEmail}
              className="inline-flex items-center gap-2 rounded-full bg-forest-900 hover:bg-forest-800 text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all"
            >
              <Mail className="h-4 w-4 text-emerald-400" />
              <span>Generate & Dispatch Schedule Email</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Automated Candidate Invitation Email */}
      {activeStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">To:</span> {candidate.name} &lt;{candidate.email}&gt;
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STATUS: AUTOMATED DISPATCH
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Subject:</span> You&apos;re Invited: AI Voice Interview for {candidate.role} at Intra
            </div>

            {/* Email Body Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs text-sm text-slate-700 leading-relaxed font-sans">
              <p>Hi {candidate.name},</p>
              <p>
                Thank you for applying for the <strong>{candidate.role}</strong> position through {candidate.source}.
                Our team was impressed by your experience and your application has cleared our initial ATS screening.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-slate-700 space-y-1.5">
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  Your Interview Completion Window:
                </div>
                <p>
                  Please complete your 12-minute AI Voice Interview on your own time before{' '}
                  <strong className="text-slate-900 underline font-semibold">{deadlineStr}</strong>.
                </p>
              </div>
              <p>
                During this session, you will speak with two AI interviewers (Alex & Jordan) who will discuss your technical background and product trade-offs.
              </p>
              <div className="pt-2">
                <Link
                  href="/candidate/interview/INT-101"
                  className="inline-flex items-center gap-2 rounded-full bg-greenhouse-blue hover:bg-greenhouse-blue-hover text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Start Your AI Voice Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                Best regards,<br />
                The Talent Acquisition Team &bull; Powered by Intra
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              &larr; Back to ATS Match
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-all"
            >
              <span>View AI Interview Room & Recruiter Scorecard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Live Interview & Recruiter Scorecard Preview */}
      {activeStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Interview Preview Card (Screenshots 1.01.04 & 1.01.20) */}
            <div className="rounded-2xl border border-forest-800 bg-forest-900 p-6 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-forest-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-300">Live Voice Session</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">SESSION: INT-101</span>
              </div>

              {/* Dual waveform mock */}
              <div className="space-y-4 py-2">
                <div className="rounded-xl bg-forest-800/60 p-3.5 border border-forest-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Interviewer: Alex (Technical)</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/30">
                      • Speaking
                    </span>
                  </div>
                  {/* Sine waves visual */}
                  <div className="h-8 flex items-center justify-center gap-1">
                    {[30, 60, 90, 45, 80, 100, 70, 40, 85, 95, 60, 40, 75, 50].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full animate-pulse-wave"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-forest-800/60 p-3.5 border border-forest-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Candidate: {candidate.name}</span>
                    <span className="text-slate-400 text-[10px] font-medium">• Listening</span>
                  </div>
                  <div className="h-8 flex items-center justify-center gap-1">
                    {[20, 25, 20, 30, 20, 25, 20, 20, 25, 20, 25, 20].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-amber-400/60 rounded-full"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/candidate/interview/INT-101"
                className="block text-center rounded-xl bg-emerald-brand hover:bg-emerald-hover text-white py-2.5 text-xs font-semibold transition-colors"
              >
                Enter Full Candidate Room &rarr;
              </Link>
            </div>

            {/* Recruiter Evaluation Preview Card (Screenshots 1.01.50 & 1.02.12) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{candidate.name}</h4>
                  <p className="text-xs text-slate-500">{candidate.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                    Score: 4.0 | Excellent
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Integrity Check</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    No cheating detected
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800">AI Evaluation Summary:</div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Candidate demonstrated deep mastery of asynchronous event models, Redlock distributed locking patterns, and sub-5ms SLA tuning. Recommend advancing to final round.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/recruiter"
                  className="flex-1 text-center rounded-xl border border-slate-300 hover:border-forest-900 py-2.5 text-xs font-semibold text-slate-800 transition-colors"
                >
                  Open Recruiter Dashboard
                </Link>
                <Link
                  href="/recruiter/interviews/INT-101/report"
                  className="flex-1 text-center rounded-xl bg-forest-900 hover:bg-forest-800 text-white py-2.5 text-xs font-semibold transition-colors"
                >
                  View Full Scorecard &rarr;
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo Scenario</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
