# EchoSphere V1 — Complete Implementation Plan

## 1. Objective

Complete EchoSphere as a fully integrated, demo-ready adaptive voice interview platform.

The complete lifecycle must work as:

```text
CV + JD
→ Candidate Knowledge
→ Interview Initialization
→ Real-Time Voice Interview
→ M1 Intelligence
→ LangGraph Adaptation
→ Agent Handoff
→ Knowledge Graph Update
→ Cross-Round Memory
→ Assessment
→ Recruiter Dashboard
→ PDF Export
```

The implementation must connect the existing AI components rather than rebuild them.

---

## 2. Core Implementation Principles

### 2.1 Zero Rebuild Policy

The following existing components must be preserved:

- M1 Interview Intelligence
- AnswerAnalysis
- Evidence extraction
- Competency evaluation
- Vagueness detection
- Contradiction detection
- InterviewAIContext
- LangGraph Meta-Orchestrator
- NextAction contract
- Difficulty policy
- Agent Registry
- Alex → Jordan handoff logic
- Knowledge Graph schema
- Persistent Candidate Context architecture
- Agora RTC integration
- Custom LLM Adapter
- Existing assessment logic

Only modify these components when required to integrate them into the complete lifecycle or fix verified defects.
Do not replace working architecture with a new framework.

### 2.2 Inspect Before Modify Rule

For every existing component:

1. **Inspect** the current implementation and its contracts first.
2. **Identify** what is already working and tested.
3. **Identify** the exact missing behavior or defect.
4. **Modify** only what is required to fulfill the missing behavior.
5. **Preserve** existing contracts, interfaces, and data models.
6. **Run** relevant test suites immediately to prevent regressions.
7. **Do not replace** working architecture with a new implementation without a verified technical defect.

### 2.3 Definition of Phase Completion

A phase is considered complete only when its complete verification chain is verified:
$$\text{INPUT} \longrightarrow \text{PROCESSING} \longrightarrow \text{OUTPUT} \longrightarrow \text{PERSISTENCE/STATE UPDATE} \longrightarrow \text{CONSUMER} \longrightarrow \text{AUTOMATED TEST} \longrightarrow \text{MANUAL TEST (where UI/voice involved)}$$

---

## 3. Two-Layer Context Architecture

This separation must remain intact.

### Layer 1 — InterviewAIContext
Short-term, current-round interview state.
- **Used by:** M1 Intelligence, LangGraph Meta-Orchestrator, and current agent decision-making.
- **Fields:** `interview_id`, `candidate_id`, `current_round_id`, `current_agent_id`, `difficulty`, `evaluated_competencies`, `accumulated_evidence`, `open_questions`, `missing_competencies`, `detected_contradictions`.
- **Authority:** Authoritative state for the current interview decision loop; resets between fresh rounds.

### Layer 2 — PersistentCandidateContext
Long-term candidate knowledge backed by the Knowledge Graph.
- **Contains:** CV facts, education, experience, projects, skills, technologies, concepts, previous answers, evidence, competency assessments, strengths, weaknesses, contradictions, unresolved areas, previous interview rounds.
- **Authority:** Survives across interview rounds and restarts.

$$\text{PersistentCandidateContext} \xrightarrow{\text{relevant context retrieval}} \text{InterviewAIContext} \xrightarrow{} \text{M1 Intelligence} \xrightarrow{} \text{LangGraph} \xrightarrow{} \text{NextAction}$$

The Knowledge Graph itself must never directly decide the next interview action.

---

## 4. Phase 1 — CV Intelligence Pipeline & Entity Normalization

### Goal
Convert an uploaded CV into validated, structured candidate knowledge.

### Implementation Guidelines
1. **Inspect Existing Parser First:** Inspect the existing CV upload and text-extraction path before making changes.
2. **Determine Format Support:** Determine what PDF/DOCX/plain-text support already exists.
3. **Reuse Existing Extraction:** Reuse existing `CVKnowledgeExtractor` functionality where possible. Only add missing PDF/DOCX/text extraction capability.
4. **Do Not Rebuild:** Do not replace `CVKnowledgeExtractor` unless a verified defect requires it.

### Processing Pipeline
```text
CV (PDF / DOCX / Plain Text)
 ↓
Document Text Extraction
 ↓
CVKnowledgeExtractor
 ↓
Structured Candidate Facts (Name, Roles, Experience, Projects, Skills, Tech, Concepts)
 ↓
Entity Normalization (e.g., Postgres/Postgres DB -> PostgreSQL; ReactJS -> React; K8s -> Kubernetes)
 ↓
Provenance Validation
 ↓
GraphUpdate
 ↓
Knowledge Graph
```

### Provenance & Validation
- Every candidate fact must retain source statement traceability (`Candidate -> Project -> USES -> Redis -> Source: CV statement`).
- Reject hallucinated technologies, unsupported projects, and duplicate entities. Missing information must remain missing rather than being inferred.

---

## 5. Phase 2 — Job Description Intelligence & Competency Mapping

### Goal
Convert the Job Description into a structured interview competency model.

### Processing Pipeline
```text
Job Description (Text / File)
 ↓
JDKnowledgeExtractor
 ↓
Requirements Extraction (Skills, Tech, Responsibilities, Seniority)
 ↓
Competency Mapping:
  - Technical (system_design, scalability, technical_depth) -> Alex (Technical Interviewer)
  - Product (customer_impact, business_metrics, user_adoption) -> Jordan (Product Lead)
 ↓
Interview Plan Generation & Knowledge Graph Storage
```

---

## 6. Phase 3 — Recruiter Interview Setup & Session Initialization

### Goal
Allow the recruiter to configure a complete interview before the candidate joins.

### Processing Pipeline
```text
Recruiter submits Setup (Candidate Name, Email, CV text/file, Job Title, JD text/file, Competencies)
 ↓
Create Candidate Record
 ↓
Run CV Extraction & Populate Candidate Knowledge Graph
 ↓
Run JD Extraction & Create Competency Requirements in Knowledge Graph
 ↓
Generate Interview Plan (Competency Sequencing & Agent Assignments)
 ↓
Initialize InterviewAIContext (Missing Competencies, Default Agent: Alex, Difficulty: Medium)
 ↓
Create Interview Session in Session Store
```

---

## 7. Phase 4 — Interview Initialization & CV/JD-Grounded Opening Question

### Goal
Start the interview with grounded, non-generic candidate context without inventing ungrounded facts.

### Processing & Grounding Flow
```text
Candidate CV Knowledge (Verified Facts from Knowledge Graph)
+
JD Competency Requirements
+
Current Agent Profile (Alex - Technical Interviewer)
 ↓
Relevant Context Retrieval
 ↓
InterviewAIContext
 ↓
Opening Question Synthesis
```

### Grounding Rule
- The opening question must be synthesized strictly from **verified candidate information**.
- **Example:** If the CV verified `Payment API` utilizing `PostgreSQL` and `Redis`, and JD requires scalable backend architecture:
  > *"Can you walk me through the architecture of the payment API you built and the main scalability challenges you encountered?"*
- If the CV does not contain a specific project, the system must not fabricate one.

---

## 8. Phase 5 — Agora Real-Time Voice Integration Validation

### Goal
Validate the actual production runtime path from real candidate speech to agent speech. The Agora RTC and Conversational AI integration already exists and must be preserved.

### Runtime Architecture
```text
Candidate Microphone
        ↓
Agora RTC Web SDK (agora-rtc-sdk-ng)
        ↓
Agora RTC Channel ("echosphere-{interview_id}")
        ↓
Agora Conversational AI Cloud Agent
        ↓
Deepgram STT
        ↓
Custom LLM Adapter (/api/custom-llm?interview_id={id})
        ↓
M1 Intelligence (:4005)
        ↓
LangGraph Meta-Orchestrator (:4004)
        ↓
NextAction
        ↓
Response Generation
        ↓
MiniMax TTS
        ↓
Agora RTC Remote Audio Track
        ↓
Candidate Hears Response
```

### Verification Tasks
- Verify microphone permissions and local audio publishing.
- Verify Agora agent joins and Deepgram STT transcribes spoken voice.
- Ensure `?interview_id=<INTERVIEW_ID>` is preserved across all turns (never falling back to an unparameterized default session).
- Verify Custom LLM adapter parses `body.messages` history and streams response chunks via SSE.
- Verify MiniMax TTS converts response to audio and plays back in browser via `remoteAudioTrack.play()`.

---

## 9. Phase 6 — Adaptive Interview Loop & State / Knowledge Graph Updates

### Goal
Every candidate answer must influence what happens next, updating short-term and persistent state layers appropriately.

### State & Knowledge Graph Update Flow
```text
Candidate Spoken Answer
        ↓
M1 AnswerAnalysis (:4005)
        ↓
Evidence & Competency Findings
        ↓
InterviewAIContext Update (Short-term turn state)
        ↓
Validated GraphUpdate (Only when persistent candidate knowledge changes)
        ↓
PersistentCandidateContext / Knowledge Graph Update
        ↓
LangGraph Meta-Orchestrator (:4004)
        ↓
NextAction (ASK_QUESTION | SWITCH_AGENT | COMPLETE)
        ↓
Custom LLM Adapter Response Generation
        ↓
Agora TTS Spoken Response to Candidate
```

### State Layer Distinction
- **`InterviewAIContext`:** Authoritative short-term state for the current decision loop (accumulated evidence, missing competencies, current difficulty).
- **`PersistentCandidateContext` (Knowledge Graph):** Stores durable candidate knowledge across rounds.
- **Rule:** Not every transient utterance becomes a graph node. Only grounded, meaningful candidate knowledge is persisted. Vague, off-topic, or unsupported answers must **never** create strong persistent candidate facts.

---

## 10. Phase 7 — Dynamic Agent Handoff (Alex $\to$ Jordan)

### Goal
Switch interviewer personas without restarting the interview or creating a new Agora session.

### Handoff Workflow
```text
Alex (Technical Interviewer)
  - Evaluates system_design & scalability
  - Technical coverage complete
        ↓
LangGraph Meta-Orchestrator emits SWITCH_AGENT
  - target_agent_id: "product"
  - competency_id: "customer_impact"
  - handoff_transition_text: "Thank you for walking through the technical architecture..."
        ↓
Single Agora Session Continues
        ↓
Jordan (Product Lead) Takes Over
  - Receives relevant CV context + prior technical decisions (Redis, PostgreSQL, horizontal scaling)
  - Speaks: "Hello, I'm Jordan, Product Lead! Earlier, you detailed using Redis and PostgreSQL. How did those scaling decisions directly translate to user experience and customer metrics?"
```

---

## 11. Phase 8 — Cross-Round Interview Memory

### Goal
Preserve candidate knowledge across multiple interview rounds.

### Architecture
- **Round 1 (Technical):** Completed $\to$ Knowledge Graph persists all verified facts, answers, and competency ratings.
- **Round 2 (Product / Behavioral):** Starts with a fresh `InterviewAIContext` (round-scoped state) while retaining full access to `PersistentCandidateContext` (long-term graph).
- Jordan references Round 1 evidence and prior contradictions remain visible.

---

## 12. Phase 9 — Assessment & Hiring Intelligence Engine

### Goal
Generate an evidence-backed, explainable candidate assessment report.

### Inputs & Output
```text
JD Requirements + Spoken Answers + Grounded Evidence + Competency Findings + Cross-Round History
        ↓
Assessment Engine (lib/session-store.ts)
        ↓
AssessmentReport
  ├── Overall Recommendation (STRONG_HIRE >= 80% | HIRE >= 60% | POTENTIAL_FIT | NO_HIRE < 40%)
  ├── Competency Scores & Ratings (system_design, scalability, customer_impact)
  ├── Supporting Evidence Statements (linked to source answers)
  ├── Identified Strengths & Weaknesses
  ├── Unresolved Concerns & Contradictions
  └── Full Interview Transcript
```

---

## 13. Phase 10 — Recruiter Dashboard & Interactive Knowledge Graph

### Goal
Provide recruiters with a comprehensive candidate inspection dashboard.

### Features
- Candidate summary, CV highlights, and overall recommendation badge.
- Interactive read-only Knowledge Graph viewer (`components/KnowledgeGraphVisualizer.tsx`) displaying candidate nodes, projects, technologies, concepts, and evidence.
- Full turn-by-turn conversation transcript with speaker badges.

---

## 14. Phase 11 — PDF Assessment Report Export

### Goal
Generate a downloadable, printable assessment report.

### Implementation
- Add `GET /api/interviews/[id]/report/pdf` or client-side print layout in `components/AssessmentReportView.tsx`.
- Generates branded assessment report containing candidate info, scorecard, evidence, strengths, weaknesses, and recommendation.

---

## 15. Testing & Verification Matrix

### 1. Python Test Suite (94 Tests):
```bash
.venv/bin/pytest -v tests/
```
Verifies domain models, M1 contracts, intelligence engine, vagueness/contradiction detectors, policy engines, LangGraph, and Knowledge Graph (20 unit tests).

### 2. Primary Vertical Pipeline Acceptance Test (`scripts/test-vertical-pipeline.ts`):
```bash
pnpm tsx scripts/test-vertical-pipeline.ts
```
Executes complete vertical slice: Candidate creation $\to$ CV ingestion $\to$ JD ingestion $\to$ Interview initialization $\to$ Alex Turn 1 $\to$ KG update $\to$ Alex Turn 2 $\to$ SWITCH_AGENT $\to$ Jordan handoff with grounded bridge $\to$ Interview completion $\to$ Assessment report generation $\to$ PDF export.

### 3. Complex Edge-Case Stress Suite (`scripts/test-complex-edge-cases.ts`):
```bash
pnpm tsx scripts/test-complex-edge-cases.ts
```
Tests lengthy questions, 1000+ char answers, candidate pushbacks/clarification requests, messy audio with fillers/barking, subtle contradictions, and multi-region distributed systems.

### 4. Adaptive Conversation Suite (`scripts/test-adaptive-conversation.ts`):
```bash
pnpm tsx scripts/test-adaptive-conversation.ts
```
Tests opening greeting, strong answers, vague probes, off-topic redirections, and multi-turn state preservation.

### 5. TypeScript Compilation:
```bash
pnpm tsc --noEmit
```
Must produce 0 errors.

### 6. Live Browser Microphone & Voice Path (Manual Test):
- Open `http://localhost:3000/interviews/new`, start interview, speak into microphone, and verify live Deepgram STT $\to$ Custom LLM Adapter $\to$ MiniMax TTS $\to$ candidate audio.
