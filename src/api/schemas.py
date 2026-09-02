"""API Request and Response schemas for EchoSphere Member 1 services."""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from src.domain.models import (
    AnswerAnalysis,
    CandidateProfileSummary,
    InterviewAIContext,
    NextAction,
)


class AnalyzeRequest(BaseModel):
    """Payload for POST /analyze in Interview Intelligence Service."""
    question: str = Field(..., min_length=1, description="The interview question that was asked")
    candidate_answer: str = Field(..., description="The candidate's transcribed spoken answer")
    target_competencies: List[str] = Field(..., min_length=1, description="List of competency IDs to evaluate")
    interview_context: Optional[InterviewAIContext] = Field(
        default=None, description="Current interview domain context"
    )
    answer_id: str = Field(default="ANS-001", min_length=1, description="Unique identifier for the answer turn")
    candidate_profile_summary: Optional[CandidateProfileSummary] = Field(
        default=None, description="Optional candidate background info"
    )

    @field_validator("target_competencies")
    @classmethod
    def validate_target_competencies(cls, v: List[str]) -> List[str]:
        cleaned = [item.strip() for item in v if item and item.strip()]
        if not cleaned:
            raise ValueError("target_competencies must contain at least one non-empty competency ID.")
        return cleaned


class NextActionRequest(BaseModel):
    """Payload for POST /next-action in Meta-Orchestrator Service."""
    interview_context: InterviewAIContext = Field(
        ..., description="Authoritative AI domain context"
    )
    answer_analysis: Optional[AnswerAnalysis] = Field(
        default=None, description="Latest AnswerAnalysis from the intelligence service"
    )
    required_competencies: List[str] = Field(
        default_factory=list, description="Ordered list of required competency IDs for the interview plan"
    )
    is_final_round: bool = Field(
        default=False, description="Whether this is the final round of the interview"
    )
    current_competency: Optional[str] = Field(
        default=None, description="The specific competency under discussion in the previous turn"
    )

    @field_validator("required_competencies")
    @classmethod
    def validate_required_competencies(cls, v: List[str]) -> List[str]:
        return [item.strip() for item in v if item and item.strip()]


class HealthResponse(BaseModel):
    """Health check payload."""
    status: str = "healthy"
    service: str
    port: int
    version: str = "0.1.0"


class CVIngestRequest(BaseModel):
    """Payload for POST /v1/knowledge-graph/cv."""
    candidate_id: str = Field(..., min_length=1)
    cv_text: str = Field(..., min_length=1)
    candidate_name: str = Field(default="Alex Johnson")
    round_id: str = Field(default="ROUND-000")


class JDIngestRequest(BaseModel):
    """Payload for POST /v1/knowledge-graph/jd."""
    job_id: str = Field(..., min_length=1)
    job_title: str = Field(..., min_length=1)
    job_description: str = Field(..., min_length=1)
    required_competencies: Optional[List[str]] = Field(default=None)


class GraphUpdateResponse(BaseModel):
    """Response payload for Knowledge Graph operations."""
    success: bool
    message: str = "Knowledge Graph updated successfully"
    candidate_id: Optional[str] = None

