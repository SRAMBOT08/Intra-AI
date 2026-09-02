'use client';

import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Cpu, Gauge, GitCommit, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { AnswerAnalysis, NextAction } from '@/types/echosphere';
import { KnowledgeGraphVisualizer } from '@/components/KnowledgeGraphVisualizer';

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
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-pale-indigo/50 bg-pure-white shadow-overlay-lift transition-all duration-300">
      {/* Header bar: Deep Indigo with yellow accent tag */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between bg-deep-indigo px-5 py-3.5 text-pure-white transition-colors hover:bg-deep-indigo/95"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-teal-accent animate-pulse" />
          <span className="text-xs font-medium tracking-tight uppercase">
            Live AI Orchestration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-yellow-accent px-2.5 py-0.5 text-[11px] font-medium text-deep-indigo">
            M1 + M2
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-pale-indigo" />
          ) : (
            <ChevronUp className="h-4 w-4 text-pale-indigo" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto bg-light-surface/40">
          {/* Active persona & competency */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] border border-pale-indigo/40 bg-pure-white p-3 shadow-sm">
              <div className="text-[11px] uppercase font-medium text-muted-indigo flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-deep-indigo" /> Active Persona
              </div>
              <div className="mt-1 font-medium text-deep-indigo text-sm capitalize">
                {currentAgentId === 'product' ? 'Jordan (Product)' : 'Alex (Technical)'}
              </div>
            </div>

            <div className="rounded-[16px] border border-pale-indigo/40 bg-pure-white p-3 shadow-sm">
              <div className="text-[11px] uppercase font-medium text-muted-indigo flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-deep-indigo" /> Focal Competency
              </div>
              <div className="mt-1 font-medium text-deep-indigo text-sm capitalize truncate">
                {currentCompetency.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Competency coverage progress */}
          <div className="rounded-[16px] border border-pale-indigo/40 bg-pure-white p-3.5 shadow-sm">
            <div className="flex justify-between items-center text-[11px] font-medium text-muted-indigo">
              <span>COMPETENCY COVERAGE</span>
              <span className="text-deep-indigo font-semibold">
                {coverageCount} / {totalRequired} Completed
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-light-surface border border-pale-indigo/30">
              <div
                className="h-full bg-deep-indigo transition-all duration-500"
                style={{ width: `${Math.min(100, (coverageCount / totalRequired) * 100)}%` }}
              />
            </div>
          </div>

          {/* Latest Answer Analysis from :4005 */}
          <div className="rounded-[16px] border border-pale-indigo/40 bg-pure-white p-3.5 shadow-sm space-y-2.5">
            <div className="text-[11px] uppercase font-medium text-muted-indigo flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-deep-indigo font-medium">
                <Terminal className="h-3.5 w-3.5 text-teal-accent" /> M1 Intelligence (:4005)
              </span>
              {latestAnalysis && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                    latestAnalysis.overall_performance === 'STRONG'
                      ? 'bg-teal-accent/20 text-deep-indigo border border-teal-accent'
                      : latestAnalysis.overall_performance === 'PARTIAL'
                      ? 'bg-yellow-accent/20 text-deep-indigo border border-yellow-accent'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {latestAnalysis.overall_performance}
                </span>
              )}
            </div>

            {latestAnalysis ? (
              <div className="space-y-1.5 text-xs text-muted-indigo">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-medium text-deep-indigo">
                    {(latestAnalysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Evidence Extracted:</span>
                  <span className="font-medium text-deep-indigo">
                    {latestAnalysis.evidence?.length || 0} facts
                  </span>
                </div>
                {latestAnalysis.vague && (
                  <div className="rounded-[12px] bg-yellow-accent/15 p-2 text-[11px] text-deep-indigo border border-yellow-accent/40 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-deep-indigo" /> Answer lacks specific metrics or trade-offs.
                  </div>
                )}
                {latestAnalysis.evidence?.[0] && (
                  <div className="mt-1 rounded-[12px] bg-light-surface p-2.5 text-[11px] text-deep-indigo italic border border-pale-indigo/30">
                    &ldquo;{latestAnalysis.evidence[0].statement}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-indigo italic">Waiting for candidate utterance...</div>
            )}
          </div>

          {/* Latest NextAction from :4004 */}
          <div className="rounded-[16px] border border-pale-indigo/40 bg-pure-white p-3.5 shadow-sm space-y-2.5">
            <div className="text-[11px] uppercase font-medium text-muted-indigo flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-deep-indigo font-medium">
                <GitCommit className="h-3.5 w-3.5 text-deep-indigo" /> Meta-Orchestrator (:4004)
              </span>
              {latestAction && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-deep-indigo text-pure-white">
                  {latestAction.action}
                </span>
              )}
            </div>

            {latestAction ? (
              <div className="space-y-1.5 text-xs text-muted-indigo">
                <div className="flex justify-between">
                  <span>Target Persona:</span>
                  <span className="font-medium text-deep-indigo capitalize">
                    {latestAction.target_agent_id || currentAgentId}
                  </span>
                </div>
                {latestAction.difficulty && (
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="font-medium text-deep-indigo">{latestAction.difficulty}</span>
                  </div>
                )}
                <div className="text-[11px] mt-1 text-muted-indigo">
                  <span className="font-medium text-deep-indigo">Reasoning: </span>
                  {latestAction.reason}
                </div>
                {latestAction.handoff_transition_text && (
                  <div className="rounded-[12px] bg-light-surface p-2.5 text-[11px] text-deep-indigo border border-pale-indigo/40">
                    <span className="font-medium flex items-center gap-1.5 mb-1 text-deep-indigo">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-accent" /> Spoken Handoff Transition:
                    </span>
                    &ldquo;{latestAction.handoff_transition_text}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-indigo italic">Initializing decision loop...</div>
            )}
          </div>

          {/* Persistent Candidate Knowledge Graph (Neo4j V1) */}
          <KnowledgeGraphVisualizer />
        </div>
      )}
    </div>
  );
}
