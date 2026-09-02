# EchoSphere — Member 1
## AI Intelligence & Agent Systems

### Ownership

Member 1 owns the intelligence layer of EchoSphere: understanding candidate answers, evaluating competencies, deciding what should happen next, and producing the contracts consumed by the realtime/product layer.

### Primary Components

- Interview Intelligence
- AnswerAnalysis
- Evidence extraction
- Competency evaluation
- Vagueness and ambiguity detection
- Contradiction detection
- InterviewAIContext
- Meta-Orchestrator
- LangGraph decision graph
- Deterministic interview policies
- Agent/competency ownership resolution
- Adaptive difficulty
- NextAction contract
- AI-facing integration contracts

### Services / Ports

| Component | Responsibility | Port |
|---|---|---:|
| Interview Intelligence | Analyze candidate answers and produce evidence/competency findings | `4005` |
| Meta-Orchestrator | Decide the next interview action using LangGraph | `4004` |

### Core Flow

```text
Candidate Answer
      ↓
AnswerAnalysis
      ↓
Competency Findings + Evidence
      ↓
LangGraph Meta-Orchestrator
      ↓
NextAction
```

### LangGraph Responsibilities

The graph should remain responsible for decision flow, not realtime execution.

```text
START
  ↓
validate_inputs
  ↓
check_completion
  ├── complete → validate_and_finalize_action
  └── gaps
       ↓
  check_clarification_or_vagueness
       ├── vague/contradiction → validate_and_finalize_action
       └── clear
            ↓
       prioritize_gaps
            ├── selected gap → resolve_competency_owner
            └── no gap → apply_difficulty_or_fallback
                         ↓
                  validate_and_finalize_action
                         ↓
                        END
```

### Canonical Contracts

#### AnswerAnalysis

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
  "recommended_follow_up": "Probe customer impact."
}
```

#### NextAction

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product",
  "competency_id": "customer_impact",
  "difficulty": null,
  "reason": "Customer impact remains unevaluated.",
  "prompt_directive": "Probe customer impact and business implications.",
  "handoff_transition_text": "Now I'd like to hand over to Jordan to explore the customer impact."
}
```

### Agent Profiles

Member 1 owns the logical agent/persona definitions and their competency ownership.

Example:

```text
technical
├── display_name: Alex
├── role: Technical Interviewer
├── competencies:
│   ├── system_design
│   └── scalability
└── questioning_style

product
├── display_name: Jordan
├── role: Product Lead
├── competencies:
│   └── customer_impact
└── questioning_style
```

These are logical personas. Agora Conversational AI remains the realtime conversational runtime.

### Decision Responsibilities

Member 1 decides:

- Is the candidate's answer strong, partial, weak, vague, or contradictory?
- What evidence supports the assessment?
- Which competencies have sufficient evidence?
- Which competencies remain unresolved?
- Should the current agent ask a follow-up?
- Should difficulty increase/decrease?
- Should the interview switch to another persona?
- Which persona owns the next competency?
- What directive should be passed to the conversational layer?
- Whether the interview is complete.

Member 1 does **not** decide how Agora performs the actual RTC/TTS/session operation.

### Integration Boundary With Member 2

Member 1 exposes stable APIs/contracts for Member 2.

```text
Member 2
  │
  │ candidate answer + context
  ▼
POST /analyze
  │
  ▼
Interview Intelligence :4005
  │
  ▼
AnswerAnalysis
  │
  │
  ▼
POST /next-action
  │
  ▼
Meta-Orchestrator :4004
  │
  ▼
NextAction
  │
  ▼
Member 2 / Custom LLM Adapter
```

### Custom LLM Adapter Boundary

Member 1 does not own the Agora implementation.

The adapter consumes the decision:

```text
NextAction
   ↓
target_agent_id
competency_id
difficulty
prompt_directive
handoff_transition_text
```

and uses it to influence the conversational response.

### Persistence / State

`InterviewAIContext` is the authoritative AI-domain state supplied to the intelligence/orchestration layer.

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

`InterviewGraphState` remains transient execution state for LangGraph.

### Testing Owned by Member 1

- Answer analysis unit tests
- Competency evaluation tests
- Evidence extraction tests
- Vagueness/clarification tests
- Contradiction tests
- Completion tests
- Multi-gap prioritization tests
- Agent ownership tests
- Difficulty tests
- NextAction validation tests
- LangGraph routing tests
- End-to-end intelligence → orchestrator contract tests

### Explicit Non-Ownership

Member 1 does not own:

- Next.js UI
- Candidate-facing realtime UI
- Agora RTC/RTM setup
- Agora agent session lifecycle
- microphone/audio playback
- Agora token generation
- candidate CV upload UI
- interview setup UI
- HR report UI
- actual execution of `NextAction`

### Definition of Done

Member 1 is complete when:

1. Candidate answers can be analyzed through the defined contract.
2. Evidence and competency findings are produced consistently.
3. LangGraph produces a validated `NextAction`.
4. Technical → Product handoff decisions work.
5. Difficulty adaptation works.
6. Interview completion is deterministic.
7. APIs are documented and stable for Member 2.
8. Integration tests pass against the frozen contracts.

### Working Rule

**Member 1 decides what the interview should do next. Member 2 executes that decision through Agora and the product experience.**
