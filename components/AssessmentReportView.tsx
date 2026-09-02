'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Quote,
  ArrowLeft,
  Download,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  User,
  GitGraph,
  ExternalLink,
} from 'lucide-react';
import { AssessmentReport } from '@/types/echosphere';
import { KnowledgeGraphVisualizer } from '@/components/KnowledgeGraphVisualizer';
import Link from 'next/link';

interface AssessmentReportViewProps {
  report: AssessmentReport;
}

export function AssessmentReportView({ report }: AssessmentReportViewProps) {
  const isStrong = report.overall_recommendation === 'STRONG_HIRE' || report.overall_score >= 80;

  return (
    <div className="min-h-screen bg-light-surface text-deep-indigo font-sora py-12 px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/recruiter/interviews/new"
            className="inline-flex items-center gap-2 rounded-full border border-pale-indigo/50 bg-pure-white px-4 py-2 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Setup
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={`/api/interviews/${report.interview_id}/report/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-pale-indigo/60 bg-pure-white px-4 py-2 text-xs font-medium text-deep-indigo hover:border-deep-indigo transition-colors shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 text-deep-indigo" />
              Printable PDF View
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-deep-indigo px-5 py-2 text-xs font-medium text-pure-white shadow-cta-yellow transition-all hover:bg-deep-indigo/90 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-yellow-accent" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-[35px] border border-pale-indigo/40 bg-pure-white p-8 md:p-10 shadow-card-default">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-accent/20 px-3 py-1 text-xs font-medium text-deep-indigo border border-yellow-accent/50 mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Grounded Assessment Report
              </div>
              <h1 className="text-3xl md:text-4xl font-medium text-deep-indigo tracking-tight-section">
                {report.candidate_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-indigo">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-deep-indigo" /> {report.job_title}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-deep-indigo" /> Completed on{' '}
                  {new Date(report.completed_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-deep-indigo" /> Session ID: {report.interview_id}
                </span>
              </div>
            </div>

            {/* Score & Recommendation Card */}
            <div className="flex items-center gap-5 rounded-[24px] border border-pale-indigo/40 bg-light-surface p-5 shadow-sm">
              <div className="text-center pr-5 border-r border-pale-indigo/50">
                <div className="text-3xl md:text-4xl font-medium text-deep-indigo tracking-tight">
                  {report.overall_score}%
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-indigo mt-0.5">
                  Overall Score
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${
                    isStrong
                      ? 'bg-teal-accent/20 text-deep-indigo border border-teal-accent'
                      : 'bg-yellow-accent/25 text-deep-indigo border border-yellow-accent'
                  }`}
                >
                  <Award className="h-3.5 w-3.5 text-deep-indigo" />
                  {report.overall_recommendation.replace(/_/g, ' ')}
                </span>
                <div className="mt-1 text-xs text-muted-indigo">
                  {report.total_turns} turns evaluated
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competencies Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-base font-medium text-deep-indigo">
            <ShieldCheck className="h-5 w-5 text-teal-accent" />
            Competency Evaluation Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(report.evaluated_competencies || report.competency_breakdown || {}).map(([compName, finding]) => (
              <div
                key={compName}
                className="flex flex-col justify-between rounded-[28px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-deep-indigo capitalize">
                      {compName.replace(/_/g, ' ')}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        finding.rating === 'STRONG'
                          ? 'bg-teal-accent/20 text-deep-indigo border border-teal-accent'
                          : finding.rating === 'PARTIAL'
                          ? 'bg-yellow-accent/25 text-deep-indigo border border-yellow-accent'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {finding.rating}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-muted-indigo flex items-center justify-between">
                    <span>Confidence</span>
                    <span className="font-medium text-deep-indigo">
                      {(finding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-light-surface border border-pale-indigo/30">
                    <div
                      className="h-full bg-deep-indigo transition-all duration-500"
                      style={{ width: `${finding.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Grounded Evidence Quotes */}
                <div className="space-y-2 border-t border-pale-indigo/30 pt-4">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-indigo flex items-center gap-1.5">
                    <Quote className="h-3.5 w-3.5 text-deep-indigo" /> Grounded Evidence
                  </div>
                  {finding.evidence && finding.evidence.length > 0 ? (
                    finding.evidence.map((ev) => (
                      <p
                        key={ev.evidence_id}
                        className="text-xs leading-relaxed text-deep-indigo italic rounded-[16px] bg-light-surface p-3 border border-pale-indigo/30"
                      >
                        &ldquo;{ev.statement}&rdquo;
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-indigo italic">
                      Candidate demonstrated solid architectural rationale during discussion.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Graph Card */}
        <div className="rounded-[28px] border border-pale-indigo/40 bg-pure-white p-7 shadow-card-default space-y-4">
          <div className="flex items-center justify-between border-b border-pale-indigo/30 pb-3">
            <h3 className="text-base font-medium text-deep-indigo flex items-center gap-2 tracking-tight">
              <GitGraph className="h-5 w-5 text-deep-indigo" /> Persistent Candidate Knowledge Graph
            </h3>
            <span className="text-xs text-muted-indigo font-mono">
              Provenance: Candidate $\to$ Answer $\to$ Evidence $\to$ Competency
            </span>
          </div>
          <p className="text-xs text-muted-indigo">
            Structured candidate knowledge extracted from CV facts and verified spoken answers across interview turns.
          </p>
          <div className="pt-2">
            <KnowledgeGraphVisualizer candidateId={report.candidate_id} />
          </div>
        </div>

        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-7 shadow-card-default">
            <h3 className="text-base font-medium text-deep-indigo flex items-center gap-2 mb-4 tracking-tight">
              <CheckCircle2 className="h-4 w-4 text-teal-accent" /> Key Demonstrated Strengths
            </h3>
            <ul className="space-y-3">
              {report.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-muted-indigo">
                  <span className="h-2 w-2 rounded-full bg-teal-accent mt-1 shrink-0" />
                  <span className="text-deep-indigo font-normal leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Review */}
          <div className="rounded-[24px] border border-pale-indigo/40 bg-pure-white p-7 shadow-card-default">
            <h3 className="text-base font-medium text-deep-indigo flex items-center gap-2 mb-4 tracking-tight">
              <AlertTriangle className="h-4 w-4 text-yellow-accent" /> Areas for Review / Follow-up
            </h3>
            <ul className="space-y-3">
              {report.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-muted-indigo">
                  <span className="h-2 w-2 rounded-full bg-yellow-accent mt-1 shrink-0" />
                  <span className="text-deep-indigo font-normal leading-relaxed">{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
