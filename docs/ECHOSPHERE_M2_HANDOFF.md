# EchoSphere — Member 2 (Node & Frontend) Handoff

- **Role:** Member 2 — Product, Realtime & Agora Integration
- **Platform:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Agora RTC & RTM
- **Status:** **DEMO READY & VERIFIED**
- **Date:** September 3, 2026
- **Test Suite:** 12/12 M2 Integration Tests Passing (`pnpm run test:m2`)

---

## 1. Executive Summary

Member 2 owns the complete user experience and realtime execution layer for **EchoSphere** / **Intra-AI**. This includes:
1. **Interactive Recruiter Experience:** Candidate ingestion, CV + JD configuration, active pipeline filtering, and evidence dossier review.
2. **Candidate Voice Interview Room:** Full-duplex voice room featuring dual-waveform audio visualization, client-side Web Speech recognition, live captions, and automated persona handoff.
3. **Agora Conversational AI Integration:** Agora RTC channel management, token generation, and Custom LLM adapter bridging Agora's cloud agent to EchoSphere's M1 intelligence engine.
4. **Resilient Local Development:** Native macOS iCloud Drive avoidance (`node_modules.nosync`) ensuring instant module loading and stable execution.

---

## 2. Architecture & Runtime Services

```
┌─────────────────────────────────────────────────────────────┐
│ Candidate Browser (http://localhost:3000)                  │
│  • VoiceInterviewRoom.tsx                                   │
│  • Web Speech API (Client STT)                              │
│  • DualAudioWaveform (Real-time RMS Audio)                  │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
               │ Agora WebRTC / Microphone    │ TTS Audio Stream
               ▼                              │
┌──────────────────────────────┐              │
│ Agora Cloud Conversational AI│              │
│  • Deepgram Nova-3 ASR       │              │
│  • MiniMax Speech-2.6 TTS    │              │
└──────────────┬───────────────┘              │
               │                              │
               │ HTTP POST /api/custom-llm    │
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│ Next.js Backend (:3000)                                     │
│  • /api/custom-llm ──► Calls M1 Intelligence (:4005)       │
│  • /api/interviews/[id] (Turn Recording & Session Store)    │
│  • /api/invite-agent (Spawns Agora Cloud Agent)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Enhancements Delivered in M2

### A. Candidate Speech Recognition & Captions
- **Web Speech API Integration:** Integrated browser-native `webkitSpeechRecognition` to stream real-time interim candidate speech directly into the UI with an active speaking indicator.
- **Smart Silence Debounce:** Pausing speech for 1.8 seconds automatically finalizes and dispatches the candidate's turn to `/api/custom-llm` and records it to `/api/interviews/[id]`.
- **Offline / Mock Audio Fallback:** When running without cloud Agora agents, `window.speechSynthesis` natively voices the interviewer's questions so the candidate experience remains fully audible and end-to-end testable.

### B. Dual Waveform Audio Synchronizer
- Embedded `DualAudioWaveform` visualizing both candidate and AI audio levels in real-time.
- Displays live captions below the waveforms matching the current speaker turn.

### C. Persona Transitions & Prompt Directives
- Smooth, continuous transition from **Alex (Technical Interviewer)** to **Jordan (Product Lead)** within the same session.
- Displays dynamic contextual badge updates: `LISTENING`, `THINKING`, `SPEAKING`, and `HANDOFF`.

### D. macOS iCloud Drive `.nosync` Resolution
- Symlinked `node_modules -> node_modules.nosync`.
- Prevents macOS `cloudd` and `bird` from locking repository files and generating sync-conflict `.pnpm 2` duplicates.
- Bootstraps the development server in < 2 seconds.

---

## 4. Tunneling & Webhook Guide

To test the **live Agora cloud agent**:
1. Start an `ngrok` tunnel for port 3000:
   ```bash
   ngrok http 3000
   ```
2. Update `NEXT_PUBLIC_APP_URL` in `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://<your-ngrok-subdomain>.ngrok-free.app
   ```
3. Agora's cloud agent will now post candidate speech turns directly to your local `/api/custom-llm` adapter.

*(Note: Tunneling is **not** required for local UI evaluation, recruiter portal review, or client-side speech testing.)*

---

## 5. Verification Commands

| Command | Description | Status |
| :--- | :--- | :---: |
| `pnpm dev` | Starts Next.js frontend dev server on `:3000` | ✅ Verified (`200 OK`) |
| `pnpm run test:m2` | Runs all 12 Member 2 integration test suites | ✅ 12/12 Passed |
| `curl -I http://localhost:3000/` | Health check for landing page | ✅ `200 OK` |
| `curl -I http://localhost:3000/recruiter` | Health check for recruiter portal | ✅ `200 OK` |
