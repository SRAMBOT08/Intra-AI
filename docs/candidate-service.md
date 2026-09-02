# Candidate Service

## Purpose

Candidate Service provides the stable candidate identity and normalized profile context consumed by interview configuration, session management, intelligence, and reporting.

## Responsibilities

- Candidate record creation/update
- CV upload metadata
- CV parsing/normalization
- Candidate profile summary
- Relevant experience, skills, projects, and role history
- Expose only the candidate context needed by downstream AI services

## Core model

```text
Candidate
├── candidate_id
├── name
├── email
├── cv_document_id
├── profile_summary
├── skills[]
├── experience[]
├── projects[]
└── created_at / updated_at
```

## AI-facing candidate context

Do not send the entire CV on every turn. Produce a compact `candidate_profile_summary` containing facts useful for interview questioning.

Example:

```json
{
  "candidate_id": "CAND-505",
  "candidate_profile_summary": {
    "years_experience": 4,
    "primary_skills": ["Python", "AWS", "PostgreSQL", "Redis"],
    "notable_projects": ["high-throughput checkout API"],
    "leadership_exposure": "limited"
  }
}
```

## Boundaries

Candidate Service does not decide interview questions or competency scores. It supplies factual candidate context.

## Hackathon scope

A simple document upload + parsing flow is sufficient. Avoid building an ATS. Assume the recruiter has already selected the candidate for interview.
