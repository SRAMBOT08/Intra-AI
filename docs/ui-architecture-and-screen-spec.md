# UI Architecture & Screen Specification

## 1. Frontend stack

- Next.js
- TypeScript
- Tailwind CSS
- Official Agora Conversational AI Next.js starter as the realtime foundation

The organizer's recommended starter is the primary integration baseline. Do not introduce SvelteKit or a separate realtime voice framework for V1.

## 2. Product areas

```text
Recruiter
├── Candidate setup
├── Job / interview configuration
├── Interview launch
└── Assessment report

Candidate
└── Voice interview experience
```

## 3. Recruiter flow

### Candidate setup

- Upload CV
- Candidate metadata
- Parsed profile preview

### Interview configuration

- JD input
- Competency list
- Interview sequence
- Agent/persona configuration
- Difficulty range

### Launch

- Interview status
- Candidate/session readiness
- Start interview

### Assessment

- Overall assessment
- Competency breakdown
- Evidence
- Strengths
- Weaknesses
- Contradictions/open concerns
- Transcript references

## 4. Candidate interview screen

The candidate experience should be intentionally simple.

```text
┌──────────────────────────────────────────┐
│ EchoSphere                               │
│                                          │
│        Jordan — Product Lead             │
│        Customer Impact                   │
│                                          │
│              [ listening ]               │
│                                          │
│          microphone / call status        │
│                                          │
│          [ End Interview ]               │
└──────────────────────────────────────────┘
```

When the persona changes, the UI may update the visible interviewer name/role, but the candidate should perceive one continuous interview rather than a new meeting.

## 5. Realtime state

The UI should consume session state/events rather than reimplementing orchestration.

Useful states:

```text
CONNECTING
LISTENING
THINKING
SPEAKING
HANDOFF
PAUSED
COMPLETED
ERROR
```

## 6. Handoff UX

For `SWITCH_AGENT`, the candidate-facing transition comes from `handoff_transition_text` or an equivalent runtime-generated transition.

Example:

> "Thank you for walking through the technical architecture. Now I'd like to hand over to Jordan, our Product Lead, to explore the customer impact."

Then the Product persona continues.

## 7. Recruiter observability

During a demo, it is useful to show a lightweight internal/debug panel containing:

```text
Current agent: Technical
Current competency: Scalability
Latest analysis: Strong
Coverage: 2 / 3
Next action: SWITCH_AGENT → Product
```

This panel is for demonstration/debugging and should not expose hidden chain-of-thought. Show structured decisions and evidence, not private reasoning.

## 8. API integration

Frontend/M2 owns calls to:

- Candidate APIs
- Job/config APIs
- Session APIs
- M1 Intelligence
- M1 Orchestrator where appropriate
- Agora session lifecycle APIs

The frontend must not duplicate M1 policy logic.

## 9. UI architecture

```text
Next.js App Router
│
├── recruiter routes
│   ├── candidates
│   ├── interviews/new
│   └── interviews/[id]/report
│
├── candidate route
│   └── interviews/[id]/live
│
├── server/API integration
│
└── Agora realtime client integration
```

## 10. Hackathon priority

Prioritize the candidate live interview and recruiter report over elaborate dashboard functionality. The demo's core proof is:

```text
voice answer
→ analysis
→ adaptive decision
→ persona handoff
→ next voice response
→ evidence-backed report
```
