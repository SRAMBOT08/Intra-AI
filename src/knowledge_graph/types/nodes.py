"""Graph node domain models for EchoSphere Knowledge Graph."""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CandidateNode(BaseModel):
    """Candidate node representing an applicant across rounds."""
    id: str = Field(..., description="Unique candidate ID, e.g., 'candidate:CAND-505'")
    candidate_id: str = Field(..., description="Raw candidate identifier, e.g., 'CAND-505'")
    name: str = Field(..., description="Candidate full name")
    email: Optional[str] = Field(default=None, description="Candidate email if available")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class InterviewRoundNode(BaseModel):
    """Interview round node representing a specific round session."""
    id: str = Field(..., description="Unique round ID, e.g., 'round:ROUND-001'")
    interview_id: str = Field(..., description="Parent interview session ID")
    round_number: int = Field(default=1, description="Round sequence number")
    round_type: str = Field(default="technical", description="Round focus: technical, product, behavioral")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ExperienceNode(BaseModel):
    """Work experience or employment history fact from CV/discussion."""
    id: str = Field(..., description="Unique experience ID, e.g., 'exp:payment_team_lead'")
    title: str = Field(..., description="Role title")
    organization: Optional[str] = Field(default=None, description="Company or team name")
    description: Optional[str] = Field(default=None, description="Description of responsibilities")
    start_date: Optional[str] = Field(default=None)
    end_date: Optional[str] = Field(default=None)


class ProjectNode(BaseModel):
    """Project entity worked on by the candidate."""
    id: str = Field(..., description="Unique project ID, e.g., 'project:payment_api'")
    name: str = Field(..., description="Project name")
    description: Optional[str] = Field(default=None, description="Summary of project goals and architecture")


class SkillNode(BaseModel):
    """Professional skill entity."""
    id: str = Field(..., description="Unique skill ID, e.g., 'skill:python'")
    name: str = Field(..., description="Skill name, e.g., 'Python', 'Distributed Systems'")
    category: Optional[str] = Field(default=None)


class TechnologyNode(BaseModel):
    """Specific technology, tool, or database entity."""
    id: str = Field(..., description="Unique technology ID, e.g., 'tech:redis'")
    name: str = Field(..., description="Technology name, e.g., 'Redis', 'PostgreSQL', 'Docker'")
    category: Optional[str] = Field(default=None)


class ConceptNode(BaseModel):
    """Architectural or engineering concept entity."""
    id: str = Field(..., description="Unique concept ID, e.g., 'concept:horizontal_scaling'")
    name: str = Field(..., description="Concept name, e.g., 'Caching', 'Sharding', 'Event-Driven'")
    description: Optional[str] = Field(default=None)


class CompetencyNode(BaseModel):
    """Target evaluation competency."""
    id: str = Field(..., description="Unique competency ID, e.g., 'competency:system_design'")
    name: str = Field(..., description="Competency name: system_design, scalability, customer_impact")
    category: str = Field(default="technical")


class QuestionNode(BaseModel):
    """Question asked by an interviewer persona."""
    id: str = Field(..., description="Unique question ID, e.g., 'question:Q-001'")
    text: str = Field(..., description="Exact question text asked")
    competency_id: str = Field(..., description="Target competency")
    round_id: str = Field(..., description="Associated round ID")
    agent_id: str = Field(..., description="Interviewer persona ID, e.g., 'technical', 'product'")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnswerNode(BaseModel):
    """Candidate spoken response to a question."""
    id: str = Field(..., description="Unique answer ID, e.g., 'answer:ANS-001'")
    text: str = Field(..., description="Candidate spoken answer transcript")
    question_id: str = Field(..., description="ID of question being answered")
    round_id: str = Field(..., description="Associated round ID")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class EvidenceNode(BaseModel):
    """Grounded evidence extracted from an answer with strict provenance."""
    id: str = Field(..., description="Unique evidence ID, e.g., 'evidence:EVID-001'")
    answer_id: str = Field(..., description="Source answer ID")
    statement: str = Field(..., description="Verifiable factual statement extracted from answer")
    strength: str = Field(default="STRONG", description="STRONG, MODERATE, WEAK")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AssessmentNode(BaseModel):
    """Historical or round-level competency assessment node."""
    id: str = Field(..., description="Unique assessment ID, e.g., 'assessment:CAND-505:scalability:ROUND-001'")
    candidate_id: str = Field(...)
    competency_id: str = Field(...)
    rating: str = Field(..., description="STRONG, PARTIAL, WEAK, NOT_EVALUATED")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    round_id: str = Field(...)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
