'use client';

import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Cpu, Gauge, GitCommit, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { AnswerAnalysis, NextAction } from '@/types/echosphere';

interface ObservabilityDrawerProps {
  currentAgentId: string;
  currentCompetency?: string;
  latestAnalysis?: AnswerAnalysis | null;
  latestAction?: NextAction | null;
  coverageCount?: number;
  totalRequired?: number;
}

export function ObservabilityDrawer({
  currentAgentId,
  currentCompetency = 'system_design',
  latestAnalysis,
  latestAction,
  coverageCount = 1,
  totalRequired = 3,
}: ObservabilityDrawerProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-300">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live AI Orchestration Inspector
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
            M1 + M2 Live
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3.5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto">
          {/* Active persona & competency */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-cyan-400" /> Active Persona
              </div>
              <div className="mt-1 font-semibold text-white capitalize">
                {currentAgentId === 'product' ? 'Jordan (Product)' : 'Alex (Technical)'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Gauge className="h-3 w-3 text-amber-400" /> Focal Competency
              </div>
              <div className="mt-1 font-semibold text-white capitalize truncate">
                {currentCompetency.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Competency coverage progress */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>COMPETENCY COVERAGE</span>
              <span className="text-cyan-400">
                {coverageCount} / {totalRequired} Completed
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (coverageCount / totalRequired) * 100)}%` }}
              />
            </div>
          </div>

          {/* Latest Answer Analysis from :4005 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <Terminal className="h-3 w-3 text-emerald-400" /> M1 Intelligence (:4005)
              </span>
              {latestAnalysis && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    latestAnalysis.overall_performance === 'STRONG'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : latestAnalysis.overall_performance === 'PARTIAL'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {latestAnalysis.overall_performance}
                </span>
              )}
            </div>

            {latestAnalysis ? (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Confidence:</span>
                  <span className="font-mono text-white">
                    {(latestAnalysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Evidence Extracted:</span>
                  <span className="text-white">
                    {latestAnalysis.evidence?.length || 0} facts
                  </span>
                </div>
                {latestAnalysis.vague && (
                  <div className="rounded bg-amber-500/10 p-1.5 text-[10px] text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Answer lacks specific metrics or trade-offs.
                  </div>
                )}
                {latestAnalysis.evidence?.[0] && (
                  <div className="mt-1 rounded bg-slate-950 p-2 text-[10px] text-slate-300 italic border border-slate-800">
                    &ldquo;{latestAnalysis.evidence[0].statement}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">Waiting for candidate utterance...</div>
            )}
          </div>

          {/* Latest NextAction from :4004 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-300">
                <GitCommit className="h-3 w-3 text-purple-400" /> LangGraph Decision (:4004)
              </span>
              {latestAction && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {latestAction.action}
                </span>
              )}
            </div>

            {latestAction ? (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Target Persona:</span>
                  <span className="font-semibold text-white capitalize">
                    {latestAction.target_agent_id || currentAgentId}
                  </span>
                </div>
                {latestAction.difficulty && (
                  <div className="flex justify-between text-slate-400">
                    <span>Difficulty:</span>
                    <span className="text-amber-300 font-semibold">{latestAction.difficulty}</span>
                  </div>
                )}
                <div className="text-slate-400 text-[10px] mt-1">
                  <span className="font-semibold text-slate-300">Reasoning: </span>
                  {latestAction.reason}
                </div>
                {latestAction.handoff_transition_text && (
                  <div className="rounded bg-purple-950/40 p-2 text-[10px] text-purple-200 border border-purple-800/40">
                    <span className="font-bold flex items-center gap-1 mb-1 text-purple-300">
                      <Sparkles className="h-3 w-3" /> Spoken Handoff Transition:
                    </span>
                    &ldquo;{latestAction.handoff_transition_text}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">Initializing decision loop...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
