'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  ShieldCheck,
  Headphones,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { MicrophoneSelector } from '@/components/MicrophoneSelector';

export default function CandidateWelcomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [candidateName, setCandidateName] = useState<string>('Candidate');
  const [jobTitle, setJobTitle] = useState<string>('Senior Distributed Systems Engineer');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // Fetch session details if available
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/interviews/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.candidate_name) setCandidateName(data.candidate_name);
          if (data.job_title) setJobTitle(data.job_title);
        }
      } catch (e) {
        // Fallback to defaults
      }
    }
    loadSession();
  }, [id]);

  // Real-time Microphone check and sound analyzer
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let interval: NodeJS.Timeout | null = null;

    async function checkMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setMicPermissionGranted(true);
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        interval = setInterval(() => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = Math.floor(sum / data.length);
          setMicVolume(Math.min(100, Math.floor((avg / 128) * 100)));
        }, 80);
      } catch (err) {
        console.warn('Microphone permission check:', err);
      }
    }
    checkMic();

    return () => {
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f5f4] text-slate-800 font-sora py-10 px-6 flex flex-col justify-between">
      <div className="mx-auto max-w-6xl w-full space-y-8">
        {/* Header with Company & Role Context */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Welcome, {candidateName}
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-normal pl-4.5">
              First-round conversational voice screen for <strong className="text-slate-800 font-semibold">{jobTitle}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs font-medium">
            <Clock className="h-3.5 w-3.5 text-emerald-700" />
            <span>48-Hour Interview Window Active</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (7 cols): Hardware Setup & Start Interview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-between rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center space-y-8 min-h-[480px]">
            {/* Live Audio Visualizer Orb */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#bef264]/40 text-emerald-950 border border-[#a3e635] shadow-xs transition-all">
              <Mic className="h-10 w-10 text-emerald-900" />
              {micVolume > 5 && (
                <span
                  className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-60 pointer-events-none"
                  style={{ transform: `scale(${1 + micVolume / 70})` }}
                />
              )}
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-serif font-semibold text-slate-900">
                Ready when you are
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                You will be conversing with <strong>Alex</strong> (Technical Lead) and <strong>Jordan</strong> (Product Lead). Talk to them just like you would a real colleague.
              </p>
            </div>

            {/* Microphone Check & Sound Level Meter */}
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Audio Input Source:</span>
                <span className="text-[10px] text-slate-400">
                  {micPermissionGranted ? 'Microphone Connected' : 'Check browser permission'}
                </span>
              </div>

              <MicrophoneSelector
                selectedDeviceId={selectedDevice}
                onDeviceSelect={setSelectedDevice}
              />

              {/* Sound Level Meter */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Speak to test level:</span>
                  <span className={micVolume > 5 ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {micVolume > 5 ? '🟢 Sound detected' : 'Quiet'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(5, micVolume)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Start Voice Interview CTA */}
            <div className="space-y-2 w-full max-w-xs">
              <Link
                href={`/candidate/interview/${id}/live`}
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                  }
                  if (audioCtxRef.current) {
                    audioCtxRef.current.close().catch(() => {});
                    audioCtxRef.current = null;
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#bef264] hover:bg-[#a3e635] text-emerald-950 px-8 py-3.5 text-sm font-bold tracking-tight shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                <Mic className="h-4 w-4 text-emerald-950 group-hover:scale-110 transition-transform" />
                <span>Start Voice Interview</span>
                <ArrowRight className="h-4 w-4 text-emerald-950 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="text-[10px] text-slate-400">
                12-min conversational screen &bull; Complete on your own schedule
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): What to Expect & Reassuring Tips */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Card Title */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">
                    What to Expect
                  </h3>
                </div>
                <p className="text-xs text-slate-400 pl-6 mt-0.5">
                  Natural conversation, zero trick questions
                </p>
              </div>

              {/* Reassuring Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Helpful Tips:
                </h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Feel free to pause:</strong> If you need time to think, just say &ldquo;Give me a second to gather my thoughts.&rdquo;
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Interrupt anytime:</strong> You can ask Alex or Jordan to repeat a question or clarify details.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Wear headphones:</strong> Using headphones prevents room echo and ensures crisp audio clarity.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Connection guarantee:</strong> If you accidentally disconnect, you can re-open this link anytime during your 48h window.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Reassurance Info Box */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-slate-700 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-blue-900">
                    Evaluated on your real experience
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    There are no leetcode puzzles or trick questions. Alex and Jordan evaluate how you think through architecture, trade-offs, and real-world engineering.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Unbiased, merit-grounded review
              </span>
              <span className="font-mono text-slate-500">Session {id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl w-full pt-8 flex items-center justify-between text-xs text-slate-400">
        <div>&copy; {new Date().getFullYear()} Intra AI Technologies. Candidate Experience Portal.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <a href="mailto:support@intra.ai" className="hover:underline">Get Help</a>
        </div>
      </footer>
    </div>
  );
}
