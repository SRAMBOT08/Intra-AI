'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Cpu, Users } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';

interface ActivePersonaBadgeProps {
  personaId?: string;
  agentId?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  currentCompetency?: string;
}

export function ActivePersonaBadge({
  personaId,
  agentId,
  isSpeaking = false,
  isListening = false,
  currentCompetency,
}: ActivePersonaBadgeProps) {
  const rawId = (personaId || agentId || 'technical').toString().toLowerCase();
  const persona = PERSONAS[rawId] || PERSONAS.technical;
  const isTechnical = persona.agent_id === 'technical';

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default transition-all duration-300">
      <div className="flex items-center gap-5">
        {/* Avatar Orb with Teal / Yellow Accent ring */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-[20px] transition-all duration-300 ${
            isTechnical
              ? 'bg-deep-indigo text-pure-white ring-2 ring-teal-accent'
              : 'bg-deep-indigo text-pure-white ring-2 ring-yellow-accent'
          } ${isSpeaking ? 'scale-105 shadow-card-elevated' : ''}`}
        >
          {isTechnical ? (
            <Cpu className="h-8 w-8 text-teal-accent" />
          ) : (
            <Users className="h-8 w-8 text-yellow-accent" />
          )}

          {/* Pulse ring when active */}
          {(isSpeaking || isListening) && (
            <span
              className={`absolute -inset-1 rounded-[22px] opacity-40 animate-ping pointer-events-none ${
                isTechnical ? 'bg-teal-accent' : 'bg-yellow-accent'
              }`}
            />
          )}
        </div>

        {/* Persona Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-medium tracking-tight-card text-deep-indigo">
              {persona.display_name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium tracking-tight ${
                isTechnical
                  ? 'bg-light-surface text-deep-indigo border border-pale-indigo/50'
                  : 'bg-yellow-accent/20 text-deep-indigo border border-yellow-accent/60'
              }`}
            >
              <Sparkles className="h-3 w-3 text-deep-indigo" />
              {persona.role}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-indigo truncate font-normal">
            {persona.description}
          </p>

          {/* Focal Competencies */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {persona.focal_competencies.map((comp) => {
              const isFocalCurrent = currentCompetency === comp;
              return (
                <span
                  key={comp}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isFocalCurrent
                      ? 'bg-yellow-accent/30 text-deep-indigo border border-yellow-accent'
                      : 'bg-light-surface text-deep-indigo border border-pale-indigo/40'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-accent" />
                  {comp.replace(/_/g, ' ')}
                </span>
              );
            })}
          </div>
        </div>

        {/* Live Audio State Pill */}
        <div className="flex flex-col items-end">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              isSpeaking
                ? 'bg-deep-indigo text-pure-white shadow-card-default ring-2 ring-yellow-accent'
                : isListening
                ? 'bg-light-surface text-deep-indigo border border-teal-accent ring-1 ring-teal-accent'
                : 'bg-light-surface text-muted-indigo border border-pale-indigo/40'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSpeaking
                  ? 'bg-yellow-accent'
                  : isListening
                  ? 'bg-teal-accent animate-pulse'
                  : 'bg-pale-indigo'
              }`}
            />
            {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
