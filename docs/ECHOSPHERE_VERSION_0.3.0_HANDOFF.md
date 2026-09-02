# EchoSphere v0.3.0 — V1 Vertical Complete

- **Version:** `0.3.0-v1-vertical-complete`
- **Status:** **DEMO READY — LIVE VOICE PENDING**
- **Date:** September 2, 2026
- **Current Git Branch:** `main`
- **Latest Commit Hash:** `3a8d1ea0010839e99a80b1e4eb41f237ef34e4fa`
- **Working Tree Status:** Clean (0 uncommitted / 0 untracked changes)

---

## 1. Product Summary

EchoSphere is an adaptive, multi-agent AI voice interview platform designed for technical and product evaluation.

### Complete Lifecycle:
1. **Recruiter Configuration:** The recruiter provides a candidate CV and Job Description (JD).
2. **Knowledge Extraction & Grounding:** Candidate projects, technologies, and concepts are extracted into a persistent Knowledge Graph with strict provenance.
3. **Competency Modeling:** Job requirements are mapped to target competencies and assigned to specialized AI interviewer personas:
   - **Alex (Technical Interviewer):** System Design, Scalability, Technical Depth.
   - **Jordan (Product Lead):** Customer Impact, Business Conversion, User Trust.
4. **Real-Time Voice Interview:** Candidate joins a full-duplex Agora WebRTC voice room.
5. **Real-Time AI Intelligence:** Every spoken answer is transcribed via Deepgram STT and evaluated by Member 1 Intelligence for factual evidence, depth, vagueness, and contradictions.
6. **Adaptive Orchestration:** The LangGraph Meta-Orchestrator decides whether to probe deeper, adapt difficulty, transition personas (`SWITCH_AGENT`), or conclude (`COMPLETE`).
7. **Single-Session Persona Handoff:** Alex completes technical coverage and transitions smoothly to Jordan within the same Agora RTC session.
8. **Cross-Round Context:** Jordan probes business and customer metrics directly grounded in the technical architectures discussed with Alex.
9. **Evidence-Backed Scorecard & PDF Export:** Generates an explainable assessment report with competency ratings, verified evidence quotes, and downloadable PDF report.

---

## 2. Architecture & Data Flow

```
                              ┌──────────────────────────────┐
                              │  Recruiter Setup (CV + JD)   │
                              └──────────────┬───────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌─────────────────────────┐                 ┌─────────────────────────┐
          │   CVKnowledgeExtractor  │                 │   JDKnowledgeExtractor  │
          └────────────┬────────────┘                 └────────────┬────────────┘
                       │                                           │
                       ▼                                           ▼
          ┌─────────────────────────┐                 ┌─────────────────────────┐
          │ Persistent Knowledge    │                 │ Competency Model &      │
          │ Graph (Candidate Facts) │                 │ Interview Plan          │
          └────────────┬────────────┘                 └────────────┬────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             ▼
                              ┌──────────────────────────────┐
                              │  Interview Session Creation  │
                              │  & Context Initialization    │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │    Agora WebRTC Channel      │
                              │   Candidate Microphone       │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Agora Conversational AI      │
                              │ Deepgram Speech-to-Text      │
                              └──────────────┬───────────────┘
                                             │
                                             ▼ POST /api/custom-llm?interview_id={id}
                              ┌──────────────────────────────┐
                              │  Custom LLM Adapter          │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ M1 AnswerAnalysis (:4005)    │
                              │ Evidence + Findings          │
                              └──────────────┬───────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌─────────────────────────┐                 ┌─────────────────────────┐
          │ Short-Term Update:      │                 │ Durable Update:         │
          │ InterviewAIContext      │                 │ Knowledge Graph         │
          └────────────┬────────────┘                 └────────────┬────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             ▼
                              ┌──────────────────────────────┐
                              │ LangGraph Meta-Orchestrator  │
                              │ Port 4004 (NextAction)       │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Custom LLM Dialogue Stream   │
                              │ Grounded in Verified Facts   │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Agora MiniMax TTS            │
                              │ Remote WebRTC Audio Track    │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ Candidate Hears Response     │
                              └──────────────────────────────┘
```

---

## 3. Two-Layer Context Architecture

> [!IMPORTANT]
> The two-layer context separation is a core invariant of EchoSphere and must be strictly maintained.

```
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 2: PERSISTENT CANDIDATE KNOWLEDGE GRAPH              │
│  - Long-term storage (survives across interview rounds and restarts)   │
│  - Backed by Neo4j schema / indexed in-memory repository               │
│  - Stores verified CV facts, projects, technologies, and evidence      │
│  - Queried for targeted relevant knowledge and cross-round bridges     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         Relevant Context Query
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                LAYER 1: SHORT-TERM INTERVIEW AI CONTEXT                │
│  - Short-term turn state (scoped strictly to current interview round)  │
│  - Authoritative input to LangGraph Meta-Orchestrator                  │
│  - Tracks missing competencies, accumulated evidence, difficulty,      │
│    and active contradictions                                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LANGGRAPH META-ORCHESTRATOR (:4004)                  │
│                     Produces canonical NextAction                      │
└────────────────────────────────────────────────────────────────────────┘
```

**Key Invariant:** The Knowledge Graph provides **knowledge** and evidence provenance; the LangGraph Meta-Orchestrator makes **decisions** (`ASK_QUESTION`, `SWITCH_AGENT`, `COMPLETE`).

---

## 4. Implemented Features & Verification Status

### CV & Candidate Intelligence Pipeline:
- [x] **CV Ingestion & Parsing:** Plain text, pasted CV, and rich text extraction support.
- [x] **Entity Normalization:** Deterministic mapping for equivalent technologies (e.g., `postgres` / `postgres db` $\to$ `PostgreSQL`, `k8s` $\to$ `Kubernetes`, `react.js` $\to$ `React`, `cockroach` $\to$ `CockroachDB`, `debezium` $\to$ `Debezium`).
- [x] **Provenance Tracking:** Every candidate node retains source citation (`evidence_ids=["cv:{candidate_id}"]`).
- [x] **Knowledge Graph Population:** Automatically updates graph nodes on interview creation.

### Job Description & Competency Model:
- [x] **JD Ingestion:** Extracts requirements, skills, and responsibilities.
- [x] **Competency Assignment:** Technical competencies mapped to Alex; product competencies mapped to Jordan.
- [x] **Interview Plan:** Generates sequencing and competency coverage goals.

### Interview Initialization & Adaptive Loop:
- [x] **Grounded Opening Question:** Synthesized from verified CV projects and technologies without hallucination.
- [x] **Answer Analysis:** Factual evidence extraction with confidence scoring.
- [x] **Vagueness & Contradiction Detection:** Fluff triggers targeted probes; conflicting statements generate explicit `-[:CONTRADICTS]->` graph relationships.
- [x] **Difficulty Tier Adaptation:** Dynamically scales between `EASY`, `MEDIUM`, and `HARD`.

### Multi-Agent Persona Handoff:
- [x] **Single-Session Continuity:** Alex hands off to Jordan within the same Agora RTC channel.
- [x] **Spoken Handoff Transition:** Alex speaks closing technical remarks before Jordan introduces themselves.
- [x] **Cross-Round Grounding:** Jordan references verified technical decisions discussed with Alex in Round 1.

### Recruiter Experience & PDF Export:
- [x] **Candidate Configuration UI:** Intuitive setup page with sample architect CV loader (`app/recruiter/interviews/new/page.tsx`).
- [x] **Assessment Scorecard:** Turn-by-turn transcript, competency confidence bars, strengths, and weaknesses.
- [x] **Interactive Knowledge Graph:** Embedded visualizer in assessment view and observability drawer.
- [x] **Printable PDF Export:** Dedicated printable endpoint (`GET /api/interviews/[id]/report/pdf`) and print action.

---

## 5. Actual File Changes in Version 0.3.0

### Created:
1. [`app/api/interviews/[id]/report/pdf/route.ts`](file:///Users/sriram/Downloads/echosphere-main/app/api/interviews/[id]/report/pdf/route.ts): Printable HTML/PDF assessment report export route.
2. [`scripts/test-vertical-pipeline.ts`](file:///Users/sriram/Downloads/echosphere-main/scripts/test-vertical-pipeline.ts): Master acceptance test verifying all 10 steps of the vertical pipeline.
3. [`docs/ECHOSPHERE_VERSION_0.3.0_HANDOFF.md`](file:///Users/sriram/Downloads/echosphere-main/docs/ECHOSPHERE_VERSION_0.3.0_HANDOFF.md): This authoritative handoff document.

### Modified:
1. [`src/knowledge_graph/extraction/cv_extractor.py`](file:///Users/sriram/Downloads/echosphere-main/src/knowledge_graph/extraction/cv_extractor.py): Expanded entity normalization aliases for technologies and concepts.
2. [`app/recruiter/interviews/new/page.tsx`](file:///Users/sriram/Downloads/echosphere-main/app/recruiter/interviews/new/page.tsx): Added candidate profile inputs, CV text/upload box, and sample architect CV loader.
3. [`app/api/interviews/route.ts`](file:///Users/sriram/Downloads/echosphere-main/app/api/interviews/route.ts): Wired automatic background CV and JD Knowledge Graph ingestion upon session creation.
4. [`lib/session-store.ts`](file:///Users/sriram/Downloads/echosphere-main/lib/session-store.ts): Added candidate profile fields and backward-compatible competency breakdown mapping.
5. [`types/echosphere.ts`](file:///Users/sriram/Downloads/echosphere-main/types/echosphere.ts): Added optional `candidate_name`, `cv_text`, and `competency_breakdown` typing.
6. [`app/api/custom-llm/route.ts`](file:///Users/sriram/Downloads/echosphere-main/app/api/custom-llm/route.ts): Added CV-grounded opening greeting generation from Knowledge Graph facts.
7. [`components/AssessmentReportView.tsx`](file:///Users/sriram/Downloads/echosphere-main/components/AssessmentReportView.tsx): Embedded `KnowledgeGraphVisualizer` and added PDF export buttons.

---

## 6. Automated Test Results

All test suites were executed against live services and verified 100% GREEN:

| Test Suite | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **Python Backend Unit & Policy Suite** | `.venv/bin/pytest -v tests/` | **PASS** | 94/94 tests passed (0.26s) |
| **Full Vertical Pipeline Acceptance Test** | `pnpm tsx scripts/test-vertical-pipeline.ts` | **PASS** | 10/10 steps verified end-to-end |
| **Knowledge Graph Integration Suite** | `pnpm tsx scripts/test-knowledge-graph-integration.ts` | **PASS** | Schema, Idempotency, Provenance, Context |
| **Complex Edge-Case Stress Suite** | `pnpm tsx scripts/test-complex-edge-cases.ts` | **PASS** | 6/6 complex technical cases passed |
| **Adaptive Conversation Suite** | `pnpm tsx scripts/test-adaptive-conversation.ts` | **PASS** | 12/12 turns & fallbacks passed |
| **Member 2 Integration Suite** | `pnpm tsx scripts/test-m2-integration.ts` | **PASS** | 12/12 API communication tests passed |
| **Canonical Acceptance Demo** | `pnpm tsx scripts/test-canonical-demo.ts` | **PASS** | 6/6 steps verified |
| **TypeScript Static Compiler Check** | `pnpm tsc --noEmit` | **PASS** | 0 TypeScript errors |

---

## 7. Verified Vertical Pipeline Flow

The master acceptance test (`scripts/test-vertical-pipeline.ts`) executes and verifies:
1. Ingests candidate CV into Knowledge Graph.
2. Ingests JD into Knowledge Graph.
3. Initializes recruiter interview session and `InterviewAIContext`.
4. Alex synthesizes CV-grounded opening greeting.
5. Candidate provides deep technical answer $\to$ M1 extracts grounded evidence.
6. Knowledge Graph updates entities and relationships with provenance.
7. Candidate answers scalability question $\to$ Alex triggers `SWITCH_AGENT`.
8. Jordan takes over in the same Agora channel with spoken bridge text.
9. Jordan probes customer impact grounded in Round 1 technical facts.
10. Meta-Orchestrator concludes with `COMPLETE` $\to$ Assessment scorecard and printable PDF export generated.

---

## 8. Manual Browser Voice Verification Procedure

> [!IMPORTANT]
> While all automated API and SSE streaming tests are passing, **live physical microphone voice verification with Agora Conversational AI cloud is NOT YET MANUALLY COMPLETED**.

### Manual Test Procedure:
1. **Start Services:**
   ```bash
   # Terminal 1: ngrok tunnel
   ngrok http 3000

   # Terminal 2: Member 1 Backend (:4005 Intelligence + :4004 LangGraph)
   source .venv/bin/activate
   python -m src.api.app --service all

   # Terminal 3: Next.js Frontend (:3000)
   pnpm dev
   ```
2. **Open Browser:** Navigate to `http://localhost:3000/interviews/new`.
3. **Configure Interview:** Click **Load Sample Architect CV** and click **Create Interview & Generate Session**.
4. **Join Voice Room:** Click **Join Live Interview as Candidate** and grant microphone permissions.
5. **Verify Voice Path:**
   - [ ] Local microphone track publishes without console errors.
   - [ ] Agora cloud agent joins and speaks Alex's opening greeting via remote audio.
   - [ ] Speak a real answer $\to$ verify Deepgram STT transcribes spoken voice.
   - [ ] Verify Custom LLM adapter logs turn processing and M1 evaluation.
   - [ ] Alex speaks adaptive follow-up via MiniMax TTS.
   - [ ] Answer scalability question $\to$ verify spoken handoff to Jordan.
   - [ ] Verify Jordan speaks product question referencing PostgreSQL/Redis.
   - [ ] Complete interview $\to$ verify Recruiter Assessment Report and PDF export.

---

## 9. Known Limitations & Classification

| Item | Classification | Notes |
| :--- | :--- | :--- |
| **Live Browser Microphone Test** | `CURRENT LIMITATION` | Automated streaming verified; physical mic test pending. |
| **In-Memory Session Store** | `NOT AN ISSUE FOR DEMO` | Works seamlessly for single-server demo instances (`lib/session-store.ts`). |
| **Neo4j Offline Fallback** | `NOT AN ISSUE FOR DEMO` | Automatically uses in-memory graph repository if Neo4j is offline. |
| **Gemini Free Tier Rate Limits** | `OPTIONAL HARDENING` | Handled via multi-model fallback (`2.5-flash` $\to$ `2.0-flash` $\to$ `1.5-flash` $\to$ heuristics). |
| **Custom LLM Webhook HMAC** | `OPTIONAL HARDENING` | Webhook validates payloads; HMAC token verification can be added for production. |

---

## 10. Protected Architecture (Do Not Modify)

The following components and contracts represent stable integration boundaries and must **NOT** be rewritten:
- **Canonical Models:** `AnswerAnalysis`, `EvidenceItem`, `InterviewAIContext`, `NextAction`, `ActionType`.
- **LangGraph Meta-Orchestrator:** Deterministic StateGraph on port `4004`.
- **M1 Intelligence Engine:** Evaluation and evidence extraction on port `4005`.
- **Knowledge Graph Contracts:** Two-layer context separation and `GraphUpdate` provenance.
- **Agora Realtime Path:** WebRTC SDK transport in `VoiceInterviewRoom.tsx`.
- **Custom LLM Adapter URL:** Must preserve `?interview_id=${id}` parameterization.

---

## 11. Prioritized Next Developer Tasks

### P0 — Immediate Priority (Demo Blocker):
1. Execute the manual browser voice test using the runbook in §8.
2. Confirm two-way audio latency and barge-in behavior during live speech.

### P1 — Demo Polish:
1. Verify PDF print formatting across Chrome and Safari.
2. Add candidate history search to Recruiter Dashboard (`app/recruiter/interviews`).

### P2 — Production Hardening:
1. Replace in-memory session store with PostgreSQL/Prisma.
2. Add HMAC signature validation to `/api/custom-llm`.

---

## 12. Runbook & Startup Commands

```bash
# 1. Start ngrok tunnel for port 3000
ngrok http 3000

# 2. Start Member 1 Services (:4005 Intelligence + :4004 Meta-Orchestrator)
source .venv/bin/activate
python -m src.api.app --service all

# 3. Start Next.js Frontend (:3000)
pnpm dev

# 4. Run All Automated Verification Suites
.venv/bin/pytest -v tests/
pnpm tsx scripts/test-vertical-pipeline.ts
pnpm tsc --noEmit
```

---

## 13. Environment Variables (Names Only)

Required in `.env.local` (Never commit secrets):
- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`
- `ECHOSPHERE_LLM_MODEL`
- `M1_INTELLIGENCE_URL`
- `M1_ORCHESTRATOR_URL`
- `NEO4J_URI` (optional)
- `NEO4J_USERNAME` (optional)
- `NEO4J_PASSWORD` (optional)

---

## 14. Final Handoff Checklist

```text
[x] Repository inspected and audited
[x] Working tree checked (clean)
[x] Version 0.3.0 recorded
[x] CV pipeline verified
[x] JD pipeline verified
[x] Knowledge Graph verified
[x] M1 Intelligence verified
[x] LangGraph Orchestrator verified
[x] Adaptive conversation loop verified
[x] Alex -> Jordan persona handoff verified
[x] Cross-round context verified
[x] Assessment scorecard verified
[x] PDF report export verified
[x] All 8 automated test suites passed (100%)
[x] TypeScript check passed (0 errors)
[ ] Live Agora browser voice test pending
[x] Zero secrets committed to git
```
