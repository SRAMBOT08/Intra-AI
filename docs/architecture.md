# EchoSphere Architecture

## 1. Purpose

EchoSphere is an adaptive multi-persona voice interview platform built on top of Agora Conversational AI. Its differentiator is not the realtime media layer; it is the intelligence loop that determines what competency to evaluate next, when to probe, when to increase/decrease difficulty, and when to hand the interview to another specialized persona.

## 2. Architectural statement

> **EchoSphere = interview intelligence + adaptive orchestration on top of Agora Conversational AI.**

Agora owns the realtime conversational execution. EchoSphere owns interview state, evidence, competency reasoning, and adaptive decisions.

## 3. High-level architecture

```text
                         RECRUITER
                             │
                             ▼
                    EchoSphere Web
                  Next.js / TypeScript
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
      Candidate          Job / Plan        Assessment
       Context            Config             Report
          └──────────────────┼──────────────────┘
                             ▼
                    Interview Session
                             │
                             ▼
             ╔══════════════════════════════╗
             ║   AGORA CONVERSATIONAL AI   ║
             ║                              ║
             ║   Agora RTC / RTM            ║
             ║   ASR → LLM → TTS            ║
             ║   Conversation lifecycle     ║
             ╚══════════════╤═══════════════╝
                            │
                      transcript
                            │
                            ▼
             ┌──────────────────────────────┐
             │ Interview Intelligence M1    │
             │ :4005                        │
             └──────────────┬───────────────┘
                            │ AnswerAnalysis
                            ▼
             ┌──────────────────────────────┐
             │ Meta-Orchestrator M1         │
             │ LangGraph :4004              │
             └──────────────┬───────────────┘
                            │ NextAction
                            ▼
             ┌──────────────────────────────┐
             │ Custom LLM Adapter            │
             │ Agora ↔ EchoSphere bridge    │
             └──────────────┬───────────────┘
                            │
                    active persona
                       ┌────┴────┐
                       ▼         ▼
                   Technical  Product
                     Alex      Jordan
                       └────┬────┘
                            ▼
                  Agora Conversational AI
                            │
                           TTS
                            ▼
                        Candidate
```

## 4. The adaptive loop

```text
Question / prompt
      ↓
Candidate speaks
      ↓
Agora ASR
      ↓
Transcript
      ↓
Interview Intelligence
      ↓
AnswerAnalysis
      ↓
LangGraph Meta-Orchestrator
      ↓
NextAction
      ├── ASK_QUESTION
      ├── CLARIFY
      ├── SWITCH_AGENT
      ├── ADJUST_DIFFICULTY
      └── COMPLETE_INTERVIEW
      ↓
Custom LLM Adapter
      ↓
Persona + directive + context
      ↓
LLM response
      ↓
Agora TTS
      ↓
Candidate
```

## 5. Multi-agent model

V1 uses **one active conversational persona at a time**. Technical and Product are logical interviewer personas, not two independently speaking voice sessions.

```text
Interview
   │
   ├── active_persona = technical
   │       ↓
   │    Alex speaks
   │
   └── orchestrator returns SWITCH_AGENT
           ↓
       active_persona = product
           ↓
       Jordan speaks
```

This follows the verified Agora persona/handoff direction. The exact Agora SDK/API operations are an implementation concern of Member 2 and must follow the current official Agora handoff recipe/API rather than inventing lifecycle operations.

## 6. Service boundaries

### Candidate Service
Stores candidate identity and normalized CV-derived context.

### Job & Interview Configuration
Stores JD, competency model, interview plan, agent profiles, difficulty ranges, and round configuration.

### Interview Session
Owns the logical interview, rounds, active persona, state transitions, and integration with Agora session lifecycle.

### Interview Intelligence
Converts candidate answers into structured evidence and competency findings.

### Meta-Orchestrator
Consumes the latest analysis plus authoritative interview context and returns a validated `NextAction`.

### Assessment & Reporting
Aggregates evidence and competency findings into the recruiter-facing assessment.

## 7. Authoritative state

`InterviewAIContext` is the authoritative AI-domain context.

```text
InterviewAIContext
├── interview_id
├── candidate_id
├── current_round_id
├── current_agent_id
├── difficulty
├── evaluated_competencies
├── accumulated_evidence
├── open_questions
├── missing_competencies
└── detected_contradictions
```

LangGraph execution state is transient and should not become a second source of truth.

## 8. Integration principles

1. M1 never depends on Agora-specific implementation details.
2. M2 executes `NextAction` and owns realtime behavior.
3. The Custom LLM Adapter translates between Agora's LLM interface and EchoSphere's contracts.
4. Interview Intelligence does not decide routing.
5. The Meta-Orchestrator does not generate the final spoken answer.
6. The conversational LLM does not independently override the orchestrator's interview decision.
7. One active voice persona is the V1 safety/default model.

## 9. Deployment scope

For the hackathon, logical services may run as a small number of processes. Do not introduce Kafka, Kubernetes, or unnecessary distributed infrastructure.

Recommended M1 processes:

```text
:4005 Interview Intelligence
:4004 Meta-Orchestrator
```

M2 may expose the application/API layer and Custom LLM Adapter according to the chosen implementation.

## 10. Failure boundaries

- If Intelligence fails, do not silently invent competency evidence.
- If Orchestrator fails, the runtime should use an explicitly configured safe fallback question/action.
- If Custom LLM Adapter fails, surface a controlled conversation error and preserve session state.
- If Agora disconnects, session lifecycle handling belongs to Member 2.
- Every action should be traceable to an answer analysis and/or explicit interview-plan rule where applicable.
