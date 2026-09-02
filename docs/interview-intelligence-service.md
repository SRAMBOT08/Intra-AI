# Interview Intelligence Service

## Purpose

Interview Intelligence converts a candidate answer into structured evidence and competency findings. It answers:

> **What did the candidate's latest answer tell us?**

It does not decide which interviewer should speak next.

## Endpoint

Recommended service port: `:4005`

Example conceptual endpoint:

```text
POST /v1/interview-intelligence/analyze
```

## Request

```json
{
  "question": "How do you scale high-throughput API endpoints?",
  "candidate_answer": "We added Redis in front of PostgreSQL and implemented write-through caching.",
  "target_competencies": ["system_design", "customer_impact"],
  "interview_context": {},
  "answer_id": "ANS-001",
  "candidate_profile_summary": null
}
```

## AnswerAnalysis

```text
AnswerAnalysis
├── answer_id
├── overall_performance
├── confidence
├── vague
├── vague_reason
├── contradiction_detected
├── contradiction_details
├── missing_information[]
├── evidence[]
├── competency_findings[]
└── recommended_follow_up
```

## EvidenceItem

```text
EvidenceItem
├── evidence_id
├── answer_id
├── competency_id
├── statement
├── strength
└── timestamp
```

## CompetencyFinding

```text
CompetencyFinding
├── competency_id
├── assessment
├── confidence
└── evidence_ids[]
```

## Intelligence checks

### Evidence extraction
Extract concrete candidate claims, decisions, metrics, trade-offs, or examples.

### Competency evaluation
Map evidence to the competency it actually supports. Avoid scoring a competency solely because a keyword was mentioned.

### Vagueness
Detect answers that do not contain enough concrete information to evaluate the target competency.

### Contradiction detection
Compare the current answer with relevant accumulated context and flag materially inconsistent claims.

### Missing information
Identify what is still required to evaluate the competency.

## Example response

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
  "evidence": [
    {
      "evidence_id": "EVID-ANS-001-001",
      "answer_id": "ANS-001",
      "competency_id": "system_design",
      "statement": "Explained Redis caching in front of PostgreSQL.",
      "strength": "STRONG",
      "timestamp": "2026-09-01T23:30:00.000000"
    }
  ],
  "competency_findings": [
    {
      "competency_id": "system_design",
      "assessment": "STRONG",
      "confidence": 0.91,
      "evidence_ids": ["EVID-ANS-001-001"]
    }
  ],
  "recommended_follow_up": "Probe customer impact on checkout latency."
}
```

## Design constraint

The service should be deterministic in its schema and explicit about confidence. It must not silently turn missing evidence into a strong assessment.
