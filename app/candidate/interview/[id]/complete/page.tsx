'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Mail, Calendar, Sparkles } from 'lucide-react';

export default function CandidateCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f5f4] text-slate-800 font-sora px-6 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Interview Successfully Received
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight pt-1">
            Thank you for completing your interview!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Your conversational responses have been securely logged and analyzed against the role rubric.
          </p>
        </div>

        {/* Timeline of What Happens Next */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-left space-y-4 text-xs">
          <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>What happens next:</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-800">Recruiter & Hiring Panel Review:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  The talent team reviews your audio evidence and rubric scores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-800">Direct Decision within 2 Business Days:</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  You will receive an update regarding final-round onsite scheduling.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Interview Confirmation Token:</span>
          <span className="font-mono font-semibold text-slate-700">{id}</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/recruiter"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 hover:bg-forest-800 py-3 px-8 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <span>Go to Recruiter Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto rounded-full border border-slate-300 bg-white py-3 px-6 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close Window
          </Link>
        </div>
      </div>
    </div>
  );
}
