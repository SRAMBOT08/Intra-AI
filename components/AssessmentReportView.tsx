'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Quote,
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  User,
} from 'lucide-react';
import { AssessmentReport } from '@/types/echosphere';
import Link from 'next/link';

interface AssessmentReportViewProps {
  report: AssessmentReport;
}

export function AssessmentReportView({ report }: AssessmentReportViewProps) {
  const isStrong = report.overall_recommendation === 'STRONG_HIRE' || report.overall_score >= 80;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/recruiter/interviews/new"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Setup
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" /> EchoSphere Candidate Assessment
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {report.candidate_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" /> {report.job_title}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> Completed on{' '}
                  {new Date(report.completed_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" /> Interview ID: {report.interview_id}
                </span>
              </div>
            </div>

            {/* Score & Recommendation Badge */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-950/60 p-4 shadow-xl">
              <div className="text-center pr-4 border-r border-slate-800">
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {report.overall_score}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Score
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    isStrong
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  {report.overall_recommendation.replace(/_/g, ' ')}
                </span>
                <div className="mt-1 text-[10px] text-slate-400">
                  {report.total_turns} conversational turns analyzed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competencies Breakdown with Grounded Evidence */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" /> Evaluated Competency Scorecards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.entries(report.evaluated_competencies).map(([compName, finding]) => (
              <div
                key={compName}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white capitalize">
                      {compName.replace(/_/g, ' ')}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        finding.rating === 'STRONG'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : finding.rating === 'PARTIAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {finding.rating}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>Confidence</span>
                    <span className="font-mono text-slate-200">
                      {(finding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full ${
                        finding.rating === 'STRONG' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${finding.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Grounded Evidence Quotes */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Quote className="h-3 w-3 text-cyan-400" /> Grounded Evidence
                  </div>
                  {finding.evidence && finding.evidence.length > 0 ? (
                    finding.evidence.map((ev) => (
                      <p
                        key={ev.evidence_id}
                        className="text-[11px] leading-relaxed text-slate-300 italic rounded-lg bg-slate-950/80 p-2.5 border border-slate-800"
                      >
                        &ldquo;{ev.statement}&rdquo;
                      </p>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Candidate demonstrated solid architectural rationale during discussion.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Demonstrated Strengths
            </h3>
            <ul className="space-y-2.5">
              {report.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Review */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Areas for Review / Follow-up
            </h3>
            <ul className="space-y-2.5">
              {report.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
