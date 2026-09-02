# EchoSphere — Member 2 Internal Reference & Execution Guide
> **Note:** This document is strictly for Member 2's internal reference on branch `vishnu`. It contains architecture blueprints, integration contracts, Agora quickstart recipes, and execution checklists. **Do not merge or push this file to `main`.**

---

## 1. Role & Mission

* **Role:** Member 2 — Product, Frontend, Realtime Agora Conversational AI & Execution.
* **Core Rule:** Member 1 decides **WHAT** happens next (`NextAction`). Member 2 decides **HOW** to execute that action through Agora audio streams and Next.js UI.
* **Strict Constraint:** Never recreate or duplicate Member 1's decision logic, competency scoring, or gap prioritization in the frontend or adapter.

---

## 2. Member 1 Services & Canonical Contracts

### Ports & Endpoints
* **Interview Intelligence (`:4005`):**
  * Health: `GET http://localhost:4005/health`
  * Analyze: `POST http://localhost:4005/v1/interview-intelligence/analyze`
* **Meta-Orchestrator (`:4004`):**
  * Health: `GET http://localhost:4004/health`
  * Next Action: `POST http://localhost:4004/v1/meta-orchestrator/next-action`

### Canonical Action Types (Strictly Supported)
```text
ASK_QUESTION
SWITCH_AGENT
COMPLETE
```
*(No CLARIFY, FOLLOW_UP, CHANGE_DIFFICULTY, or custom action types. Clarifications are handled via ASK_QUESTION with prompt directives).*

### Authoritative `InterviewAIContext` Structure
```json
{
  "interview_id": "INT-101",
  "candidate_id": "CAND-505",
  "current_round_id": "ROUND-001",
  "current_agent_id": "technical",
  "difficulty": "MEDIUM",
  "evaluated_competencies": {
    "system_design": "STRONG",
    "scalability": "STRONG"
  },
  "accumulated_evidence": [],
  "open_questions": [],
  "missing_competencies": ["customer_impact"],
  "detected_contradictions": []
}
```

---

## 3. Persona Definitions

| Field | Persona 1: Technical | Persona 2: Product |
|---|---|---|
| **agent_id** | `technical` | `product` |
| **display_name** | Alex | Jordan |
| **role** | Technical Interviewer | Product Lead |
| **focal_competencies** | `system_design`, `scalability`, `technical_depth` | `customer_impact`, `product_judgment`, `business_implications` |
| **questioning_style** | Deep architectural probes, bottlenecks, scale trade-offs | Customer value, adoption, latency business impact, trade-offs |

---

## 4. Turn-by-Turn Execution Cycle

```text
1. Candidate speaks into Agora RTC microphone channel
2. Agora ASR (Deepgram) transcribes utterance
3. Adapter intercepts utterance & sends to M1 Intelligence:
   POST http://localhost:4005/v1/interview-intelligence/analyze
   Payload: { question, candidate_answer, target_competencies, interview_context, answer_id }
4. Receive AnswerAnalysis:
   { overall_performance, confidence, vague, contradiction_detected, evidence, competency_findings }
5. Update session InterviewAIContext:
   - accumulated_evidence.extend(analysis.evidence)
   - evaluated_competencies.update(competency_findings)
6. Adapter sends analysis + context to M1 Orchestrator:
   POST http://localhost:4004/v1/meta-orchestrator/next-action
   Payload: { interview_context, answer_analysis, required_competencies, is_final_round, current_competency }
7. Receive NextAction:
   { action, target_agent_id, competency_id, difficulty, prompt_directive, handoff_transition_text }
8. Execute NextAction:
   - If ASK_QUESTION: Keep current persona active. Synthesize follow-up probe.
   - If SWITCH_AGENT: Switch active persona (Alex -> Jordan). Prepend handoff_transition_text.
   - If COMPLETE: Synthesize polite conclusion. Conclude session.
9. Stream response tokens back to Agora TTS (MiniMax/ElevenLabs)
10. Candidate hears spoken voice in continuous session
```

---

## 5. Agora Conversational AI Setup ([agent-quickstart-nextjs](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs))

### Server Routes Required
* `app/api/generate-agora-token/route.ts` — Generates RTC and RTM tokens using Agora App ID and Certificate.
* `app/api/invite-agent/route.ts` — Starts the conversational agent in the RTC channel using `agora-agents` SDK.
* `app/api/stop-conversation/route.ts` — Tears down the agent when call concludes.
* `app/api/custom-llm/route.ts` — Custom LLM endpoint connecting Agora Conversational AI to M1 Intelligence & Orchestrator.

### Client Components Required
* `ConversationComponent.tsx` — Manages audio tracks, mic permissions, connection state, volume indicators.
* `MicrophoneSelector.tsx` — Device dropdown and mic testing.
* `ActivePersonaBadge.tsx` — Visual display of Alex vs Jordan (name, role, competency badge).
* `ObservabilityDrawer.tsx` — Realtime debug inspector for hackathon demo (confidence, M1 decisions).

---

## 6. Frontend Routes Structure

```text
/recruiter
  ├── /interviews/new          # Configure JD, competencies, rounds, generate link
  └── /interviews/[id]/report  # View final assessment, scorecards, grounded evidence

/candidate
  └── /interview/[id]
        ├── /                  # Welcome, mic permission test, join
        ├── /live              # Live voice room with active persona orb & controls
        └── /complete          # Thank-you screen
```

---

## 7. Canonical Demo Scenario Checklist

1. [ ] **Step 1:** Recruiter creates interview with `system_design`, `scalability`, `customer_impact`.
2. [ ] **Step 2:** Candidate joins room. UI shows **Alex (Technical Interviewer)**.
3. [ ] **Step 3:** Alex asks database/caching architecture question.
4. [ ] **Step 4:** Candidate explains Redis caching $\to$ Intelligence rates `system_design` as `STRONG`.
5. [ ] **Step 5:** Orchestrator returns `ASK_QUESTION` for `scalability` (difficulty: `HARD`).
6. [ ] **Step 6:** Alex asks 50k QPS scalability question $\to$ Candidate answers $\to$ `STRONG`.
7. [ ] **Step 7:** Orchestrator determines technical coverage complete $\to$ returns `SWITCH_AGENT` (`target_agent_id: "product"`).
8. [ ] **Step 8:** Active persona switches to **Jordan (Product Lead)**. Prepending handoff text:
   > *"Thank you for walking through the technical architecture. Now I'd like to hand over to Jordan to explore customer impact..."*
9. [ ] **Step 9:** Jordan asks customer conversion / latency question $\to$ Candidate answers $\to$ `STRONG`.
10. [ ] **Step 10:** Orchestrator returns `COMPLETE`. Jordan gracefully concludes call.
11. [ ] **Step 11:** Recruiter views Assessment Report with 3 `STRONG` competencies and grounded quotes.

---

## 8. Branch Hygiene & Exclusion from Main

When creating pull requests or merging into `main`:
1. Do not include this file in PRs targeting `main`.
2. Either delete or unstage this file prior to PR creation:
   ```bash
   git checkout main
   # When merging:
   git checkout vishnu -- .
   git reset HEAD docs/M2_INTERNAL_REFERENCE.md
   git checkout -- docs/M2_INTERNAL_REFERENCE.md
   ```
3. Alternatively, keep this file tracked exclusively on branch `vishnu`.
