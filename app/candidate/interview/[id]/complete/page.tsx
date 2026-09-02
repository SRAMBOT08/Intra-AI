'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CandidateCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Interview Completed!
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Thank you for walking through your engineering and product background with Alex and Jordan.
            All required competencies have been evaluated.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
          Session ID: <span className="font-mono text-cyan-400 font-bold">{id}</span>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href={`/recruiter/interviews/${id}/report`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 transition-all"
          >
            View Candidate Assessment Report <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
