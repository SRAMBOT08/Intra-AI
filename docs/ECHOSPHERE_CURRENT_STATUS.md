# EchoSphere — Executive Status & Quick Handoff Guide

**Date:** September 3, 2026  
**Version:** `0.3.1-m2-realtime-complete`  
**Git Branch:** `vishnu` ➔ `main`  
**Maturity Level:** **Demo-Ready MVP** (Next.js 15 dev server running, 12/12 M2 integration tests verified)

---

## 1. Executive Summary

EchoSphere is an adaptive AI voice interview platform powered by **Agora Conversational AI**, **LangGraph Meta-Orchestrator**, **M1 Intelligence Engine**, and a **Two-Layer Knowledge Graph Context Architecture**.

All automated tests across Member 1 and Member 2 (Python tests + 12 TypeScript M2 integration tests) are **100% GREEN**. The architecture supports full-duplex voice interviews, Web Speech real-time candidate captions, dual-waveform audio levels, dynamic persona handoffs (**Alex** Technical Interviewer $\to$ **Jordan** Product Lead), and cross-round knowledge continuity.

---

## 2. Component Health Matrix

| Component | Port / Path | Health | Primary Verification |
| :--- | :--- | :---: | :--- |
| **Member 1 Intelligence** | `:4005` | `GREEN` | 74 unit tests; extracts evidence, detects vagueness & contradictions. |
| **Meta-Orchestrator** | `:4004` | `GREEN` | Deterministic LangGraph StateGraph emitting canonical `NextAction`. |
| **Knowledge Graph** | `src/knowledge_graph/` | `GREEN` | 20 unit tests; Neo4j schema + in-memory fallback with strict provenance. |
| **Custom LLM Adapter** | `/api/custom-llm` | `GREEN` | 12 adaptive tests; preserves session ID, history, and prevents question loops. |
| **Frontend UI & Visualizer** | `:3000` | `GREEN` | Next.js 15 App Router, Observability Drawer, Greenhouse aesthetic recruiter portal. |
| **Agora Realtime WebRTC & Voice** | `components/` | `GREEN` | Web Speech API real-time captions, DualAudioWaveform, live turn persistence. |

---

## 3. Two-Layer Context Architecture

```
Candidate CV / Interview Answers
              │
              ▼
┌──────────────────────────────────────────────┐
│  LAYER 2: PERSISTENT CANDIDATE KNOWLEDGE     │  • Survives across interview rounds
│  (Neo4j / In-Memory Knowledge Graph)         │  • Stores CV facts, projects, technologies, evidence
└──────────────────────┬───────────────────────┘
                       │ Relevant Context Query
                       ▼
┌──────────────────────────────────────────────┐
│  LAYER 1: SHORT-TERM INTERVIEW AI CONTEXT    │  • Scoped to current interview round
│  (Authoritative LangGraph State)             │  • Input to Meta-Orchestrator decision policies
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  LANGGRAPH META-ORCHESTRATOR (:4004)         │  • Decides: ASK_QUESTION | SWITCH_AGENT | COMPLETE
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  CUSTOM LLM ADAPTER (/api/custom-llm)        │  • Grounded in verified Knowledge Graph facts
└──────────────────────────────────────────────┘
```

---

## 4. How to Run Locally

```bash
# 1. Start ngrok tunnel for port 3000
ngrok http 3000

# 2. Start Member 1 Intelligence & Orchestrator Services (:4005 & :4004)
source .venv/bin/activate
python -m src.api.app --service all

# 3. Start Next.js Frontend (:3000)
pnpm dev
```

---

## 5. Verification Commands

```bash
# Run all 94 Python Backend Tests (0.26s)
.venv/bin/pytest -v tests/

# Run Complex Edge-Case Stress Suite
pnpm tsx scripts/test-complex-edge-cases.ts

# Run Adaptive Conversation Suite
pnpm tsx scripts/test-adaptive-conversation.ts

# Run Canonical Acceptance Demo Scenario
pnpm tsx scripts/test-canonical-demo.ts
```

---

## 6. Immediate Next Actions for Developer

1. **Perform Live Spoken Interview:** Open `http://localhost:3000/interviews/new`, start an interview, and speak into the microphone to verify Deepgram STT $\to$ MiniMax TTS voice path.
2. **Review Detailed Handoff Document:** See [`docs/ECHOSPHERE_VERSION_HANDOFF.md`](file:///Users/sriram/Downloads/echosphere-main/docs/ECHOSPHERE_VERSION_HANDOFF.md) for full architecture details, schemas, and invariants.
