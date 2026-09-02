'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Cpu,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { ActivePersonaBadge } from './ActivePersonaBadge';
import { ObservabilityDrawer } from './ObservabilityDrawer';
import { MicrophoneSelector } from './MicrophoneSelector';
import { AnswerAnalysis, NextAction } from '@/types/echosphere';

interface VoiceInterviewRoomProps {
  interviewId: string;
  candidateName?: string;
  jobTitle?: string;
  initialAgentId?: 'technical' | 'product';
  onInterviewComplete?: () => void;
}

interface TranscriptTurn {
  id: string;
  speaker: 'interviewer' | 'candidate';
  personaName?: string;
  text: string;
  timestamp: string;
}

export function VoiceInterviewRoom({
  interviewId,
  candidateName = 'Alex Johnson',
  jobTitle = 'Senior Distributed Systems Engineer',
  initialAgentId = 'technical',
  onInterviewComplete,
}: VoiceInterviewRoomProps) {
  const [activePersona, setActivePersona] = useState<string>(initialAgentId);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<
    'CONNECTING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'HANDOFF' | 'COMPLETED'
  >('CONNECTING');

  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState<AnswerAnalysis | null>(null);
  const [latestAction, setLatestAction] = useState<NextAction | null>(null);
  const [coverageCount, setCoverageCount] = useState(1);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(25);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Simulate audio waveform animation when speaking or listening
  useEffect(() => {
    if (callStatus === 'SPEAKING' || callStatus === 'LISTENING') {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 55) + 25);
      }, 120);
    } else {
      setAudioLevel(15);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [callStatus]);

  // Initial connection & Alex's greeting
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      if (!mounted) return;
      setCallStatus('THINKING');

      try {
        // Fetch opening turn from Custom LLM endpoint
        const res = await fetch(`/api/custom-llm?interview_id=${interviewId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });
        const data = await res.json();
        const initialGreeting =
          data?.choices?.[0]?.message?.content ||
          `Hello! I'm Alex, your technical interviewer today. To begin, could you walk me through how you design your database and caching tier for high-throughput reads?`;

        setTranscripts([
          {
            id: 'turn-0',
            speaker: 'interviewer',
            personaName: 'Alex',
            text: initialGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setCallStatus('LISTENING');
      } catch (err) {
        console.error('Error starting conversation:', err);
        setCallStatus('LISTENING');
      }
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [interviewId]);

  // Handle Candidate Submitting Answer (Voice / Transcript Turn)
  const submitCandidateAnswer = async (answerText: string) => {
    if (!answerText.trim() || callStatus === 'THINKING' || callStatus === 'COMPLETED') return;

    const candidateTurn: TranscriptTurn = {
      id: `cand-${Date.now()}`,
      speaker: 'candidate',
      text: answerText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscripts((prev) => [...prev, candidateTurn]);
    setCandidateInput('');
    setCallStatus('THINKING');

    try {
      // Send turn to Custom LLM Adapter (which invokes M1 :4005 and :4004)
      const res = await fetch(`/api/custom-llm?interview_id=${interviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: answerText.trim() }],
        }),
      });

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || 'Thank you. Could you elaborate on that?';
      const meta = data?.echosphere_meta;

      if (meta?.latest_action) {
        setLatestAction(meta.latest_action);
        if (meta.latest_action.action === 'SWITCH_AGENT') {
          setCallStatus('HANDOFF');
          setTimeout(() => {
            setActivePersona('product');
            setCoverageCount(2);
          }, 800);
        } else if (meta.latest_action.action === 'COMPLETE') {
          setCoverageCount(3);
        }
      }

      // Record interviewer turn
      const personaName = activePersona === 'product' || meta?.latest_action?.target_agent_id === 'product' ? 'Jordan' : 'Alex';
      const interviewerTurn: TranscriptTurn = {
        id: `interv-${Date.now()}`,
        speaker: 'interviewer',
        personaName,
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, interviewerTurn]);

      if (meta?.is_complete || meta?.latest_action?.action === 'COMPLETE') {
        setCallStatus('COMPLETED');
        if (onInterviewComplete) onInterviewComplete();
      } else {
        setCallStatus('SPEAKING');
        setTimeout(() => setCallStatus('LISTENING'), 3500);
      }
    } catch (err) {
      console.error('Turn processing failed:', err);
      setCallStatus('LISTENING');
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-100">
      {/* Top Banner: Interview Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">{jobTitle}</h2>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
              Live Voice Call
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Candidate: {candidateName} • ID: {interviewId}</p>
        </div>

        <div className="flex items-center gap-3">
          <MicrophoneSelector
            selectedDeviceId={selectedMicrophone}
            onDeviceSelect={setSelectedMicrophone}
          />

          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`rounded-xl border p-2 text-slate-300 transition-colors ${
              isSpeakerMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left 7 Columns: Active Persona Orb & Visualizer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Active Interviewer Card */}
          <ActivePersonaBadge
            personaId={activePersona}
            isSpeaking={callStatus === 'SPEAKING' || callStatus === 'HANDOFF'}
            isListening={callStatus === 'LISTENING'}
          />

          {/* Central Audio Visualizer Orb */}
          <div className="relative flex flex-1 items-center justify-center rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 p-8 shadow-inner">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing rings */}
              <div
                className={`absolute rounded-full transition-all duration-300 ${
                  activePersona === 'technical'
                    ? 'bg-cyan-500/10 border border-cyan-500/20'
                    : 'bg-amber-500/10 border border-amber-500/20'
                }`}
                style={{
                  width: `${audioLevel * 4.2}px`,
                  height: `${audioLevel * 4.2}px`,
                }}
              />
              <div
                className={`absolute rounded-full transition-all duration-200 ${
                  activePersona === 'technical'
                    ? 'bg-blue-500/15 border border-blue-500/30'
                    : 'bg-rose-500/15 border border-rose-500/30'
                }`}
                style={{
                  width: `${audioLevel * 3.2}px`,
                  height: `${audioLevel * 3.2}px`,
                }}
              />

              {/* Core Pulsing Orb */}
              <div
                className={`relative z-10 flex items-center justify-center rounded-full shadow-2xl transition-all duration-200 ${
                  activePersona === 'technical'
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/40'
                    : 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/40'
                }`}
                style={{
                  width: `${Math.max(120, audioLevel * 2.2)}px`,
                  height: `${Math.max(120, audioLevel * 2.2)}px`,
                }}
              >
                <div className="flex flex-col items-center justify-center text-white">
                  {callStatus === 'THINKING' ? (
                    <Sparkles className="h-8 w-8 animate-spin" />
                  ) : callStatus === 'SPEAKING' ? (
                    <Volume2 className="h-8 w-8 animate-bounce" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                  <span className="mt-1 text-[11px] font-bold tracking-wider uppercase">
                    {callStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle status banner */}
            <div className="absolute bottom-6 text-center">
              <p className="text-xs text-slate-400 font-medium">
                {callStatus === 'LISTENING' && 'Agora voice channel active • Speak your answer naturally'}
                {callStatus === 'THINKING' && 'EchoSphere Intelligence evaluating answer & deciding next action...'}
                {callStatus === 'SPEAKING' && `${activePersona === 'product' ? 'Jordan' : 'Alex'} is speaking`}
                {callStatus === 'HANDOFF' && 'Dynamic Persona Handoff in progress...'}
                {callStatus === 'COMPLETED' && 'Interview concluded. Generating evidence report.'}
              </p>
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>

              <span className="text-xs text-slate-500">• Single continuous Agora RTC audio session</span>
            </div>

            <button
              onClick={() => {
                setCallStatus('COMPLETED');
                if (onInterviewComplete) onInterviewComplete();
              }}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all"
            >
              <PhoneOff className="h-4 w-4" />
              End Interview
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Realtime Transcript & Interaction */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live Conversation Transcript</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {transcripts.length} turns
            </span>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 max-h-[55vh]">
            {transcripts.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col ${
                  t.speaker === 'candidate' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 px-1">
                  <span className="font-semibold text-slate-300">
                    {t.speaker === 'candidate' ? candidateName : t.personaName || 'Interviewer'}
                  </span>
                  <span>{t.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[90%] shadow-md ${
                    t.speaker === 'candidate'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : t.personaName === 'Jordan'
                      ? 'bg-amber-950/50 border border-amber-800/50 text-amber-100 rounded-tl-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {t.text}
                </div>
              </div>
            ))}
            <div ref={transcriptsEndRef} />
          </div>

          {/* Candidate Voice/Text Input Bar (For voice or keyboard testing) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCandidateAnswer(candidateInput);
            }}
            className="mt-3 flex gap-2 border-t border-slate-800/80 pt-3"
          >
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder="Speak or type candidate answer (e.g. 'We added Redis caching...')"
              disabled={callStatus === 'THINKING' || callStatus === 'COMPLETED'}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!candidateInput.trim() || callStatus === 'THINKING'}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-cyan-600/20"
            >
              Send Turn
            </button>
          </form>
        </div>
      </div>

      {/* Floating Observability Inspector for Hackathon Demo */}
      <ObservabilityDrawer
        currentAgentId={activePersona}
        currentCompetency={activePersona === 'product' ? 'customer_impact' : 'scalability'}
        latestAnalysis={latestAnalysis}
        latestAction={latestAction}
        coverageCount={coverageCount}
        totalRequired={3}
      />
    </div>
  );
}
