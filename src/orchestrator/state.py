"""Transient graph state definition for the LangGraph Meta-Orchestrator."""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

from src.domain.enums import ActionType, DifficultyLevel
from src.domain.models import AnswerAnalysis, InterviewAIContext, NextAction


class InterviewGraphState(TypedDict, total=False):
    """Transient execution state for the LangGraph decision workflow."""

    # Inputs
    interview_context: InterviewAIContext
    answer_analysis: Optional[AnswerAnalysis]
    required_competencies: List[str]
    is_final_round: bool
    current_agent_id: str
    current_competency: Optional[str]

    # Intermediate evaluation flags and routing
    is_complete: bool
    requires_clarification: bool
    unresolved_gaps: List[str]
    selected_gap: Optional[str]

    # Candidate action parameters
    candidate_action: ActionType
    target_agent_id: Optional[str]
    target_competency_id: Optional[str]
    target_difficulty: Optional[DifficultyLevel]
    decision_reason: str
    prompt_directive: Optional[str]
    handoff_transition_text: Optional[str]

    # Authoritative Output
    next_action: NextAction
    execution_metadata: Dict[str, Any]
