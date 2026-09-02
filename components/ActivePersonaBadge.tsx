'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Cpu, Users } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';

interface ActivePersonaBadgeProps {
  personaId: string;
  isSpeaking?: boolean;
  isListening?: boolean;
}

export function ActivePersonaBadge({
  personaId,
  isSpeaking = false,
  isListening = false,
}: ActivePersonaBadgeProps) {
  const persona = PERSONAS[personaId.toLowerCase()] || PERSONAS.technical;
  const isTechnical = persona.agent_id === 'technical';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500">
      <div className="flex items-center gap-4">
        {/* Avatar Orb */}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${
            isTechnical
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/20 shadow-lg'
              : 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/20 shadow-lg'
          } ${isSpeaking ? 'ring-4 ring-white/30 scale-105' : ''}`}
        >
          {isTechnical ? (
            <Cpu className="h-8 w-8 text-white" />
          ) : (
            <Users className="h-8 w-8 text-white" />
          )}

          {/* Pulse ring when active */}
          {(isSpeaking || isListening) && (
            <span
              className={`absolute -inset-1 rounded-2xl animate-ping opacity-25 ${
                isTechnical ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
          )}
        </div>

        {/* Persona Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white">
              {persona.display_name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isTechnical
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              {persona.role}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400 truncate">
            {persona.description}
          </p>

          {/* Focal Competencies */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {persona.focal_competencies.map((comp) => (
              <span
                key={comp}
                className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/50"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {comp.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Live Audio State Pill */}
        <div className="flex flex-col items-end">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : isListening
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSpeaking
                  ? 'bg-emerald-400'
                  : isListening
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
