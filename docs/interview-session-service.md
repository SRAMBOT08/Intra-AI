# Interview Session Service

## Purpose

Owns the logical interview lifecycle independently from the underlying Agora realtime session.

## Logical model

```text
Interview
├── interview_id
├── candidate_id
├── job_id
├── status
├── current_round_id
├── current_agent_id
├── difficulty
├── rounds[]
└── started_at / completed_at
```

## Round model

```text
Round
├── round_id
├── agent_id
├── target_competencies[]
├── questions[]
├── answers[]
├── status
└── started_at / completed_at
```

## Relationship with Agora

The Interview Session Service owns the **logical** interview. Agora Conversational AI owns realtime conversational execution.

```text
EchoSphere Interview
       │
       └── Agora conversation/session
```

Do not make the Agora session identifier the primary interview identifier. The logical interview must survive reconnects and multiple rounds.

## Active persona

V1 maintains one active persona:

```text
current_agent_id = technical
```

When M1 returns:

```json
{
  "action": "SWITCH_AGENT",
  "target_agent_id": "product"
}
```

Member 2 executes the Agora-side persona handoff using the supported Agora implementation. The candidate remains in the same logical interview experience.

## Session state transitions

```text
CREATED
  ↓
READY
  ↓
ACTIVE
  ├── PAUSED
  ├── RECONNECTING
  └── COMPLETED
```

## Responsibilities

- Start/stop interview
- Track active round/persona
- Associate transcripts/answers with the interview
- Persist AI context snapshots as needed
- Coordinate with Agora lifecycle events
- Apply validated `NextAction` to session state

## Non-responsibilities

The session service does not independently score answers or choose the next competency.
