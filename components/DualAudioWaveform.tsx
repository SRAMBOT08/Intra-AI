'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

interface DualAudioWaveformProps {
  interviewerName?: string;
  candidateName?: string;
  isAiSpeaking: boolean;
  isCandidateSpeaking: boolean;
  aiVolume?: number;
  candidateVolume?: number;
  liveCaption?: string;
}

export function DualAudioWaveform({
  interviewerName = 'Voice AI',
  candidateName = 'Alex Johnson',
  isAiSpeaking,
  isCandidateSpeaking,
  aiVolume = 40,
  candidateVolume = 20,
  liveCaption = '',
}: DualAudioWaveformProps) {
  const [phase, setPhase] = useState(0);

  // Smooth phase animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Generate SVG path for a sine wave with varying phase, frequency, and amplitude
  const generateSineWavePath = (
    width: number,
    height: number,
    amplitude: number,
    frequency: number,
    phaseOffset: number
  ) => {
    const points: string[] = [];
    const midY = height / 2;
    const step = 4;

    for (let x = 0; x <= width; x += step) {
      // Damping at edges
      const edgeFactor = Math.sin((x / width) * Math.PI);
      const y = midY + Math.sin(x * frequency + phase + phaseOffset) * amplitude * edgeFactor;
      points.push(`${x},${y.toFixed(2)}`);
    }

    return `M ${points.join(' L ')}`;
  };

  const aiAmp = isAiSpeaking ? Math.max(18, (aiVolume / 100) * 42) : 5;
  const candAmp = isCandidateSpeaking ? Math.max(16, (candidateVolume / 100) * 40) : 4;

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full min-h-[480px] rounded-3xl overflow-hidden shadow-xl border border-forest-800"
      style={{ backgroundColor: '#102a22' }}
    >
      {/* TOP HALF: INTERVIEWER WAVEFORM (Greenhouse 1.01.06 AM.png) */}
      <div className="relative flex-1 flex flex-col justify-between p-6 md:p-8 border-b border-forest-800/80">
        {/* Interviewer Header */}
        <div className="flex items-center justify-between z-10">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Interviewer
            </div>
            <h4 className="text-lg font-serif font-semibold text-white">
              {interviewerName}
            </h4>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight transition-colors ${
              isAiSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : 'bg-forest-800/60 text-slate-400 border border-forest-700/40'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isAiSpeaking ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isAiSpeaking ? 'Speaking' : 'Listening'}</span>
          </span>
        </div>

        {/* Emerald / Teal Multi-Sine Waveform */}
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden my-2">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 120"
            preserveAspectRatio="none"
          >
            {/* Wave 1: Primary Teal */}
            <path
              d={generateSineWavePath(600, 120, aiAmp, 0.022, 0)}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={isAiSpeaking ? '0.9' : '0.4'}
            />
            {/* Wave 2: Deep Emerald Accent */}
            <path
              d={generateSineWavePath(600, 120, aiAmp * 0.75, 0.03, 1.2)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={isAiSpeaking ? '0.7' : '0.3'}
            />
            {/* Wave 3: Soft Mint Highlight */}
            <path
              d={generateSineWavePath(600, 120, aiAmp * 0.5, 0.015, 2.4)}
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={isAiSpeaking ? '0.5' : '0.2'}
            />
          </svg>
        </div>

        <div className="h-4" />
      </div>

      {/* BOTTOM HALF: CANDIDATE WAVEFORM (Greenhouse 1.01.06 AM.png) */}
      <div className="relative flex-1 flex flex-col justify-between p-6 md:p-8">
        {/* Candidate Header */}
        <div className="flex items-center justify-between z-10">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Candidate
            </div>
            <h4 className="text-lg font-serif font-semibold text-white">
              {candidateName}
            </h4>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight transition-colors ${
              isCandidateSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : 'bg-forest-800/60 text-slate-400 border border-forest-700/40'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCandidateSpeaking ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isCandidateSpeaking ? 'Speaking' : 'Listening'}</span>
          </span>
        </div>

        {/* Amber / Orange Multi-Sine Waveform */}
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden my-2">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 120"
            preserveAspectRatio="none"
          >
            {/* Candidate Wave 1: Warm Amber */}
            <path
              d={generateSineWavePath(600, 120, candAmp, 0.024, 0.5)}
              fill="none"
              stroke="#fb923c"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={isCandidateSpeaking ? '0.9' : '0.4'}
            />
            {/* Candidate Wave 2: Gold Accent */}
            <path
              d={generateSineWavePath(600, 120, candAmp * 0.8, 0.035, 1.8)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={isCandidateSpeaking ? '0.7' : '0.3'}
            />
            {/* Candidate Wave 3: Soft Peach */}
            <path
              d={generateSineWavePath(600, 120, candAmp * 0.5, 0.018, 2.9)}
              fill="none"
              stroke="#fed7aa"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={isCandidateSpeaking ? '0.5' : '0.2'}
            />
          </svg>
        </div>

        {/* Bottom Bar: Candidate Profile Avatar Thumbnail */}
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
              {candidateName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <span className="text-xs text-slate-300">{candidateName}</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Agora RTC Active &bull; VAD Listening
          </div>
        </div>
      </div>

      {/* Live Caption Bar Overlay */}
      {liveCaption && (
        <div className="absolute bottom-4 inset-x-6 z-20 rounded-2xl bg-forest-950/90 backdrop-blur-md border border-forest-700/60 p-3 text-center text-xs text-slate-200 shadow-lg">
          <span className="text-emerald-400 font-semibold mr-1.5">Live Caption:</span>
          &ldquo;{liveCaption}&rdquo;
        </div>
      )}
    </div>
  );
}
