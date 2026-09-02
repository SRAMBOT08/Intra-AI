# Adaptive Meta-Orchestrator

## Purpose

The Meta-Orchestrator decides the next interview action using the latest `AnswerAnalysis`, authoritative `InterviewAIContext`, and configured interview plan.

It answers:

> **Given what we know now, what should happen next?**

## Runtime

- LangGraph
- M1-owned
- Recommended port: `:4004`

## Graph

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
  ├── contradiction/vague → validate_and_finalize_action
  └── clear
        ↓
prioritize_gaps
  ├── selected gap → resolve_competency_owner
  └── no gaps → apply_difficulty_or_fallback
        ↓
validate_and_finalize_action
        ↓
END
```

## Graph state

`InterviewGraphState` is transient execution state.

```text
InterviewGraphState
├── interview_context
├── answer_analysis
├── required_competencies
├── is_final_round
├── current_agent_id
├── current_competency
├── unresolved_gaps[]
├── selected_gap
├── next_action
├── decision_reason
└── execution_metadata
```

`InterviewAIContext` remains the authoritative domain state.

## Policies

### CompletionPolicy
Determines whether required competency coverage is complete, including findings from the current turn.

### ClarificationPolicy
Determines whether the answer requires clarification before moving on.

### VaguenessPolicy
Determines whether insufficient specificity requires another probe.

### HandoffPolicy
Maps a competency gap to the correct interviewer persona.

### DifficultyPolicy
Adjusts question difficulty when coverage is sufficient or when the configured range requires a fallback.

### ActionValidator
Rejects invalid actions such as switching to an unknown agent or requesting an unsupported competency.

### TransitionBuilder
Builds candidate-facing handoff language without exposing internal reasoning.

### AgentRegistry
Resolves configured persona metadata.

## NextAction

```text
NextAction
├── action
├── target_agent_id
├── competency_id
├── difficulty
├── reason
├── prompt_directive
└── handoff_transition_text
```

## Action semantics

### ASK_QUESTION
Stay with the current persona and ask the next question for the selected competency.

### CLARIFY
Ask the candidate to make the previous answer concrete enough to evaluate.

### SWITCH_AGENT
Move the active logical persona to the owner of the selected competency.

### ADJUST_DIFFICULTY
Change the difficulty while maintaining the current competency/agent where appropriate.

### COMPLETE_INTERVIEW
End the interview when required coverage is complete or the final round has concluded.

## Multi-gap priority

The interview-plan ordering determines which unresolved competency is selected first. If the selected gap belongs to the current agent, return `ASK_QUESTION`. If it belongs to another configured agent, return `SWITCH_AGENT`.

Example:

```text
required:
  system_design
  scalability
  customer_impact

current agent:
  technical

current answer:
  system_design = STRONG
  scalability = STRONG
  customer_impact = MISSING

result:
  SWITCH_AGENT → product
```

## Example response

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product",
  "competency_id": "customer_impact",
  "difficulty": null,
  "reason": "Candidate response left customer_impact unevaluated; Product Lead owns that competency.",
  "prompt_directive": "Probe customer impact on checkout latency.",
  "handoff_transition_text": "Thank you for walking through the technical architecture. Now I'd like to hand over to Jordan, our Product Lead, to explore the customer impact and business implications."
}
```

## Boundary with the Custom LLM Adapter

The orchestrator does **not** produce the final spoken answer. It produces structured intent. The Custom LLM Adapter translates that intent into persona instructions and a conversational response for Agora.

## Frozen M1 implementation

The existing LangGraph implementation is considered frozen for hackathon integration. Do not modify it merely to fit the Agora runtime. Only change it when integration reveals a genuine contract defect.
