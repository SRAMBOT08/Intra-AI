'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Send,
  Radio,
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
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submitRef = useRef<((text: string) => Promise<void>) | null>(null);

  // Auto scroll transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Audio visualizer animation
  useEffect(() => {
    if (callStatus === 'SPEAKING' || callStatus === 'LISTENING') {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 50) + 25);
      }, 120);
    } else {
      setAudioLevel(15);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [callStatus]);

  // Browser Text-to-Speech (TTS) Voice Synthesis
  const speakText = useCallback(
    (text: string, persona: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || isSpeakerMuted) {
        if (onEnd) onEnd();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = persona === 'product' ? 1.15 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (persona === 'product') {
          const femaleVoice = voices.find(
            (v) =>
              (v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Karen') ||
                v.name.includes('Zira') ||
                v.name.includes('Female')) &&
              v.lang.startsWith('en')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = voices.find(
            (v) =>
              (v.name.includes('Daniel') ||
                v.name.includes('Alex') ||
                v.name.includes('David') ||
                v.name.includes('Male')) &&
              v.lang.startsWith('en')
          );
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeakerMuted]
  );

  // Submit Candidate Answer
  const submitCandidateAnswer = async (answerText: string) => {
    if (!answerText.trim() || callStatus === 'THINKING' || callStatus === 'COMPLETED') return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

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
      const reply = data?.choices?.[0]?.message?.content || 'Thank you. Could you elaborate on that?';
      const meta = data?.echosphere_meta;

      let nextPersona = activePersona;
      if (meta?.latest_action) {
        setLatestAction(meta.latest_action);
        if (meta.latest_action.action === 'SWITCH_AGENT') {
          nextPersona = 'product';
          setCallStatus('HANDOFF');
          setTimeout(() => {
            setActivePersona('product');
            setCoverageCount(2);
          }, 800);
        } else if (meta.latest_action.action === 'COMPLETE') {
          setCoverageCount(3);
        }
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
        setCallStatus('COMPLETED');
        speakText(reply, personaName, () => {
          if (onInterviewComplete) onInterviewComplete();
        });
      } else {
        setCallStatus('SPEAKING');
        speakText(reply, personaName, () => {
          setCallStatus('LISTENING');
        });
      }
    } catch (err) {
      console.error('Turn processing failed:', err);
      setCallStatus('LISTENING');
    }
  };

  submitRef.current = submitCandidateAnswer;

  // Browser Continuous Speech-to-Text (STT) Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const liveText = (finalTranscript + interimTranscript).trim();
      if (liveText) {
        setCandidateInput(liveText);

        // Auto-submit after candidate pauses speaking for 2.2 seconds
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (liveText.length > 8 && submitRef.current) {
            submitRef.current(liveText);
          }
        }, 2200);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Manage voice listening based on call status and mute
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (callStatus === 'LISTENING' && !isMuted) {
      try {
        recognitionRef.current.start();
        setIsVoiceListening(true);
      } catch (_) {}
    } else {
      try {
        recognitionRef.current.stop();
        setIsVoiceListening(false);
      } catch (_) {}
    }
  }, [callStatus, isMuted]);

  // Initial greeting connection
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
          `Hello! I'm Alex, your technical interviewer today. We will evaluate system design, scalability, and customer impact. To start, could you walk me through how you design your database and caching tier for high-throughput reads?`;

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
        speakText(initialGreeting, 'technical', () => {
          setCallStatus('LISTENING');
        });
      } catch (err) {
        console.error('Error starting conversation:', err);
        setCallStatus('LISTENING');
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [interviewId, speakText]);

  return (
    <div className="flex h-full min-h-screen flex-col bg-light-surface text-deep-indigo font-sora">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-pale-indigo/40 bg-pure-white px-8 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-deep-indigo tracking-tight-card">{jobTitle}</h2>
            <span className="rounded-full bg-yellow-accent/20 px-3 py-0.5 text-xs font-medium text-deep-indigo border border-yellow-accent/50 flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-deep-indigo animate-pulse" />
              Live Voice Interview
            </span>
          </div>
          <p className="text-xs text-muted-indigo mt-0.5">
            Candidate: <span className="font-medium text-deep-indigo">{candidateName}</span> • Session ID: <span className="font-medium text-deep-indigo">{interviewId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MicrophoneSelector
            selectedDeviceId={selectedMicrophone}
            onDeviceSelect={setSelectedMicrophone}
          />

          <button
            onClick={() => {
              if (!isSpeakerMuted) window.speechSynthesis.cancel();
              setIsSpeakerMuted(!isSpeakerMuted);
            }}
            className={`rounded-full border p-2.5 transition-all ${
              isSpeakerMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-light-surface border-pale-indigo/50 text-deep-indigo hover:border-deep-indigo'
            }`}
            title={isSpeakerMuted ? 'Unmute Voice Audio' : 'Mute Voice Audio'}
          >
            {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full">
        {/* Left 7 Columns: Active Persona & Visualizer Frame */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Active Interviewer Persona Card */}
          <ActivePersonaBadge
            personaId={activePersona}
            isSpeaking={callStatus === 'SPEAKING' || callStatus === 'HANDOFF'}
            isListening={callStatus === 'LISTENING'}
          />

          {/* Central Audio Visualizer Frame */}
          <div className="relative flex flex-1 items-center justify-center rounded-[35px] border border-pale-indigo/40 bg-pure-white p-10 shadow-card-default">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing rings using Teal Accent and Yellow Accent */}
              <div
                className="absolute rounded-full transition-all duration-300 bg-teal-accent/15 border border-teal-accent/30"
                style={{
                  width: `${audioLevel * 4.4}px`,
                  height: `${audioLevel * 4.4}px`,
                }}
              />
              <div
                className="absolute rounded-full transition-all duration-200 bg-yellow-accent/15 border border-yellow-accent/40"
                style={{
                  width: `${audioLevel * 3.4}px`,
                  height: `${audioLevel * 3.4}px`,
                }}
              />

              {/* Core Deep Indigo Orb */}
              <div
                className="relative z-10 flex items-center justify-center rounded-full bg-deep-indigo text-pure-white shadow-card-elevated transition-all duration-200 cursor-pointer"
                onClick={() => {
                  if (callStatus === 'LISTENING' && candidateInput.trim()) {
                    submitCandidateAnswer(candidateInput);
                  }
                }}
                style={{
                  width: `${Math.max(130, audioLevel * 2.4)}px`,
                  height: `${Math.max(130, audioLevel * 2.4)}px`,
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  {callStatus === 'THINKING' ? (
                    <Sparkles className="h-8 w-8 text-yellow-accent animate-spin" />
                  ) : callStatus === 'SPEAKING' ? (
                    <Volume2 className="h-8 w-8 text-teal-accent animate-bounce" />
                  ) : (
                    <Mic className={`h-8 w-8 ${isVoiceListening ? 'text-teal-accent' : 'text-pure-white'}`} />
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
                {callStatus === 'LISTENING' && (isVoiceListening ? '🎙️ Microphone listening • Speak naturally now' : 'Microphone ready')}
                {callStatus === 'THINKING' && 'EchoSphere evaluating answer & deciding next action...'}
                {callStatus === 'SPEAKING' && `🔊 ${activePersona === 'product' ? 'Jordan' : 'Alex'} is speaking...`}
                {callStatus === 'HANDOFF' && '🔄 Dynamic Persona Handoff in progress...'}
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
                {isMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>

              <span className="text-xs text-muted-indigo font-normal">
                Continuous Voice Conversation Active
              </span>
            </div>

            {/* End Interview */}
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
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

        {/* Right 5 Columns: Live Conversation Transcript */}
        <div className="lg:col-span-5 flex flex-col rounded-[35px] border border-pale-indigo/40 bg-pure-white p-6 shadow-card-default">
          <div className="flex items-center justify-between border-b border-pale-indigo/30 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-deep-indigo" />
              <h3 className="text-sm font-medium text-deep-indigo tracking-tight">Conversation Transcript</h3>
            </div>
            <span className="text-xs font-medium text-muted-indigo bg-light-surface px-2.5 py-0.5 rounded-full border border-pale-indigo/30">
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

          {/* Candidate Voice / Text Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCandidateAnswer(candidateInput);
            }}
            className="mt-3 flex gap-2 border-t border-pale-indigo/30 pt-4"
          >
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder={isVoiceListening ? '🎙️ Listening... (or type your answer here)' : 'Speak into mic or type answer...'}
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
