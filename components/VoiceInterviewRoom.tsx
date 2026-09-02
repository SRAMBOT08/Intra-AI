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
} from 'lucide-react';
import { ActivePersonaBadge } from './ActivePersonaBadge';
import { ObservabilityDrawer } from './ObservabilityDrawer';
import { MicrophoneSelector } from './MicrophoneSelector';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
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

  const channelName = `echosphere-${interviewId}`;
  const candidateUid = useRef(Math.floor(Math.random() * 8000) + 1000).current;

  // Auto scroll transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

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
                id: `turn-${index}`,
                speaker: t.speaker,
                personaName: t.persona || (t.speaker === 'candidate' ? candidateName : 'Alex'),
                text: t.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              })
            );
            setTranscripts(formattedTurns);
          }

          if (session.current_agent_id && session.current_agent_id !== activePersona) {
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
  }, [interviewId, activePersona, candidateName, onInterviewComplete]);

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

        // 3. Obtain RTC token from backend
        let token: string | null = null;
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

        if (!appId) {
          setErrorMessage(
            'Agora App ID not configured: Please set NEXT_PUBLIC_AGORA_APP_ID and NEXT_AGORA_APP_CERTIFICATE in .env.local to connect Agora RTC audio.'
          );
          setCallStatus('LISTENING');
          // Still poll session transcript
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

        // 6. Invite the Agora Conversational AI Agent to the channel
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

  return (
    <div className="flex h-full min-h-screen flex-col bg-light-surface text-deep-indigo font-sora">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-pale-indigo/40 bg-pure-white px-8 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-deep-indigo tracking-tight-card">{jobTitle}</h2>
            <span className="rounded-full bg-teal-accent/20 px-3 py-0.5 text-xs font-medium text-deep-indigo border border-teal-accent/50 flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-deep-indigo animate-pulse" />
              Agora Conversational AI (RTC Web SDK)
            </span>
          </div>
          <p className="text-xs text-muted-indigo mt-0.5">
            Candidate: <span className="font-medium text-deep-indigo">{candidateName}</span> • Session ID: <span className="font-medium text-deep-indigo">{interviewId}</span> • Channel: <span className="font-mono font-medium">{channelName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MicrophoneSelector
            selectedDeviceId={selectedMicrophone}
            onDeviceSelect={setSelectedMicrophone}
          />

          <button
            onClick={toggleSpeakerMute}
            className={`rounded-full border p-2.5 transition-all ${
              isSpeakerMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-light-surface border-pale-indigo/50 text-deep-indigo hover:border-deep-indigo'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
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
                className="relative z-10 flex items-center justify-center rounded-full bg-deep-indigo text-pure-white shadow-card-elevated transition-all duration-200"
                style={{
                  width: `${Math.max(130, audioLevel * 2.4)}px`,
                  height: `${Math.max(130, audioLevel * 2.4)}px`,
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  {callStatus === 'THINKING' || callStatus === 'CONNECTING' ? (
                    <Sparkles className="h-8 w-8 text-yellow-accent animate-spin" />
                  ) : callStatus === 'SPEAKING' ? (
                    <Volume2 className="h-8 w-8 text-teal-accent animate-bounce" />
                  ) : (
                    <Mic className={`h-8 w-8 ${!isMuted ? 'text-teal-accent' : 'text-pure-white'}`} />
                  )}
                  <span className="mt-1.5 text-[11px] font-medium tracking-wider uppercase">
                    {callStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle status banner */}
            <div className="absolute bottom-6 text-center flex flex-col items-center gap-1.5">
              <p className="text-xs font-medium text-muted-indigo">
                {callStatus === 'CONNECTING' && 'Connecting to Agora RTC channel & inviting agent...'}
                {callStatus === 'LISTENING' && '🎙️ Microphone streaming to Agora RTC • Speak naturally (Agora VAD active)'}
                {callStatus === 'THINKING' && 'Agora Cloud processing & evaluating intelligence...'}
                {callStatus === 'SPEAKING' && `🔊 ${activePersona === 'product' ? 'Jordan' : 'Alex'} speaking via Agora TTS (Barge-in enabled)`}
                {callStatus === 'HANDOFF' && '🔄 Dynamic Persona Handoff in progress...'}
                {callStatus === 'COMPLETED' && 'Interview concluded. Preparing assessment report.'}
              </p>
              {errorMessage && (
                <span className="text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  {errorMessage}
                </span>
              )}
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex items-center justify-between rounded-[24px] border border-pale-indigo/40 bg-pure-white p-4 shadow-card-default">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
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
                Agora RTC Audio Stream Active • Channel: <span className="font-mono text-deep-indigo">{channelName}</span>
              </span>
            </div>

            {/* End Interview */}
            <button
              onClick={handleEndInterview}
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
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 max-h-[60vh]">
            {transcripts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center p-8 text-xs text-muted-indigo">
                Speak into your microphone. Agora Conversational AI will stream real-time transcripts here.
              </div>
            ) : (
              transcripts.map((t) => (
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
              ))
            )}
            <div ref={transcriptsEndRef} />
          </div>
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
