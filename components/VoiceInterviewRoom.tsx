'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Send,
  Play,
  CheckCircle2,
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

const CANONICAL_PRESETS = [
  {
    turn: 1,
    persona: 'Alex',
    competency: 'system_design',
    label: 'Turn 1: Redis + Postgres (System Design)',
    text: 'We added Redis in front of PostgreSQL and implemented write-through caching to keep latencies under 5ms.',
  },
  {
    turn: 2,
    persona: 'Alex',
    competency: 'scalability',
    label: 'Turn 2: 50k QPS & PgBouncer (Scalability)',
    text: 'We horizontally autoscaled ECS tasks and configured Redis cluster sharding with PgBouncer connection pooling to absorb 50,000 QPS.',
  },
  {
    turn: 3,
    persona: 'Jordan',
    competency: 'customer_impact',
    label: 'Turn 3: 18% Churn Reduction (Customer Impact)',
    text: 'Reducing checkout latency from 850ms to 180ms reduced user checkout drop-off by 18% during high-traffic events.',
  },
];

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Dynamic Audio Visualizer Animation
  useEffect(() => {
    if (callStatus === 'SPEAKING' || callStatus === 'LISTENING') {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 55) + 30);
      }, 100);
    } else {
      setAudioLevel(15);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [callStatus]);

  // Text-To-Speech: Browser Spoken Voice
  const speakText = (text: string, persona: string) => {
    if (isSpeakerMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = persona === 'Jordan' ? 1.15 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice =
          persona === 'Jordan'
            ? voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Samantha') ||
                    v.name.includes('Victoria') ||
                    v.name.includes('Karen') ||
                    v.name.includes('Female'))
              )
            : voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Daniel') ||
                    v.name.includes('Alex') ||
                    v.name.includes('Fred') ||
                    v.name.includes('Male'))
              );
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setCallStatus('SPEAKING');
      utterance.onend = () => {
        setCallStatus((prev) => (prev === 'COMPLETED' ? 'COMPLETED' : 'LISTENING'));
      };
      utterance.onerror = () => {
        setCallStatus((prev) => (prev === 'COMPLETED' ? 'COMPLETED' : 'LISTENING'));
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Speech-To-Text: Browser Microphone Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (!isMuted && callStatus === 'LISTENING') {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcriptText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcriptText += event.results[i][0].transcript;
          }
          setCandidateInput(transcriptText);

          if (event.results[0]?.isFinal) {
            submitCandidateAnswer(transcriptText);
          }
        };

        recognition.onerror = () => {
          // Keep listening active
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        // Recognition already running or user denied
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isMuted, callStatus]);

  // Initial connection & Alex opening prompt
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      if (!mounted) return;
      setCallStatus('THINKING');

      try {
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
        setCallStatus('SPEAKING');
        speakText(initialGreeting, 'Alex');
      } catch (err) {
        console.error('Error starting conversation:', err);
        setCallStatus('LISTENING');
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [interviewId]);

  // Submit Candidate Answer to EchoSphere Member 1 Loop
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
      const res = await fetch(`/api/custom-llm?interview_id=${interviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: answerText.trim() }],
        }),
      });

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        'Thank you. Could you elaborate on how you handle data consistency?';
      const meta = data?.echosphere_meta;

      let nextPersona = activePersona;

      if (meta?.latest_action) {
        setLatestAction(meta.latest_action);
        if (meta.latest_action.action === 'SWITCH_AGENT') {
          setCallStatus('HANDOFF');
          nextPersona = meta.latest_action.target_agent_id || 'product';
          setTimeout(() => {
            setActivePersona(nextPersona);
            setCoverageCount(2);
          }, 600);
        } else if (meta.latest_action.action === 'COMPLETE') {
          setCoverageCount(3);
        }
      }

      if (meta?.latest_analysis) {
        setLatestAnalysis(meta.latest_analysis);
      }

      const personaName =
        nextPersona === 'product' || meta?.latest_action?.target_agent_id === 'product'
          ? 'Jordan'
          : 'Alex';

      const interviewerTurn: TranscriptTurn = {
        id: `interv-${Date.now()}`,
        speaker: 'interviewer',
        personaName,
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, interviewerTurn]);

      if (meta?.is_complete || meta?.latest_action?.action === 'COMPLETE') {
        speakText(reply, personaName);
        setCallStatus('COMPLETED');
        if (onInterviewComplete) {
          setTimeout(() => onInterviewComplete(), 4000);
        }
      } else {
        speakText(reply, personaName);
      }
    } catch (err) {
      console.error('Turn processing failed:', err);
      setCallStatus('LISTENING');
    }
  };

  // 1-Click Auto-Play Full Canonical Scenario
  const runAutoPilotDemo = async () => {
    if (isAutoPlaying || callStatus === 'THINKING') return;
    setIsAutoPlaying(true);

    for (let i = 0; i < CANONICAL_PRESETS.length; i++) {
      const preset = CANONICAL_PRESETS[i];
      setCandidateInput(preset.text);
      await new Promise((r) => setTimeout(r, 1200));
      await submitCandidateAnswer(preset.text);
      // Wait for speech/thinking to settle before next turn
      await new Promise((r) => setTimeout(r, 6500));
    }
    setIsAutoPlaying(false);
  };

  return (
    <div className="flex h-full min-h-screen flex-col bg-light-surface text-deep-indigo font-sora">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-pale-indigo/40 bg-pure-white px-8 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-deep-indigo tracking-tight-card">{jobTitle}</h2>
            <span className="rounded-full bg-yellow-accent/20 px-3 py-0.5 text-xs font-medium text-deep-indigo border border-yellow-accent/50">
              Agora Live Voice Interview
            </span>
          </div>
          <p className="text-xs text-muted-indigo mt-0.5">
            Candidate: <span className="font-medium text-deep-indigo">{candidateName}</span> • Session ID:{' '}
            <span className="font-medium text-deep-indigo">{interviewId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 1-Click Auto-Pilot Canonical Demo Button */}
          <button
            onClick={runAutoPilotDemo}
            disabled={isAutoPlaying || callStatus === 'COMPLETED'}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              isAutoPlaying
                ? 'bg-yellow-accent text-deep-indigo animate-pulse'
                : 'bg-teal-accent/20 border border-teal-accent text-deep-indigo hover:bg-teal-accent/40'
            }`}
            title="Automatically run the 3-turn canonical Alex ➔ Jordan demo"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isAutoPlaying ? 'Auto-Pilot Running...' : 'Auto-Play Canonical Demo'}</span>
          </button>

          <MicrophoneSelector
            selectedDeviceId={selectedMicrophone}
            onDeviceSelect={setSelectedMicrophone}
          />

          <button
            onClick={() => {
              if (!isSpeakerMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsSpeakerMuted(!isSpeakerMuted);
            }}
            className={`rounded-full border p-2.5 transition-all ${
              isSpeakerMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-light-surface border-pale-indigo/50 text-deep-indigo hover:border-deep-indigo'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker Audio' : 'Mute Speaker Audio'}
          >
            {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full">
        {/* Left 7 Columns: Active Persona & Concentric Orb Visualizer */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Persona Header Card */}
          <ActivePersonaBadge
            agentId={activePersona}
            isSpeaking={callStatus === 'SPEAKING'}
            isListening={callStatus === 'LISTENING'}
            currentCompetency={activePersona === 'product' ? 'customer_impact' : 'system_design'}
          />

          {/* Central Animated Voice Orb Card */}
          <div className="relative flex flex-1 flex-col items-center justify-center rounded-[35px] border border-pale-indigo/40 bg-pure-white p-12 shadow-card-default min-h-[380px] overflow-hidden">
            <div className="relative flex items-center justify-center">
              {/* Outer Ripple Wave Ring */}
              <div
                className="absolute rounded-full border border-teal-accent/30 transition-all duration-300 pointer-events-none"
                style={{
                  width: `${170 + audioLevel * 2.2}px`,
                  height: `${170 + audioLevel * 2.2}px`,
                  opacity: callStatus === 'SPEAKING' || callStatus === 'LISTENING' ? 0.85 : 0.15,
                }}
              />

              {/* Middle Accent Wave Ring */}
              <div
                className="absolute rounded-full border border-yellow-accent/40 transition-all duration-200 pointer-events-none"
                style={{
                  width: `${140 + audioLevel * 1.5}px`,
                  height: `${140 + audioLevel * 1.5}px`,
                  opacity: callStatus === 'SPEAKING' || callStatus === 'LISTENING' ? 0.9 : 0.25,
                }}
              />

              {/* Core Concentric Orb */}
              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full bg-deep-indigo text-pure-white shadow-overlay-lift transition-transform duration-150"
                style={{
                  transform: `scale(${1 + (audioLevel - 15) * 0.0035})`,
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {callStatus === 'THINKING' ? (
                    <Sparkles className="h-8 w-8 text-yellow-accent animate-spin" />
                  ) : callStatus === 'SPEAKING' ? (
                    <Volume2 className="h-8 w-8 text-teal-accent animate-bounce" />
                  ) : (
                    <Mic className="h-8 w-8 text-pure-white" />
                  )}
                  <span className="mt-1.5 text-[11px] font-medium tracking-wider uppercase">
                    {callStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle status banner */}
            <div className="absolute bottom-6 text-center">
              <p className="text-xs font-medium text-muted-indigo">
                {callStatus === 'LISTENING' && 'Microphone active • Speak your answer naturally'}
                {callStatus === 'THINKING' && 'EchoSphere evaluating answer & deciding next action...'}
                {callStatus === 'SPEAKING' && `${activePersona === 'product' ? 'Jordan' : 'Alex'} is speaking aloud`}
                {callStatus === 'HANDOFF' && 'Dynamic Persona Handoff in progress...'}
                {callStatus === 'COMPLETED' && 'Interview concluded. Preparing assessment report.'}
              </p>
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex items-center justify-between rounded-[24px] border border-pale-indigo/40 bg-pure-white p-4 shadow-card-default">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all ${
                  isMuted
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-light-surface text-deep-indigo border border-pale-indigo/50 hover:border-deep-indigo'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              </button>

              <span className="text-xs text-muted-indigo font-normal">
                Continuous Agora RTC Voice Channel
              </span>
            </div>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setCallStatus('COMPLETED');
                if (onInterviewComplete) onInterviewComplete();
              }}
              className="flex items-center gap-2 rounded-full bg-deep-indigo px-5 py-2.5 text-xs font-medium text-pure-white shadow-cta-yellow transition-all hover:bg-deep-indigo/90"
            >
              <PhoneOff className="h-4 w-4" />
              End Interview
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Live Conversation Transcript & Preset Quick Answers */}
        <div className="lg:col-span-5 flex flex-col rounded-[35px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default">
          <div className="flex items-center justify-between border-b border-pale-indigo/30 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-deep-indigo" />
              <h3 className="text-sm font-medium text-deep-indigo tracking-tight">Live Transcript</h3>
            </div>
            <span className="text-xs font-medium text-muted-indigo bg-light-surface px-2.5 py-0.5 rounded-full border border-pale-indigo/30">
              {transcripts.length} turns
            </span>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 max-h-[46vh]">
            {transcripts.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col ${
                  t.speaker === 'candidate' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] text-muted-indigo mb-1 px-1">
                  <span className="font-medium text-deep-indigo">
                    {t.speaker === 'candidate' ? candidateName : t.personaName || 'Interviewer'}
                  </span>
                  <span>{t.timestamp}</span>
                </div>

                <div
                  className={`rounded-[20px] px-4 py-3 text-xs leading-relaxed max-w-[90%] shadow-sm ${
                    t.speaker === 'candidate'
                      ? 'bg-deep-indigo text-pure-white rounded-tr-none'
                      : t.personaName === 'Jordan'
                      ? 'bg-yellow-accent/15 text-deep-indigo border border-yellow-accent/40 rounded-tl-none'
                      : 'bg-light-surface text-deep-indigo border border-pale-indigo/40 rounded-tl-none'
                  }`}
                >
                  {t.text}
                </div>
              </div>
            ))}
            <div ref={transcriptsEndRef} />
          </div>

          {/* 1-Click Preset Scenario Buttons for Fast Testing */}
          <div className="pt-3 pb-2 border-t border-pale-indigo/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-indigo uppercase tracking-wider">
                1-Click Test Answers:
              </span>
              <span className="text-[10px] text-muted-indigo">Click to test scenario</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {CANONICAL_PRESETS.map((preset) => (
                <button
                  key={preset.turn}
                  type="button"
                  disabled={callStatus === 'THINKING' || callStatus === 'COMPLETED'}
                  onClick={() => submitCandidateAnswer(preset.text)}
                  className="flex items-center justify-between rounded-xl border border-pale-indigo/40 bg-light-surface px-3 py-1.5 text-left text-[11px] font-normal text-deep-indigo hover:border-deep-indigo hover:bg-pure-white transition-all disabled:opacity-40"
                >
                  <span className="truncate mr-2">{preset.label}</span>
                  <CheckCircle2 className="h-3 w-3 text-muted-indigo flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Voice/Text Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCandidateAnswer(candidateInput);
            }}
            className="mt-2 flex gap-2 border-t border-pale-indigo/30 pt-3"
          >
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder="Speak aloud or type candidate answer..."
              disabled={callStatus === 'THINKING' || callStatus === 'COMPLETED'}
              className="flex-1 rounded-full border border-pale-indigo/60 bg-light-surface px-4 py-2.5 text-xs text-deep-indigo placeholder-muted-indigo focus:border-deep-indigo focus:bg-pure-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!candidateInput.trim() || callStatus === 'THINKING'}
              className="flex items-center gap-1.5 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 disabled:opacity-50 px-5 py-2.5 text-xs font-medium text-pure-white shadow-cta-yellow transition-all"
            >
              <span>Send</span>
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Observability Inspector */}
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
