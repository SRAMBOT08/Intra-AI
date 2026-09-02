'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Mic, ShieldCheck, ArrowRight } from 'lucide-react';
import { MicrophoneSelector } from '@/components/MicrophoneSelector';

export default function CandidateWelcomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  useEffect(() => {
    async function checkMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    <div className="flex min-h-screen items-center justify-center bg-light-surface text-deep-indigo font-sora px-6 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-[35px] border border-pale-indigo/40 bg-pure-white p-10 shadow-card-default">
        <div className="text-center space-y-2.5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-deep-indigo text-pure-white ring-2 ring-yellow-accent shadow-sm">
            <Mic className="h-7 w-7 text-pure-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-medium text-deep-indigo tracking-tight">
            Welcome to Your Voice Interview
          </h1>
          <p className="text-xs text-muted-indigo font-normal">
            Interview Session ID: <span className="font-medium text-deep-indigo">{id}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-[24px] border border-pale-indigo/40 bg-light-surface p-6 space-y-3 text-xs text-deep-indigo">
          <div className="flex items-center gap-2 font-medium text-deep-indigo text-sm">
            <ShieldCheck className="h-4 w-4 text-teal-accent" />
            What to Expect:
          </div>
          <ul className="space-y-2 text-muted-indigo font-normal list-disc list-inside leading-relaxed">
            <li>You will speak with two specialized AI interviewers in one continuous call.</li>
            <li><strong>Alex (Technical Interviewer)</strong> evaluates system design and scalability.</li>
            <li><strong>Jordan (Product Lead)</strong> evaluates customer impact and business trade-offs.</li>
            <li>Speak naturally into your microphone at your regular pace.</li>
          </ul>
        </div>

        {/* Microphone Check & Selector */}
        <div className="rounded-[24px] border border-pale-indigo/40 bg-light-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-deep-indigo">Microphone Setup</span>
            <MicrophoneSelector
              selectedDeviceId={selectedDevice}
              onDeviceSelect={setSelectedDevice}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-indigo">
              <span>Voice Volume Level</span>
              <span className="font-medium text-deep-indigo">{micVolume}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-pure-white border border-pale-indigo/40">
              <div
                className="h-full bg-deep-indigo transition-all duration-100"
                style={{ width: `${Math.max(5, micVolume * 1.5)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Join Button with Yellow Accent Ring */}
        <div className="pt-2">
          <Link
            href={`/candidate/interview/${id}/live`}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-deep-indigo hover:bg-deep-indigo/90 py-4 text-xs font-medium text-pure-white shadow-cta-yellow transition-all"
          >
            <span>Enter Voice Interview</span>
            <ArrowRight className="h-4 w-4 text-yellow-accent" />
          </Link>
        </div>
      </div>
    </div>
  );
}
