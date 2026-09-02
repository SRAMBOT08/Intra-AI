# EchoSphere — Member 2
## Product, Realtime & Agora Integration

### Ownership

Member 2 owns the product experience and realtime execution layer. This includes the official Agora Conversational AI integration, Next.js application, interview/session interaction, candidate workflow, and execution of decisions produced by Member 1.

### Primary Components

- Next.js frontend
- Candidate interview experience
- Recruiter/HR experience
- Candidate/CV workflow
- Job description and interview configuration UI
- Interview session integration
- Agora Conversational AI
- Agora RTC/RTM integration
- Agora token/session lifecycle
- Custom LLM Adapter
- Persona execution
- Agent handoff execution
- Transcript/event plumbing
- Assessment/report presentation

### Frontend Stack

```text
Next.js
TypeScript
Tailwind CSS
Agora RTC / RTM
```

The official Agora Conversational AI Next.js starter is the preferred foundation.

### Product Flow

```text
Recruiter
   ↓
Upload CV + enter JD
   ↓
Configure interview
   ↓
Create interview
   ↓
Candidate starts interview
   ↓
Agora Conversational AI
   ↓
Voice interview
   ↓
Assessment/report
   ↓
Recruiter reviews evidence
```

### Realtime Flow

```text
Candidate microphone
        ↓
Agora RTC
        ↓
Agora Conversational AI
        ↓
ASR
        ↓
Conversation / Custom LLM
        ↓
TTS
        ↓
Candidate audio
```

### Adaptive Integration Flow

Member 2 executes the intelligence decision produced by Member 1.

```text
Candidate speaks
      ↓
Agora transcript
      ↓
Member 1 / Intelligence
      ↓
AnswerAnalysis
      ↓
Member 1 / Orchestrator
      ↓
NextAction
      ↓
Member 2
      ↓
Agora / Custom LLM Adapter
      ↓
Next interviewer response
```

### Custom LLM Adapter

Member 2 owns the Agora-facing Custom LLM integration.

Important distinction:

**This is not a custom-trained LLM.**

It is an adapter/API that allows Agora Conversational AI to use EchoSphere's intelligence and logical personas.

Conceptually:

```text
Agora Conversational AI
          ↓
Custom LLM Adapter
          ↓
EchoSphere intelligence/orchestration
          ↓
Existing LLM
          ↓
Response stream
          ↓
Agora
          ↓
TTS
```

The adapter should translate EchoSphere's `NextAction` into conversational behavior.

### Persona Execution

Logical personas:

```text
technical
→ Alex
→ Technical Interviewer

product
→ Jordan
→ Product Lead
```

Member 2 is responsible for making the selected persona active in the Agora conversational experience.

The logical decision comes from Member 1:

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product",
  "competency_id": "customer_impact"
}
```

Member 2 executes it through the Agora/custom-LLM mechanism.

### Important Multi-Agent Rule

Do not design V1 around multiple simultaneously speaking Agora agents.

Use:

```text
One logical interview
        ↓
One active conversational persona
        ↓
Technical → Product → ...
```

The interview remains one continuous product experience.

The implementation mechanism for persona handoff belongs to the Agora integration layer.

### Session Responsibilities

Member 2 owns:

- Interview start/stop
- Agora channel/session setup
- Agora token handling
- Candidate microphone permissions
- Audio playback
- Conversation state shown to the UI
- Transcript/event consumption
- Passing candidate answers to Member 1
- Receiving `NextAction`
- Executing `ASK_QUESTION`
- Executing `SWITCH_AGENT`
- Executing interview completion
- Handling reconnect/error states

### API Integration With Member 1

Member 2 calls the frozen M1 contracts.

Example:

```text
POST Interview Intelligence :4005
       ↓
candidate answer
       ↓
AnswerAnalysis

POST Meta-Orchestrator :4004
       ↓
AnswerAnalysis + InterviewAIContext
       ↓
NextAction
```

Member 2 must not recreate the decision logic locally.

For example, Member 2 should **not** implement:

```text
if customer_impact missing:
    switch to product
```

Instead:

```text
M1 → NextAction
       ↓
Member 2 executes NextAction
```

### Candidate UI

Member 2 owns:

- Interview landing screen
- Pre-interview instructions
- Microphone permission
- Interview status
- Current interviewer/persona
- Voice activity state
- Connection state
- Interview completion
- Error/retry experience

The UI should hide implementation details such as LangGraph or internal services.

### Recruiter / HR UI

Member 2 owns:

- Candidate upload
- Job description input
- Interview configuration
- Competency selection/display
- Interview progress
- Assessment report
- Evidence presentation
- Strengths
- Weaknesses
- Unresolved concerns
- Competency results
- Transcript/evidence references where available

### Session and Product State

Member 2 owns product/session state such as:

```text
Interview
├── interview_id
├── candidate_id
├── status
├── active_persona
├── current_round
├── realtime_channel/session
└── transcript/events
```

AI-domain decisions remain owned by Member 1.

### Error Handling

Member 2 handles runtime failures such as:

- Agora connection failure
- Token failure
- microphone permission failure
- agent session failure
- Custom LLM timeout
- malformed M1 response
- reconnect
- candidate disconnect
- interview termination

Member 2 should fail safely rather than inventing an AI decision.

### Testing Owned by Member 2

- Next.js UI tests
- Candidate flow tests
- Recruiter configuration flow
- Agora connection tests
- Audio input/output tests
- Session lifecycle tests
- Custom LLM adapter tests
- Persona handoff execution tests
- M1 API integration tests
- End-to-end voice interview demo
- Error/reconnect tests

### Explicit Non-Ownership

Member 2 does not own:

- AnswerAnalysis rules
- competency scoring logic
- evidence evaluation logic
- LangGraph graph design
- gap prioritization policy
- difficulty policy
- handoff decision policy
- NextAction decision logic

Those belong to Member 1.

### Definition of Done

Member 2 is complete when:

1. Recruiter can configure an interview.
2. Candidate can enter the interview.
3. Agora Conversational AI provides the realtime voice experience.
4. Candidate speech becomes usable transcript input.
5. M1 analysis/orchestration can be called during the interview.
6. `ASK_QUESTION` is executed correctly.
7. `SWITCH_AGENT` changes the logical interviewer persona.
8. The interview remains one continuous experience.
9. Interview completion works.
10. HR can view the resulting assessment/report.

### Working Rule

**Member 2 owns how the interview runs. Member 1 owns what the interview should do next.**
