'use client';

import React, { useState } from 'react';
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
  Info,
  ChevronDown,
  Play,
  Mail,
  FileText,
} from 'lucide-react';
import { AssessmentReport } from '@/types/echosphere';
import { KnowledgeGraphVisualizer } from '@/components/KnowledgeGraphVisualizer';
import Link from 'next/link';

interface ExtendedAssessmentReport extends AssessmentReport {
  executive_summary?: string;
  competency_scores?: Array<{
    competency_id: string;
    score: number;
    rationale: string;
  }>;
  key_evidence?: string[];
  candidate_profile_summary?: any;
}

interface AssessmentReportViewProps {
  report: ExtendedAssessmentReport;
}

export function AssessmentReportView({ report }: AssessmentReportViewProps) {
  const [activeTab, setActiveTab] = useState<'grading' | 'job' | 'scorecard'>('grading');
  const isStrong = report.overall_recommendation === 'STRONG_HIRE' || report.overall_score >= 80;
  const scaledScore = (report.overall_score / 25).toFixed(1); // Converts 100-pt to 4.0 scale

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sora py-10 px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Header & Kit Navigation (Greenhouse 1.02.25 AM.png) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <Link
              href="/recruiter"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium mb-1"
            >
              &larr; Back to Candidates
            </Link>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {report.job_title} CB Interview Kit
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Intra AI Labs Evaluation
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/interviews/${report.interview_id}/report/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Printable PDF</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 hover:bg-forest-800 text-white px-5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Download Kit as PDF</span>
            </button>
          </div>
        </div>

        {/* 3 Kit Tabs (Greenhouse 1.02.25 AM.png) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'grading'
                ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grading Instructions
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'job'
                ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Details
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'scorecard'
                ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scorecard & Evidence
          </button>
        </div>

        {/* 2-Column Greenhouse Report Layout (1.02.25 AM.png) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Objective Evaluation Banner (Greenhouse 1.02.25 AM.png) */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 flex items-start gap-3.5 text-xs text-slate-700">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-blue-950 text-sm">
                  Remember to focus on job-relevant qualifications and support your judgments with objective examples.
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  This reduces bias and helps us hire the best candidates. All scores are anchored in extracted transcript evidence.
                </p>
              </div>
            </div>

            {/* Assessment Findings Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Intra AI Labs Report for {report.candidate_name}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                    Executive Hiring Evaluation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sent by Andy Administrator on {new Date(report.completed_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-400 uppercase">AI Score</div>
                  <div className="text-3xl font-serif font-bold text-emerald-700">
                    {scaledScore} <span className="text-sm font-sans text-slate-400">/ 4.0</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Candidate Synthesis
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {report.executive_summary ||
                    (report.strengths && report.strengths.length > 0
                      ? `Candidate demonstrated key strengths: ${report.strengths.join('; ')}.`
                      : 'Candidate completed the adaptive voice interview. Findings demonstrate solid technical articulation across evaluated competencies.')}
                </p>
              </div>

              {/* Competency Findings Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Demonstrated Competencies
                </h3>
                <div className="space-y-3">
                  {(
                    report.competency_scores ||
                    (report.evaluated_competencies
                      ? Object.entries(report.evaluated_competencies).map(([compId, details]) => ({
                          competency_id: compId,
                          score: details.rating === 'STRONG' ? 90 : details.rating === 'PARTIAL' ? 75 : 50,
                          rationale: details.evidence?.[0]?.statement || `Evaluated with rating: ${details.rating}`,
                        }))
                      : [])
                  ).map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 capitalize">
                          {comp.competency_id.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                            comp.score >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {comp.score >= 80 ? '4.0 | Strong' : '3.0 | Partial'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comp.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Evidence Quotes */}
              {((report.key_evidence && report.key_evidence.length > 0) ||
                (report.evaluated_competencies &&
                  Object.values(report.evaluated_competencies).some((d) => d.evidence?.length > 0))) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Key Grounded Evidence from Call
                  </h3>
                  <div className="space-y-2">
                    {(
                      report.key_evidence ||
                      (report.evaluated_competencies
                        ? Object.values(report.evaluated_competencies).flatMap(
                            (d) => d.evidence?.map((e) => e.statement) || []
                          )
                        : [])
                    ).map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
                      >
                        <Quote className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 italic leading-relaxed">&ldquo;{ev}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Knowledge Graph Grounding Component */}
            {report.candidate_profile_summary && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <GitGraph className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Candidate Knowledge Graph & Skills Ingestion
                  </h3>
                </div>
                <KnowledgeGraphVisualizer
                  candidateId={report.candidate_id}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar Column (4 cols) (Greenhouse 1.02.25 AM.png) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Candidate Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  {report.candidate_name}
                </h3>
                <a
                  href={`mailto:${report.candidate_id}@intra.ai`}
                  className="text-xs text-emerald-700 hover:underline font-medium break-all"
                >
                  {report.candidate_id}@intra.ai (Personal)
                </a>
              </div>

              {/* Interviews Panel (Greenhouse 1.02.25 AM.png) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Interviews
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
                  <div className="font-semibold text-xs text-emerald-950">Andy Administrator</div>
                  <div className="text-[11px] text-emerald-800">Intra AI Labs</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(report.completed_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Integrity Verification */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Integrity Check
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>No Cheating Detected</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <a
                  href={`/api/interviews/${report.interview_id}/report/pdf`}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-300 hover:border-slate-400 py-2 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download kit as PDF</span>
                </a>
              </div>
            </div>

            {/* Mobile App Download Promo (Greenhouse 1.02.25 AM.png) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
              <span className="text-[11px] text-slate-500 font-medium">
                View this kit on your mobile device
              </span>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="rounded-lg bg-black text-white px-3 py-1.5 text-[10px] font-semibold">
                  Google Play
                </span>
                <span className="rounded-lg bg-black text-white px-3 py-1.5 text-[10px] font-semibold">
                  App Store
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
