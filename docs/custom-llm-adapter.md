# Custom LLM Adapter

## Purpose

The Custom LLM Adapter is the bridge between Agora Conversational AI and EchoSphere's adaptive intelligence.

It is **not a custom-trained LLM**. It is an application service exposing an Agora-compatible/custom LLM endpoint and internally calling an existing LLM plus EchoSphere's decision services.

## Why we need it

Agora's managed LLM path is sufficient for a basic conversational agent. EchoSphere needs an application-controlled reasoning loop so that the active interviewer persona and next interview behavior are driven by `AnswerAnalysis` and `NextAction`.

## Conceptual flow

```text
Agora Conversational AI
        │
        │ conversation / LLM request
        ▼
┌──────────────────────────────┐
│ Custom LLM Adapter           │
│                              │
│ context assembly              │
│ M1 integration                │
│ persona routing               │
│ response generation           │
│ streaming                     │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
 Intelligence     Orchestrator
   :4005             :4004
        └──────┬──────┘
               ▼
        existing LLM provider
               │
               ▼
        streamed response
               │
               ▼
             Agora
```

## Important separation

M1 decides:

```text
What should happen next?
```

The Custom LLM Adapter decides:

```text
How should that decision be expressed as a natural conversational response?
```

The adapter must not independently override a validated `NextAction`.

## Persona model

Personas are application-level configurations.

```text
technical
├── display_name: Alex
├── role: Technical Interviewer
├── focal_competencies: system_design, scalability
└── instructions

product
├── display_name: Jordan
├── role: Product Lead
├── focal_competencies: customer_impact
└── instructions
```

## Example action translation

M1 returns:

```json
{
  "action": "ASK_QUESTION",
  "target_agent_id": "technical",
  "competency_id": "scalability",
  "difficulty": "MEDIUM",
  "prompt_directive": "Probe how the architecture behaves as traffic increases."
}
```

Adapter constructs a persona/context instruction and asks the existing LLM to generate the next interviewer utterance.

For `SWITCH_AGENT`:

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product",
  "competency_id": "customer_impact",
  "prompt_directive": "Explore customer impact and business implications."
}
```

The adapter changes the active logical persona/context and generates the first Product response, using the supported Agora handoff/persona mechanism.

## Context assembly

The adapter should provide only relevant context:

```text
system/persona instructions
+ current question
+ latest candidate answer
+ relevant InterviewAIContext
+ NextAction.prompt_directive
+ required conversational history
```

Do not dump the entire interview history into every request when a compact context can preserve the necessary state.

## Response requirements

The adapter must support the response format and streaming behavior required by the currently configured Agora CustomLLM integration. Treat Agora's current official API/recipe as the source of truth for exact wire fields and lifecycle behavior.

## Error handling

- Unknown persona → reject action / use safe configured fallback.
- M1 unavailable → return controlled fallback behavior; do not invent an assessment.
- LLM provider failure → return a controlled conversational error or configured fallback.
- Invalid action → never execute it silently.
- Preserve interview/session state across adapter failures.

## Security

- Authenticate internal M1 calls.
- Validate interview/session identifiers.
- Do not expose internal reasoning or raw orchestration metadata to the candidate.
- Keep provider credentials server-side.

## Hackathon implementation strategy

Start with the smallest working adapter:

1. Accept Agora's CustomLLM request shape.
2. Recover interview/session context.
3. Call M1 Intelligence for the candidate turn when analysis is required.
4. Call M1 Orchestrator.
5. Resolve the returned persona.
6. Call an existing LLM provider.
7. Stream the response in the format Agora expects.
8. Emit/record the resulting action and active persona.

Do not build a new model, inference engine, vector database, or separate agent framework for this component.
