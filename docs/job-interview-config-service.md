# Job & Interview Configuration Service

## Purpose

Defines what the interview is intended to evaluate and how the interview should progress.

## Inputs

- Job description
- Interview duration/rounds
- Required competencies
- Competency priority/order
- Interviewer personas
- Difficulty range
- Optional recruiter instructions

## Example interview plan

```json
{
  "interview_id": "INT-101",
  "required_competencies": [
    "system_design",
    "scalability",
    "customer_impact"
  ],
  "agent_profiles": [
    {
      "agent_id": "technical",
      "display_name": "Alex",
      "role": "Technical Interviewer",
      "focal_competencies": ["system_design", "scalability"]
    },
    {
      "agent_id": "product",
      "display_name": "Jordan",
      "role": "Product Lead",
      "focal_competencies": ["customer_impact"]
    }
  ]
}
```

## AgentProfile

```text
AgentProfile
├── agent_id
├── role
├── display_name
├── description
├── focal_competencies[]
├── questioning_style
├── instructions
├── min_difficulty
├── max_difficulty
└── allowed_actions[]
```

## Important rule

Configuration defines the **interview plan**. The orchestrator determines the next action based on live evidence and the plan. Configuration must not be duplicated as hidden decision logic inside the realtime client.

## Hackathon scope

Support a curated competency catalog rather than arbitrary competency authoring. The demo should make the adaptive behavior easy to observe.
