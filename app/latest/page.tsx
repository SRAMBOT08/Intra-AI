'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Share2,
  Cpu,
  Mail,
  Mic,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Terminal,
  Layers,
  Database,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { GreenhouseNavbar } from '@/components/GreenhouseNavbar';

interface PipelineEvent {
  id: string;
  service: string;
  action: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
  duration: string;
  request: Record<string, any>;
  response: Record<string, any>;
}

export default function LatestPipelineDemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // default completed view
  const [logs, setLogs] = useState<string[]>([
    'Intra automation gateway initialized and listening on webhook endpoints',
    'Connected services: [candidate-intake, ats-engine, email-dispatcher, voice-ai]',
    'Ready to handle application events from LinkedIn and Internshala',
  ]);

  const pipelineEvents: PipelineEvent[] = [
    {
      id: 'step-1',
      service: 'api://talent-gateway',
      action: 'ingest_application_webhook',
      status: 'COMPLETED',
      duration: '42ms',
      request: {
        source: 'LinkedIn Talent Solutions',
        candidate_name: 'Dr. Elena Rostova',
        candidate_email: 'elena.rostova@techmail.io',
        role: 'Senior Distributed Systems Engineer',
        applied_at: new Date().toISOString(),
      },
      response: {
        status: 'SUCCESS',
        candidate_id: 'cand_98412',
        cv_text_bytes: 4096,
        source_verified: true,
      },
    },
    {
      id: 'step-2',
      service: 'api://ats-intelligence',
      action: 'parse_and_match_rubric',
      status: 'COMPLETED',
      duration: '118ms',
      request: {
        candidate_id: 'cand_98412',
        job_id: 'job_dist_sys_01',
        required_competencies: ['system_design', 'scalability', 'customer_impact'],
      },
      response: {
        role_match_score: 0.94,
        threshold_cleared: true,
        extracted_skills: ['Redis Caching', 'Apache Kafka', 'Distributed Locking', 'P99 SLA'],
        recommendation: 'AUTO_SCHEDULE_INTERVIEW',
      },
    },
    {
      id: 'step-3',
      service: 'api://email-dispatcher',
      action: 'dispatch_schedule_window',
      status: 'COMPLETED',
      duration: '85ms',
      request: {
        to_email: 'elena.rostova@techmail.io',
        completion_deadline_hours: 48,
        interview_url: 'https://intra.ai/candidate/interview/INT-101',
      },
      response: {
        message_id: 'msg_99482_delivered',
        delivery_status: 'QUEUED',
        expires_at: 'Tomorrow 5:00 PM',
      },
    },
    {
      id: 'step-4',
      service: 'api://voice-ai-orchestrator',
      action: 'initiate_voice_session',
      status: 'COMPLETED',
      duration: '64ms',
      request: {
        interview_id: 'INT-101',
        personas: ['alex_technical', 'jordan_product'],
        agora_channel: 'echosphere-INT-101',
      },
      response: {
        agora_agent_status: 'READY',
        rtc_token_generated: true,
        anti_cheat_monitoring: 'ACTIVE',
      },
    },
  ];

  const triggerLivePipelineSimulation = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setLogs(['[Webhook Trigger] Event: candidate_form_submitted received from LinkedIn webhook']);

    setTimeout(() => {
      setCurrentStepIndex(1);
      setLogs((prev) => [
        ...prev,
        '-> calling api://talent-gateway/ingest_application_webhook...',
        '<- 200 OK: candidate_id: cand_98412 verified and stored',
      ]);
    }, 600);

    setTimeout(() => {
      setCurrentStepIndex(2);
      setLogs((prev) => [
        ...prev,
        '-> calling api://ats-intelligence/parse_and_match_rubric...',
        '<- 200 OK: 94% match score calculated against Senior Distributed Systems Engineer rubric',
      ]);
    }, 1300);

    setTimeout(() => {
      setCurrentStepIndex(3);
      setLogs((prev) => [
        ...prev,
        '-> calling api://email-dispatcher/dispatch_schedule_window...',
        '<- 200 OK: Interview invitation email sent with 48h deadline window to elena.rostova@techmail.io',
        '-> calling api://voice-ai-orchestrator/initiate_voice_session...',
        '<- 200 OK: Agora RTC channel prepared. Candidate ready to enter room.',
        'Workflow completed successfully across all automated stages.',
      ]);
      setIsRunning(false);
    }, 2100);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sora flex flex-col justify-between">
      <GreenhouseNavbar variant="light" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Interactive Automated Pipeline Simulation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                Automated Screening Pipeline
              </h1>
              <p className="text-sm md:text-base text-slate-500 max-w-3xl mt-2 leading-relaxed">
                Experience how Intra integrates external talent channels (LinkedIn, Internshala, Glassdoor)
                with automated ATS resume parsing, interview scheduling windows, and autonomous Voice AI
                interviews in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={triggerLivePipelineSimulation}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-full bg-forest-900 hover:bg-forest-800 text-white px-6 py-3 text-xs font-semibold shadow-sm transition-all shrink-0 self-start md:self-auto disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4 text-emerald-400" />
              <span>{isRunning ? 'Executing Automated Chain...' : 'Trigger Application Event'}</span>
            </button>
          </div>
        </div>

        {/* Visual Architecture Pipeline */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            End-to-End Orchestrated Pipeline:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                currentStepIndex >= 0
                  ? 'border-emerald-500/80 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-400">01. INTAKE</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  LinkedIn &bull; Internshala
                </span>
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-sm">
                Candidate Application
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ingests candidate name, email, phone, and resume text through automated webhook endpoints.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                currentStepIndex >= 1
                  ? 'border-emerald-500/80 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-400">02. ATS ENGINE</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  94% Match
                </span>
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-sm">
                Role Criteria Parsing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts required technical competencies, validates prerequisites, and qualifies candidate.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                currentStepIndex >= 2
                  ? 'border-emerald-500/80 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-400">03. DISPATCH</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  48h Window
                </span>
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-sm">
                Automated Schedule Email
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sends personalized invitation email with a time-limited interview completion window.
              </p>
            </div>

            {/* Step 4 */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                currentStepIndex >= 3
                  ? 'border-emerald-500/80 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-400">04. VOICE AI</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Agora RTC
                </span>
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-sm">
                Voice Interview & Scorecard
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Alex & Jordan conduct real-time audio evaluation and sync scorecard into recruiter dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Live Terminal Output & API Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 cols: API Service Payloads */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Integration Event Trace
            </div>

            <div className="space-y-4">
              {pipelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-700 font-semibold">{evt.service}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-800 font-semibold">{evt.action}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{evt.duration}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-slate-400 font-sans font-semibold text-[10px]">
                        PARAMS
                      </div>
                      <pre className="text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(evt.request, null, 2)}
                      </pre>
                    </div>

                    <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 space-y-1">
                      <div className="text-emerald-800 font-sans font-semibold text-[10px]">
                        RESULT
                      </div>
                      <pre className="text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(evt.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 cols: Live Server Logs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Gateway Logs
            </div>

            <div
              className="rounded-2xl border border-forest-800 p-5 text-emerald-400 font-mono text-xs space-y-2 min-h-[380px] shadow-lg"
              style={{ backgroundColor: '#0a1c17' }}
            >
              <div className="flex items-center justify-between border-b border-forest-800 pb-2 text-[10px] text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>pipeline-stdout</span>
                </span>
                <span>Active</span>
              </div>

              <div className="space-y-1.5 pt-2">
                {logs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-slate-500 mr-2">[{i + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isRunning && (
                  <div className="flex items-center gap-2 text-emerald-300 animate-pulse pt-2">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing next pipeline step...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-900">Want to test candidate room directly?</div>
              <p>
                You can launch the real-time Agora voice interview session immediately with multi-persona handoff.
              </p>
              <Link
                href="/candidate/interview/INT-101"
                className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline pt-1"
              >
                <span>Open Candidate Voice Room</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Intra AI Technologies. Automated Screening Pipeline Suite.
      </footer>
    </div>
  );
}
