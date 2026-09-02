'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Radio,
  Zap,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { ActivePersonaBadge } from './ActivePersonaBadge';
import { ObservabilityDrawer } from './ObservabilityDrawer';
import { MicrophoneSelector } from './MicrophoneSelector';
import { DualAudioWaveform } from './DualAudioWaveform';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
import { PERSONAS, INITIAL_GREETINGS } from '@/lib/personas';
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
    label: 'Turn 1: Redis Cache & Eventual Consistency',
    text: 'We introduced Redis caching with read-through and write-behind patterns to decouple synchronous writes.',
  },
  {
    turn: 2,
    label: 'Turn 2: Distributed Locking & Kafka Dead-Letters',
    text: 'For concurrency, we leveraged Redlock distributed leases with jittered backoff, routed unrecoverable messages into a Kafka dead-letter queue, and maintained idempotency keys across replicas.',
  },
  {
    turn: 3,
    label: 'Turn 3: Business Impact & P99 Latency',
    text: 'We reduced P99 latency from 850ms to 95ms, which directly improved user checkout completion rate by 14% and saved an estimated k annually in compute overhead.',
  },
];

export function VoiceInterviewRoom({
  interviewId,
  candidateName = 'Alex Johnson',
  jobTitle = 'Senior Distributed Systems Engineer',
  initialAgentId = 'technical',
  onInterviewComplete,
}: VoiceInterviewRoomProps) {
  const initialGreetingText = INITIAL_GREETINGS[initialAgentId] || INITIAL_GREETINGS.technical;
  const [activePersona, setActivePersona] = useState<string>(initialAgentId);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<
    'CONNECTING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'HANDOFF' | 'COMPLETED'
  >('CONNECTING');

  const [candidateInput, setCandidateInput] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([
    {
      id: 'turn-initial-greeting',
      speaker: 'interviewer',
      personaName: initialAgentId === 'product' ? 'Jordan' : 'Alex',
      text: initialGreetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [liveCaption, setLiveCaption] = useState<string>(initialGreetingText);
  const [latestAnalysis, setLatestAnalysis] = useState<AnswerAnalysis | null>(null);
  const [latestAction, setLatestAction] = useState<NextAction | null>(null);
  const [coverageCount, setCoverageCount] = useState(1);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(20);
  const [channelConnected, setChannelConnected] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const transcriptsEndRef = useRef<HTMLDivElement>(null);
  const rtcClientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const remoteAudioTrackRef = useRef<IRemoteAudioTrack | null>(null);
  const agentIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const callStatusRef = useRef(callStatus);
  const isMutedRef = useRef(isMuted);
  const activePersonaRef = useRef(activePersona);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (recognitionRef.current) {
      if (isMuted) {
        try { recognitionRef.current.stop(); } catch {}
      } else {
        try { recognitionRef.current.start(); } catch {}
      }
    }
  }, [isMuted]);

  useEffect(() => {
    activePersonaRef.current = activePersona;
  }, [activePersona]);

  const channelName = `echosphere-${interviewId}`;
  const candidateUid = useRef(Math.floor(Math.random() * 8000) + 1000).current;

  // Auto scroll transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, interimTranscript]);

  // Audio level visualizer animation based on Agora volume
  useEffect(() => {
    if (!channelConnected) return;

    const interval = setInterval(() => {
      if (callStatus === 'SPEAKING' || callStatus === 'LISTENING') {
        setAudioLevel(Math.floor(Math.random() * 40) + 25);
      } else {
        setAudioLevel(15);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [channelConnected, callStatus]);

  // Sync session transcript and intelligence state from backend
  const syncSessionState = useCallback(async () => {
    try {
      const res = await fetch(`/api/interviews/${interviewId}/report`);
      if (res.ok) {
        const data = await res.json();
        const session = data?.session;
        if (session) {
          if (session.transcript_history && session.transcript_history.length > 0) {
            const formattedTurns: TranscriptTurn[] = session.transcript_history.map(
              (t: any, index: number) => ({
                id: t.turn_id || `turn-${index}`,
                speaker: t.speaker,
                personaName: t.persona || (t.speaker === 'candidate' ? candidateName : 'Alex'),
                text: t.text,
                timestamp: t.timestamp
                  ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })
            );
            setTranscripts((prev) => {
              const existingTexts = new Set(prev.map((p) => p.text.trim()));
              const newTurns = formattedTurns.filter((f) => !existingTexts.has(f.text.trim()));
              if (newTurns.length > 0) {
                return [...prev, ...newTurns];
              }
              return prev;
            });
            if (formattedTurns.length > 0) {
              const last = formattedTurns[formattedTurns.length - 1];
              setLiveCaption(last.text);
            }
          }

          if (session.current_agent_id && session.current_agent_id !== activePersonaRef.current) {
            setActivePersona(session.current_agent_id);
            if (session.current_agent_id === 'product') {
              setCoverageCount(2);
            }
          }

          if (session.latest_analysis) setLatestAnalysis(session.latest_analysis);
          if (session.latest_action) setLatestAction(session.latest_action);

          if (session.status === 'COMPLETED') {
            setCallStatus('COMPLETED');
            setCoverageCount(3);
            if (onInterviewComplete) onInterviewComplete();
          }
        }
      }
    } catch (err) {
      console.warn('[VoiceInterviewRoom] Error polling session state:', err);
    }
  }, [interviewId, candidateName, onInterviewComplete]);

  // Join Agora RTC Channel and Initialize Conversational AI Agent
  useEffect(() => {
    let isMounted = true;
    const myUid = Math.floor(Math.random() * 800000) + 100000;

    async function initAgoraVoice() {
      try {
        setCallStatus('CONNECTING');
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

        // 1. Create Agora RTC Client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        rtcClientRef.current = client;

        // Enable Agora audio volume indication for real-time waveform visualizer
        client.enableAudioVolumeIndicator();
        client.on('volume-indicator', (volumes) => {
          const remoteVol = volumes.find((v) => v.uid === DEFAULT_AGENT_UID || v.uid !== myUid);
          const localVol = volumes.find((v) => v.uid === myUid || v.uid === 0);

          if (remoteVol && remoteVol.level > 10) {
            setCallStatus('SPEAKING');
            setAudioLevel(Math.min(90, remoteVol.level * 2 + 20));
          } else if (localVol && localVol.level > 10) {
            setCallStatus('LISTENING');
            setAudioLevel(Math.min(90, localVol.level * 2 + 20));
          }
        });

        // 2. Subscribe to remote Agora Conversational AI Agent audio track
        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          if (mediaType === 'audio') {
            await client.subscribe(user, mediaType);
            const remoteAudioTrack = user.audioTrack;
            if (remoteAudioTrack) {
              remoteAudioTrackRef.current = remoteAudioTrack;
              remoteAudioTrack.play();
              setAgentConnected(true);
              setCallStatus('SPEAKING');
            }
          }
        });

        client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          if (mediaType === 'audio') {
            setCallStatus('LISTENING');
          }
        });

        // Listen to real-time Agora RTC stream-message from Conversational AI Agent
        client.on('stream-message', (uid: number, stream: Uint8Array) => {
          try {
            const text = new TextDecoder('utf-8').decode(stream);
            let data: any = null;
            try {
              data = JSON.parse(text);
            } catch {
              return;
            }
            if (!data) return;

            // 1. Assistant / AI speech transcription
            if (
              data.object === 'assistant.transcription' ||
              data.messageType === 'assistant.transcription' ||
              (data.text && (data.speaker === 'agent' || uid === DEFAULT_AGENT_UID))
            ) {
              const agentText = (data.text || '').trim();
              if (agentText) {
                setLiveCaption(agentText);
                const turnId = `agent-stream-${data.turn_id ?? 'active'}`;
                setTranscripts((prev) => {
                  const existingIdx = prev.findIndex((t) => t.id === turnId);
                  const newTurn: TranscriptTurn = {
                    id: turnId,
                    speaker: 'interviewer',
                    personaName: activePersonaRef.current === 'product' ? 'Jordan' : 'Alex',
                    text: agentText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  if (existingIdx >= 0) {
                    const copy = [...prev];
                    copy[existingIdx] = newTurn;
                    return copy;
                  }
                  return [...prev, newTurn];
                });
                setCallStatus('SPEAKING');
              }
            }

            // 2. User / Candidate speech transcription from Cloud STT
            if (
              data.object === 'user.transcription' ||
              data.messageType === 'user.transcription'
            ) {
              const userText = (data.text || '').trim();
              if (userText) {
                setLiveCaption(userText);
                const turnId = `cand-stream-${data.turn_id ?? 'active'}`;
                setTranscripts((prev) => {
                  const existingIdx = prev.findIndex((t) => t.id === turnId);
                  const newTurn: TranscriptTurn = {
                    id: turnId,
                    speaker: 'candidate',
                    personaName: candidateName,
                    text: userText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  if (existingIdx >= 0) {
                    const copy = [...prev];
                    copy[existingIdx] = newTurn;
                    return copy;
                  }
                  return [...prev, newTurn];
                });
              }
            }
          } catch (e) {
            console.warn('[AgoraRTC] Stream message decoding error:', e);
          }
        });

        // 3. Obtain RTC token from backend
        let token: string | null = null;
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

        if (!appId) {
          setErrorMessage(
            'Agora App ID not configured: Please set NEXT_PUBLIC_AGORA_APP_ID and NEXT_AGORA_APP_CERTIFICATE in .env.local to connect Agora RTC audio.'
          );
          setCallStatus('LISTENING');
          pollIntervalRef.current = setInterval(syncSessionState, 1500);
          return;
        }

        try {
          const tokenRes = await fetch(
            `/api/generate-agora-token?channel=${encodeURIComponent(channelName)}&uid=${myUid}`
          );
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            token = tokenData.token;
          }
        } catch (e) {
          console.warn('[AgoraRTC] Could not generate token, attempting join with null token:', e);
        }

        if (!isMounted) return;

        // 4. Join the Agora RTC Channel
        if (client.connectionState === 'DISCONNECTED') {
          await client.join(appId, channelName, token, myUid);
        }
        if (!isMounted) return;
        setChannelConnected(true);

        // 5. Create and Publish Local Candidate Microphone Track
        const localTrack = await AgoraRTC.createMicrophoneAudioTrack(
          selectedMicrophone ? { microphoneId: selectedMicrophone } : undefined
        );
        localAudioTrackRef.current = localTrack;
        if (client.connectionState === 'CONNECTED') {
          await client.publish([localTrack]);
        }

        // 6. Connect AgoraVoiceAI Toolkit for Real-time Transcripts
        try {
          const { AgoraVoiceAI, AgoraVoiceAIEvents } = await import('agora-agent-client-toolkit');
          const voiceAI = await AgoraVoiceAI.init({
            rtcEngine: client,
            enableLog: false,
          });
          voiceAI.subscribeMessage(channelName);

          voiceAI.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, (chatHistory: any[]) => {
            if (!Array.isArray(chatHistory) || chatHistory.length === 0) return;
            const formatted = chatHistory
              .filter((item) => item.text && item.text.trim())
              .map((item) => ({
                id: `history-${item.turn_id}-${item.stream_id}`,
                speaker: item.uid === String(myUid) || item.uid === candidateUid ? ('candidate' as const) : ('interviewer' as const),
                personaName:
                  item.uid === String(myUid) || item.uid === candidateUid
                    ? candidateName
                    : activePersonaRef.current === 'product'
                    ? 'Jordan'
                    : 'Alex',
                text: item.text.trim(),
                timestamp: new Date(item._time || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }));

            if (formatted.length > 0) {
              setTranscripts((prev) => {
                const initial = prev.filter((t) => t.id === 'turn-initial-greeting');
                const combined = [...initial];
                formatted.forEach((f) => {
                  if (!combined.some((c) => c.text === f.text)) {
                    combined.push(f);
                  }
                });
                return combined;
              });
              const last = formatted[formatted.length - 1];
              if (last) setLiveCaption(last.text);
            }
          });

          voiceAI.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_agentUid: string, evt: any) => {
            if (evt?.state === 'speaking') {
              setCallStatus('SPEAKING');
            } else if (evt?.state === 'listening') {
              setCallStatus('LISTENING');
            } else if (evt?.state === 'thinking') {
              setCallStatus('THINKING');
            }
          });
        } catch (tkErr) {
          console.warn('[AgoraVoiceAI] Toolkit init warning:', tkErr);
        }

        // 7. Invite the Agora Conversational AI Agent to the channel
        const inviteRes = await fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: String(myUid),
            channel_name: channelName,
            interview_id: interviewId,
            initial_agent_id: initialAgentId,
          }),
        });

        if (inviteRes.ok) {
          const inviteData = await inviteRes.json();
          agentIdRef.current = inviteData.agent_id;
        }

        setCallStatus('LISTENING');

        // Start session sync polling every 1.5s
        pollIntervalRef.current = setInterval(syncSessionState, 1500);
      } catch (err) {
        console.error('[AgoraRTC] Failed to initialize Agora RTC audio:', err);
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : 'Agora RTC connection error');
          setCallStatus('LISTENING');
        }
      }
    }

    initAgoraVoice();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }

      if (rtcClientRef.current) {
        rtcClientRef.current.leave().catch(() => {});
      }

      if (agentIdRef.current) {
        fetch('/api/stop-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: agentIdRef.current,
            interview_id: interviewId,
          }),
        }).catch(() => {});
      }
    };
  }, [channelName, candidateUid, initialAgentId, interviewId, selectedMicrophone, syncSessionState]);

  // Handle Local Microphone Mute
  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Handle Remote Speaker Mute
  const toggleSpeakerMute = () => {
    if (remoteAudioTrackRef.current) {
      if (isSpeakerMuted) {
        remoteAudioTrackRef.current.setVolume(100);
      } else {
        remoteAudioTrackRef.current.setVolume(0);
      }
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  };

  // Web Speech API for instant client-side candidate transcription
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VoiceInterviewRoom] Web SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let silenceTimeout: NodeJS.Timeout | null = null;
    let accumulatedFinal = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          accumulatedFinal += ' ' + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentLive = (accumulatedFinal + ' ' + interim).trim();
      if (currentLive) {
        setInterimTranscript(currentLive);
        setLiveCaption(currentLive);
        setCallStatus('LISTENING');
      }

      // Reset debounce on new speech
      if (silenceTimeout) clearTimeout(silenceTimeout);

      // Debounce: if candidate pauses for 1.8s, automatically submit the spoken answer
      silenceTimeout = setTimeout(() => {
        const fullSpoken = (accumulatedFinal + ' ' + interim).trim();
        if (fullSpoken.length >= 6) {
          accumulatedFinal = '';
          setInterimTranscript('');
          submitCandidateAnswer(fullSpoken);
        }
      }, 1800);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[SpeechRecognition] error:', event.error);
      }
    };

    recognition.onend = () => {
      if (callStatusRef.current !== 'COMPLETED' && !isMutedRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('[SpeechRecognition] Start error:', e);
    }

    return () => {
      if (silenceTimeout) clearTimeout(silenceTimeout);
      try {
        recognition.stop();
      } catch {}
    };
  }, [channelConnected]);

  // Submit candidate answer via text / speech / preset button
  const submitCandidateAnswer = async (answerText: string) => {
    if (!answerText.trim() || callStatusRef.current === 'THINKING' || callStatusRef.current === 'COMPLETED') return;

    const trimmed = answerText.trim();
    const candidateTurn: TranscriptTurn = {
      id: `cand-${Date.now()}`,
      speaker: 'candidate',
      personaName: candidateName,
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscripts((prev) => [...prev, candidateTurn]);
    setCandidateInput('');
    setInterimTranscript('');
    setLiveCaption(trimmed);
    setCallStatus('THINKING');

    // Also persist turn to backend session
    fetch(`/api/interviews/${interviewId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speaker: 'candidate',
        text: trimmed,
      }),
    }).catch(() => {});

    try {
      const res = await fetch(`/api/custom-llm?interview_id=${interviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
        }),
      });

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        'Thank you. Could you elaborate on how you handle data consistency?';
      const meta = data?.echosphere_meta;

      let nextPersona = activePersonaRef.current;

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
          setCallStatus('COMPLETED');
          setCoverageCount(3);
          if (onInterviewComplete) onInterviewComplete();
        }
      }

      if (meta?.latest_analysis) {
        setLatestAnalysis(meta.latest_analysis);
      }

      const agentTurn: TranscriptTurn = {
        id: `agent-${Date.now()}`,
        speaker: 'interviewer',
        personaName: nextPersona === 'product' ? 'Jordan' : 'Alex',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscripts((prev) => [...prev, agentTurn]);
      setLiveCaption(reply);
      setCallStatus('SPEAKING');

      // If speech synthesis in browser is available and agent is in fallback offline mode, speak it
      if ('speechSynthesis' in window && !agentConnected) {
        const utter = new SpeechSynthesisUtterance(reply);
        utter.rate = 1.0;
        utter.onend = () => {
          if (callStatusRef.current !== 'COMPLETED') setCallStatus('LISTENING');
        };
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => {
          if (callStatusRef.current !== 'COMPLETED') {
            setCallStatus('LISTENING');
          }
        }, 4000);
      }
    } catch (err) {
      console.error('[VoiceInterviewRoom] Error submitting answer:', err);
      setCallStatus('LISTENING');
    }
  };

  // End Interview & Cleanup
  const handleEndInterview = async () => {
    setCallStatus('COMPLETED');
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
    }
    if (rtcClientRef.current) {
      await rtcClientRef.current.leave().catch(() => {});
    }
    if (agentIdRef.current) {
      await fetch('/api/stop-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentIdRef.current,
          interview_id: interviewId,
        }),
      }).catch(() => {});
    }
    if (onInterviewComplete) onInterviewComplete();
  };

  const latestTranscript = transcripts.length > 0 ? transcripts[transcripts.length - 1].text : '';
  const progressPercent = Math.min(100, Math.max(15, Math.round((coverageCount / 3) * 100)));

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#f4f6f5] text-slate-800 font-sora">
      {/* Top Greenhouse Bar */}
      <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-8 py-3.5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-brand text-white font-serif font-bold text-lg shadow-xs">
            i
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
                Interview with Intra Voice AI
              </h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                Agora RTC Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Talk to Intra like you would a real person &bull; Role: <strong className="text-slate-700 font-medium">{jobTitle}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MicrophoneSelector
            selectedDeviceId={selectedMicrophone}
            onDeviceSelect={setSelectedMicrophone}
          />

          <button
            onClick={toggleSpeakerMute}
            className={`rounded-full border p-2 text-xs transition-all ${
              isSpeakerMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Greenhouse Dual Workspace (Screenshots 1.01.04 & 1.01.06) */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full items-stretch">
        {/* Left Column (5 cols): Interview in progress, Transcript Feed, End interview button */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          {/* Top: Progress Header */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 text-sm font-serif">Interview in progress</span>
              <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {progressPercent}% Complete
              </span>
            </div>
            {/* Green Progress Bar (Greenhouse 1.01.06 AM.png) */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[44vh]">
            {transcripts.length === 0 ? (
              <div className="flex h-full min-h-[160px] items-center justify-center text-center p-6 text-xs text-slate-400 leading-relaxed">
                Connect your microphone and begin speaking. Alex and Jordan will converse with you and live transcripts will appear here.
              </div>
            ) : (
              transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${
                    t.speaker === 'candidate' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span className="font-semibold text-slate-700">
                      {t.speaker === 'candidate' ? candidateName : t.personaName || 'Voice AI'}
                    </span>
                    <span>&bull; {t.timestamp}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[90%] shadow-2xs ${
                      t.speaker === 'candidate'
                        ? 'bg-forest-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}

            {/* Real-time live candidate speech bubble */}
            {interimTranscript && (
              <div className="flex flex-col items-end animate-pulse">
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mb-1 px-1">
                  <Mic className="h-3 w-3 text-emerald-600 animate-pulse" />
                  <span>{candidateName} (Speaking...)</span>
                </div>
                <div className="rounded-2xl rounded-tr-none px-4 py-2.5 text-xs bg-forest-900/90 text-emerald-100 border border-emerald-500/40 shadow-xs max-w-[90%]">
                  {interimTranscript}
                </div>
              </div>
            )}

            {/* AI thinking / analyzing state */}
            {callStatus === 'THINKING' && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic py-2 px-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                <span>{activePersona === 'product' ? 'Jordan' : 'Alex'} is evaluating your answer...</span>
              </div>
            )}

            <div ref={transcriptsEndRef} />
          </div>

          {/* 1-Click Fast Presets (Optional Helper for Fast Scenario Testing) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Test Presets (Click to speak):
            </div>
            <div className="grid grid-cols-1 gap-1">
              {CANONICAL_PRESETS.map((preset) => (
                <button
                  key={preset.turn}
                  type="button"
                  disabled={callStatus === 'THINKING' || callStatus === 'COMPLETED'}
                  onClick={() => submitCandidateAnswer(preset.text)}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1 text-left text-[11px] text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors truncate disabled:opacity-40"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice/Text Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCandidateAnswer(candidateInput);
            }}
            className="flex gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              value={candidateInput}
              onChange={(e) => setCandidateInput(e.target.value)}
              placeholder="Speak aloud or type answer here..."
              disabled={callStatus === 'THINKING' || callStatus === 'COMPLETED'}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!candidateInput.trim() || callStatus === 'THINKING'}
              className="rounded-full bg-forest-900 hover:bg-forest-800 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1"
            >
              <span>Send</span>
              <Send className="h-3 w-3" />
            </button>
          </form>

          {/* Bottom Card Footer: End Interview Pill & Candidate User Avatar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={handleEndInterview}
              className="rounded-full border border-slate-300 hover:border-rose-500 hover:text-rose-600 px-5 py-2 text-xs font-semibold text-slate-700 transition-colors"
            >
              End interview
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                {candidateName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-800">{candidateName}</div>
                <div className="text-[10px] text-slate-400">candidate@intra.ai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Dual Audio Waveform Display (Screenshots 1.01.04 & 1.01.06) */}
        <div className="lg:col-span-7 flex flex-col min-h-[520px]">
          <DualAudioWaveform
            interviewerName={activePersona === 'product' ? 'Jordan (Product Lead)' : 'Alex (Technical Interviewer)'}
            candidateName={candidateName}
            isAiSpeaking={callStatus === 'SPEAKING' || callStatus === 'HANDOFF'}
            isCandidateSpeaking={(callStatus === 'LISTENING' && audioLevel > 15) || Boolean(interimTranscript)}
            aiVolume={callStatus === 'SPEAKING' ? 75 : 20}
            candidateVolume={Boolean(interimTranscript) ? 60 : audioLevel}
            liveCaption={liveCaption || latestTranscript}
          />
        </div>
      </div>

      {/* Observability Inspector */}
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
