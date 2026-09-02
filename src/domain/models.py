"""Canonical domain models for EchoSphere Member 1."""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator

from src.domain.enums import (
    ActionType,
    AgentRole,
    DifficultyLevel,
    EvidenceStrength,
    PerformanceRating,
)


class EvidenceItem(BaseModel):
    """Grounded candidate evidence extracted from an interview answer."""
    evidence_id: str = Field(..., description="Unique identifier for the evidence item")
    answer_id: str = Field(..., description="ID of the answer this evidence was extracted from")
    competency_id: str = Field(..., description="ID of the competency supported by this evidence")
    statement: str = Field(..., description="Direct or summarized factual statement extracted from candidate response")
    strength: EvidenceStrength = Field(default=EvidenceStrength.STRONG, description="Assessed strength of this evidence")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 timestamp when evidence was extracted",
    )


class CompetencyFinding(BaseModel):
    """Evaluated assessment of a candidate competency for a turn."""
    competency_id: str = Field(..., description="Competency identifier")
    assessment: PerformanceRating = Field(..., description="Assessed performance level for this competency")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    evidence_ids: List[str] = Field(default_factory=list, description="List of supporting evidence IDs")


class AnswerAnalysis(BaseModel):
    """Structured intelligence result evaluating a candidate's answer."""
    answer_id: str = Field(..., description="ID of the evaluated answer")
    overall_performance: PerformanceRating = Field(..., description="Overall assessment rating of the answer")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score between 0.0 and 1.0")
    vague: bool = Field(default=False, description="Flag indicating if the answer lacks concrete substance")
    vague_reason: Optional[str] = Field(default=None, description="Explanation if vague")
    contradiction_detected: bool = Field(default=False, description="Flag indicating if answer contradicts previous evidence")
    contradiction_details: Optional[str] = Field(default=None, description="Details of contradiction if detected")
    missing_information: List[str] = Field(default_factory=list, description="Competencies or details missing in answer")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Extracted grounded evidence items")
    competency_findings: List[CompetencyFinding] = Field(default_factory=list, description="Findings per target competency")
    recommended_follow_up: Optional[str] = Field(default=None, description="Recommended probing question or directive")


class NextAction(BaseModel):
    """The authoritative decision produced by the Meta-Orchestrator."""
    action: ActionType = Field(..., description="Next interview action: ASK_QUESTION, SWITCH_AGENT, or COMPLETE")
    target_agent_id: Optional[str] = Field(default=None, description="Target interviewer persona ID")
    competency_id: Optional[str] = Field(default=None, description="Competency to be evaluated next")
    difficulty: Optional[DifficultyLevel] = Field(default=None, description="Recommended difficulty tier metadata")
    reason: str = Field(..., description="Clear, explainable justification for the decision")
    prompt_directive: Optional[str] = Field(default=None, description="Instruction directive for the conversational layer")
    handoff_transition_text: Optional[str] = Field(
        default=None, description="Spoken dialogue text when handing off to another agent persona"
    )

    @field_validator("handoff_transition_text")
    @classmethod
    def validate_handoff_text(cls, v: Optional[str], info) -> Optional[str]:
        action = info.data.get("action")
        if action == ActionType.SWITCH_AGENT and (not v or not v.strip()):
            raise ValueError("SWITCH_AGENT action requires non-empty handoff_transition_text.")
        return v


class InterviewAIContext(BaseModel):
    """Authoritative AI-domain state passed across turns."""
    interview_id: str = Field(..., description="Unique interview session ID")
    candidate_id: str = Field(..., description="Candidate identifier")
    current_round_id: str = Field(..., description="Current round identifier")
    current_agent_id: str = Field(..., description="Active interviewer persona ID")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.MEDIUM, description="Current difficulty tier")
    evaluated_competencies: Dict[str, PerformanceRating] = Field(
        default_factory=dict, description="Cumulative competency ratings achieved so far"
    )
    accumulated_evidence: List[EvidenceItem] = Field(
        default_factory=list, description="All historical evidence collected across interview turns"
    )
    open_questions: List[str] = Field(default_factory=list, description="Pending or unaddressed questions")
    missing_competencies: List[str] = Field(
        default_factory=list, description="Required competencies that still lack sufficient evidence"
    )
    detected_contradictions: List[str] = Field(
        default_factory=list, description="Historical log of detected contradiction summaries"
    )


class AgentProfile(BaseModel):
    """Specification of a logical interviewer persona."""
    agent_id: str = Field(..., description="Unique persona ID, e.g., 'technical', 'product'")
    role: AgentRole = Field(..., description="Functional role of this persona")
    display_name: str = Field(..., description="Human-friendly persona name, e.g., 'Alex', 'Jordan'")
    description: str = Field(..., description="Brief description of persona focus")
    focal_competencies: List[str] = Field(..., description="List of competencies owned by this persona")
    questioning_style: str = Field(default="direct", description="Style descriptor, e.g., 'deep technical probe'")
    instructions: str = Field(default="", description="Base system instructions for this persona")
    min_difficulty: DifficultyLevel = Field(default=DifficultyLevel.EASY)
    max_difficulty: DifficultyLevel = Field(default=DifficultyLevel.HARD)
    allowed_actions: List[ActionType] = Field(
        default_factory=lambda: [ActionType.ASK_QUESTION, ActionType.SWITCH_AGENT, ActionType.COMPLETE]
    )


class CandidateProfileSummary(BaseModel):
    """Optional summarized context about candidate background/CV."""
    candidate_id: str
    full_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    key_skills: List[str] = Field(default_factory=list)
    summary_text: Optional[str] = None
