# EchoSphere

## Adaptive Multi-Agent Voice Interview Platform

EchoSphere is an adaptive interview intelligence and orchestration system built on top of **Agora Conversational AI**.

The platform conducts a voice interview, analyzes candidate answers in real time, evaluates competency coverage, and dynamically decides what should happen next. Specialized interviewer personas can take over different parts of the same logical interview.

## Core principle

> Agora provides the real-time conversational runtime; EchoSphere provides the interview intelligence and adaptive decision-making.

EchoSphere does **not** train or build a foundation LLM. It implements a **Custom LLM Adapter** that exposes an Agora-compatible LLM endpoint and connects Agora's conversation to EchoSphere's intelligence/orchestration layer and an existing LLM provider.

## Final runtime flow

```text
Candidate voice
      ↓
Agora Conversational AI
  RTC / ASR / TTS / session
      ↓ transcript
Interview Intelligence :4005
      ↓ AnswerAnalysis
Meta-Orchestrator :4004
  LangGraph + deterministic policies
      ↓ NextAction
Custom LLM Adapter
  persona/context/response bridge
      ↓
Technical or Product persona
      ↓
Agora Conversational AI
      ↓ TTS
Candidate
```

## Adaptive interview example

```text
Technical / Alex
  → system_design
  → candidate answer
  → analysis
  → scalability follow-up
  → candidate answer
  → analysis
  → technical coverage sufficient
  → SWITCH_AGENT → product / Jordan
  → customer_impact question
```

There is one active conversational interviewer persona at a time in V1. The logical interview remains one continuous session; the implementation should use the Agora handoff/persona pattern rather than running multiple simultaneous voice agents.

## Logical service boundaries

These are business/service boundaries, not a requirement to deploy six independent microservices for the hackathon.

1. Candidate Service
2. Job & Interview Configuration
3. Interview Session
4. Interview Intelligence
5. Adaptive Meta-Orchestrator
6. Assessment & Reporting

The Custom LLM Adapter is an integration/runtime component between Agora and the EchoSphere intelligence/orchestration layer.

## Team ownership

### Member 1 — AI Intelligence & Agent Systems

Owns:
- Answer analysis
- Evidence extraction
- Competency evaluation
- Vagueness and contradiction detection
- InterviewAIContext
- LangGraph Meta-Orchestrator
- Deterministic interview policies
- NextAction contracts
- Difficulty decisions
- Agent routing/handoff decisions

Ports:
- Interview Intelligence: `:4005`
- Meta-Orchestrator: `:4004`

### Member 2 — Product + Agora Realtime

Owns:
- Official Agora Conversational AI integration
- Agora RTC/RTM and realtime session lifecycle
- Next.js candidate/recruiter UI
- Candidate/CV workflow
- Interview configuration UI
- Agora agent execution and handoff execution
- Custom LLM Adapter integration
- Assessment/report presentation

Member 2 executes M1's `NextAction`; it must not recreate M1's decision logic.

## V1 technology direction

- Frontend: Next.js + TypeScript + Tailwind
- Realtime conversational layer: Agora Conversational AI
- Transport/media: Agora RTC / RTM as required by the official starter
- Orchestration: LangGraph
- Existing LLM provider behind Custom LLM Adapter
- Simple HTTP service boundaries for the hackathon
- No TEN dependency in V1
- No Kafka/Kubernetes requirement

## Primary demo

1. Recruiter uploads CV and enters JD.
2. EchoSphere derives/configures competencies and interview plan.
3. Candidate joins an Agora voice interview.
4. Alex, Technical Interviewer, evaluates technical competencies.
5. Candidate answers are analyzed by Interview Intelligence.
6. LangGraph chooses the next action.
7. Technical follow-ups deepen unresolved competencies.
8. Once technical coverage is sufficient, the orchestrator emits `SWITCH_AGENT`.
9. The Custom LLM Adapter activates the Product persona.
10. Jordan, Product Lead, evaluates customer impact/business implications.
11. Assessment & Reporting produces an evidence-backed report.

## Key contracts

### AnswerAnalysis

```json
{
  "answer_id": "ANS-001",
  "overall_performance": "STRONG",
  "confidence": 0.91,
  "vague": false,
  "vague_reason": null,
  "contradiction_detected": false,
  "contradiction_details": null,
  "missing_information": ["customer_impact"],
  "evidence": [],
  "competency_findings": [],
  "recommended_follow_up": "Probe customer impact on checkout latency."
}
```

### NextAction

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product",
  "competency_id": "customer_impact",
  "difficulty": null,
  "reason": "Customer impact is not yet evaluated.",
  "prompt_directive": "Probe customer impact and business implications.",
  "handoff_transition_text": "Now I would like to hand over to Jordan, our Product Lead."
}
```

## Architecture documents

- `docs/architecture.md` — system architecture and end-to-end flow
- `docs/candidate-service.md` — candidate/CV context
- `docs/job-interview-config-service.md` — JD, competency model, interview plan
- `docs/interview-session-service.md` — logical interview/session lifecycle
- `docs/interview-intelligence-service.md` — answer analysis and evidence
- `docs/meta-orchestrator.md` — LangGraph decision engine
- `docs/custom-llm-adapter.md` — Agora CustomLLM integration and persona routing
- `docs/assessment-reporting-service.md` — evidence-backed final assessment
- `docs/ui-architecture-and-screen-spec.md` — Next.js product/UI architecture
