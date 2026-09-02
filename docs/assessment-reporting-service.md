# Assessment & Reporting Service

## Purpose

Turns accumulated interview evidence and competency findings into a recruiter-facing assessment.

The report should answer:

> What did the candidate demonstrate, what remains uncertain, and what evidence supports each conclusion?

## Inputs

- Candidate profile
- Job/interview requirements
- Competency findings
- Evidence items
- Interview rounds
- Relevant transcript references
- Contradiction/open-question records

## Report model

```text
AssessmentReport
├── interview_id
├── candidate_id
├── overall_assessment
├── competency_scores[]
├── strengths[]
├── weaknesses[]
├── unresolved_concerns[]
├── evidence[]
├── round_summary[]
└── recommendation
```

## Competency report

```text
CompetencyAssessment
├── competency_id
├── assessment
├── confidence
├── evidence_ids[]
└── rationale
```

## Evidence-first rule

A strong report must link claims to concrete evidence. Do not generate a polished recommendation from unsupported model impressions.

Example:

```text
Scalability — Strong
Confidence: 0.87
Evidence:
- Described Redis caching strategy.
- Explained database scaling approach.
- Discussed behavior under increasing traffic.
```

## Contradictions

Material contradictions should appear as unresolved concerns unless later interview evidence resolves them.

## Final recommendation

The final recommendation should be traceable to competency-level findings. For the hackathon, use a simple recruiter-friendly outcome such as:

- Strong fit
- Potential fit / needs review
- Weak evidence / further evaluation needed

The report must not imply objective hiring certainty.

## UI expectations

Recruiter should be able to see:

1. Overall assessment
2. Competency coverage
3. Strengths
4. Weaknesses
5. Evidence supporting each competency
6. Unresolved concerns
7. Interview transcript/turn references where available

## Scope

No ATS integration is required for V1. Assessment generation is downstream of the adaptive interview and does not participate in realtime voice execution.
