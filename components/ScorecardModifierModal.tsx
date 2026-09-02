'use client';

import React, { useState } from 'react';
import { X, Check, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

interface ScorecardModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
  candidateName: string;
  currentScore: number;
  candidateAnswerText?: string;
  initialReasoning?: string;
  onSave: (newScore: number, reason: string) => void;
}

export function ScorecardModifierModal({
  isOpen,
  onClose,
  questionTitle,
  candidateName,
  currentScore = 3.0,
  candidateAnswerText = "Yes. Um, I guess one example would be leading the team's communications around a new feature. We coordinated release notes and tracked user adoption through weekly telemetry.",
  initialReasoning = 'The candidate described a SaaS feature launch, their approach to positioning/messaging through proactive communications, tailored training, and surveys, and measured success primarily via usage/adoption. The answer lacked concrete metrics, cross-functional details, and impact, so it aligns with a solid but not comprehensive response.',
  onSave,
}: ScorecardModifierModalProps) {
  const [selectedScore, setSelectedScore] = useState<number>(Math.round(currentScore));
  const [justification, setJustification] = useState('');
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(true);

  if (!isOpen) return null;

  const scoreOptions = [
    {
      score: 4,
      label: 'Excellent',
      desc: 'Demonstrated complete mastery with quantifiable business impact and cross-functional leadership.',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    },
    {
      score: 3,
      label: 'Good',
      desc: 'Solid response meeting core competency requirements. Minor omissions in depth or metrics.',
      color: 'border-amber-400 bg-amber-50 text-amber-900',
    },
    {
      score: 2,
      label: 'Fair',
      desc: 'Partial answer. Required prompting, lacked depth or had conflicting explanations.',
      color: 'border-orange-400 bg-orange-50 text-orange-900',
    },
    {
      score: 1,
      label: 'Poor',
      desc: 'Failed to demonstrate competency. Inaccurate technical concepts or zero practical experience.',
      color: 'border-rose-400 bg-rose-50 text-rose-900',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedScore, justification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Modify Score</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Human calibration override for <strong className="text-slate-800">{candidateName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question Prompt */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Interview Question
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug">{questionTitle}</p>
          </div>

          {/* Rubric Score Options (4, 3, 2, 1 scale matching Greenhouse 1.02.12 AM.png) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Calibrated Score
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {scoreOptions.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setSelectedScore(opt.score)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    selectedScore === opt.score
                      ? `${opt.color} ring-2 ring-emerald-500/20 shadow-xs font-semibold`
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-current font-bold text-sm mb-1 shadow-xs">
                    {opt.score}
                  </span>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Response Accordion */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAnswerExpanded(!isAnswerExpanded)}
              className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>{candidateName}&apos;s Recorded Response & AI Evaluation</span>
              {isAnswerExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {isAnswerExpanded && (
              <div className="p-4 space-y-3 bg-white text-xs border-t border-slate-100">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">
                    Candidate Transcript Extract:
                  </span>
                  <p className="italic text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-mono">
                    &ldquo;{candidateAnswerText}&rdquo;
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">
                    Intra AI Initial Evaluation:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{initialReasoning}</p>
                </div>
              </div>
            )}
          </div>

          {/* Justification input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Calibration Rationale / Recruiter Note
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Discussed with hiring manager. The candidate provided detailed architecture documentation post-interview that verifies the missing metrics..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-greenhouse-blue hover:bg-greenhouse-blue-hover text-white px-6 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              Save Modified Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
