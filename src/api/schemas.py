"""API Request and Response schemas for EchoSphere Member 1 services."""

from typing import List, Optional
from pydantic import BaseModel, Field

from src.domain.models import (
    AnswerAnalysis,
    CandidateProfileSummary,
    InterviewAIContext,
    NextAction,
)


class AnalyzeRequest(BaseModel):
    """Payload for POST /analyze in Interview Intelligence Service."""
    question: str = Field(..., description="The interview question that was asked")
    candidate_answer: str = Field(..., description="The candidate's transcribed spoken answer")
    target_competencies: List[str] = Field(..., description="List of competency IDs to evaluate")
    interview_context: Optional[InterviewAIContext] = Field(
        default=None, description="Current interview domain context"
    )
    answer_id: str = Field(default="ANS-001", description="Unique identifier for the answer turn")
    candidate_profile_summary: Optional[CandidateProfileSummary] = Field(
        default=None, description="Optional candidate background info"
    )


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


class HealthResponse(BaseModel):
    """Health check payload."""
    status: str = "healthy"
    service: str
    port: int
    version: str = "0.1.0"
