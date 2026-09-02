'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Mic, Volume2, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { MicrophoneSelector } from '@/components/MicrophoneSelector';

export default function CandidateWelcomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [micAuthorized, setMicAuthorized] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  useEffect(() => {
    async function checkMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicAuthorized(true);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const interval = setInterval(() => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < 32; i++) sum += data[i];
          setMicVolume(Math.min(100, Math.floor(sum / 32)));
        }, 100);

        return () => {
          clearInterval(interval);
          stream.getTracks().forEach((t) => t.stop());
          audioCtx.close();
        };
      } catch (err) {
        console.warn('Microphone permission check:', err);
      }
    }
    checkMic();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-xl space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mic className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome to Your Voice Interview
          </h1>
          <p className="text-xs text-slate-400">
            Interview ID: <span className="font-mono text-cyan-400">{id}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            What to Expect:
          </div>
          <ul className="space-y-2 text-slate-400 list-disc list-inside">
            <li>You will speak with two specialized AI interviewers in one continuous call.</li>
            <li><strong>Alex (Technical Interviewer)</strong> evaluates system design and scalability.</li>
            <li><strong>Jordan (Product Lead)</strong> evaluates customer impact and trade-offs.</li>
            <li>Speak naturally into your microphone at your own pace.</li>
          </ul>
        </div>

        {/* Microphone Check & Selector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Microphone Setup</span>
            <MicrophoneSelector
              selectedDeviceId={selectedDevice}
              onDeviceSelect={setSelectedDevice}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Voice Volume Level</span>
              <span className="font-mono text-cyan-400">{micVolume}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-100"
                style={{ width: `${Math.max(5, micVolume * 1.5)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Join Button */}
        <div className="pt-2">
          <Link
            href={`/candidate/interview/${id}/live`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-600/25 transition-all"
          >
            Enter Voice Interview <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
