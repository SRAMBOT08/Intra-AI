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
    <div className="flex min-h-screen items-center justify-center bg-light-surface text-deep-indigo font-sora px-6 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-[35px] border border-pale-indigo/40 bg-pure-white p-10 shadow-card-default text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-teal-accent/20 text-deep-indigo border border-teal-accent/40 shadow-sm">
          <CheckCircle2 className="h-8 w-8 text-deep-indigo" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-medium text-deep-indigo tracking-tight">
            Interview Completed!
          </h1>
          <p className="text-xs text-muted-indigo font-normal leading-relaxed">
            Thank you for walking through your engineering and product background with Alex and Jordan.
            All required competencies have been evaluated.
          </p>
        </div>

        <div className="rounded-[20px] border border-pale-indigo/40 bg-light-surface p-4 text-xs text-muted-indigo">
          Session ID: <span className="font-medium text-deep-indigo">{id}</span>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href={`/recruiter/interviews/${id}/report`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 py-3.5 text-xs font-medium text-pure-white shadow-cta-yellow transition-all"
          >
            <span>View Candidate Assessment Report</span>
            <ArrowRight className="h-4 w-4 text-yellow-accent" />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-pale-indigo/60 bg-pure-white py-3 text-xs font-medium text-deep-indigo hover:border-deep-indigo shadow-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
