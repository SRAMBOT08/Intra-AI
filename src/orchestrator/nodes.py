"""LangGraph node implementations executing deterministic policies for interview decisions."""

from typing import Any, Dict

from src.domain.enums import ActionType
from src.domain.models import NextAction
from src.orchestrator.state import InterviewGraphState
from src.policies.action_validator import ActionValidator
from src.policies.agent_registry import DEFAULT_AGENT_REGISTRY
from src.policies.clarification_policy import ClarificationPolicy
from src.policies.completion_policy import CompletionPolicy
from src.policies.difficulty_policy import DifficultyPolicy
from src.policies.gap_prioritizer import GapPrioritizer
from src.policies.handoff_policy import HandoffPolicy


def validate_inputs_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Validate graph inputs and initialize intermediate state fields."""
    context = state.get("interview_context")
    if not context:
        raise ValueError("InterviewGraphState missing required 'interview_context'.")

    req_comps = state.get("required_competencies", [])
    current_agent = state.get("current_agent_id") or context.current_agent_id
    is_final = state.get("is_final_round", False)

    return {
        "required_competencies": req_comps,
        "current_agent_id": current_agent,
        "is_final_round": is_final,
        "execution_metadata": {"step": "validate_inputs", "initialized": True},
    }


def check_completion_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Check if all required competencies have satisfactory coverage."""
    context = state["interview_context"]
    analysis = state.get("answer_analysis")
    required = state.get("required_competencies", [])
    is_final = state.get("is_final_round", False)

    is_complete = CompletionPolicy.evaluate_completion(
        context=context,
        analysis=analysis,
        required_competencies=required,
        is_final_round=is_final,
    )

    if is_complete:
        return {
            "is_complete": True,
            "candidate_action": ActionType.COMPLETE,
            "target_agent_id": state.get("current_agent_id", context.current_agent_id),
            "target_competency_id": None,
            "decision_reason": "All required interview competencies have been evaluated satisfactorily or final round concluded.",
            "prompt_directive": "Conclude the interview gracefully and thank the candidate.",
            "handoff_transition_text": None,
        }

    return {"is_complete": False}


def check_clarification_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Check if the latest answer requires a clarifying probe due to vagueness or contradiction."""
    context = state["interview_context"]
    analysis = state.get("answer_analysis")
    curr_comp = state.get("current_competency")

    if not analysis:
        return {"requires_clarification": False}

    needed, reason, directive, comp = ClarificationPolicy.evaluate_clarification(
        context=context,
        analysis=analysis,
        current_competency=curr_comp,
    )

    if needed:
        return {
            "requires_clarification": True,
            "candidate_action": ActionType.ASK_QUESTION,
            "target_agent_id": state.get("current_agent_id", context.current_agent_id),
            "target_competency_id": comp,
            "decision_reason": reason or "Candidate response requires clarification.",
            "prompt_directive": directive,
            "handoff_transition_text": None,
        }

    return {"requires_clarification": False}


def prioritize_gaps_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Prioritize unresolved competency gaps following interview plan order."""
    context = state["interview_context"]
    analysis = state.get("answer_analysis")
    required = state.get("required_competencies", [])

    unresolved_gaps, selected_gap = GapPrioritizer.prioritize_gaps(
        context=context,
        analysis=analysis,
        required_competencies=required,
    )

    return {
        "unresolved_gaps": unresolved_gaps,
        "selected_gap": selected_gap,
    }


def resolve_competency_owner_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Determine persona ownership for the selected gap (ASK_QUESTION vs SWITCH_AGENT)."""
    selected_gap = state.get("selected_gap")
    current_agent_id = state.get("current_agent_id", state["interview_context"].current_agent_id)

    if not selected_gap:
        # Fallback if no specific gap
        return {
            "candidate_action": ActionType.ASK_QUESTION,
            "target_agent_id": current_agent_id,
            "target_competency_id": None,
            "decision_reason": "Continuing interview with current active interviewer.",
            "prompt_directive": "Continue the discussion and probe technical depth.",
            "handoff_transition_text": None,
        }

    action, target_id, comp, reason, directive, transition_text = HandoffPolicy.resolve_action_for_gap(
        selected_gap=selected_gap,
        current_agent_id=current_agent_id,
    )

    return {
        "candidate_action": action,
        "target_agent_id": target_id,
        "target_competency_id": comp,
        "decision_reason": reason,
        "prompt_directive": directive,
        "handoff_transition_text": transition_text,
    }


def apply_difficulty_or_fallback_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Adapt question difficulty tier based on performance trends and agent bounds."""
    context = state["interview_context"]
    analysis = state.get("answer_analysis")
    target_agent_id = state.get("target_agent_id") or context.current_agent_id
    target_profile = DEFAULT_AGENT_REGISTRY.get(target_agent_id)

    adapted_diff = DifficultyPolicy.adapt_difficulty(
        current_difficulty=context.difficulty,
        analysis=analysis,
        agent_profile=target_profile,
    )

    return {"target_difficulty": adapted_diff}


def validate_and_finalize_action_node(state: InterviewGraphState) -> Dict[str, Any]:
    """Construct, validate, and emit the final NextAction."""
    action_type = state.get("candidate_action", ActionType.ASK_QUESTION)
    target_agent = state.get("target_agent_id") or state["interview_context"].current_agent_id
    comp_id = state.get("target_competency_id")
    difficulty = state.get("target_difficulty")
    reason = state.get("decision_reason", "Proceeding with scheduled interview plan.")
    directive = state.get("prompt_directive")
    transition_text = state.get("handoff_transition_text")

    candidate_next_action = NextAction(
        action=action_type,
        target_agent_id=target_agent,
        competency_id=comp_id,
        difficulty=difficulty,
        reason=reason,
        prompt_directive=directive,
        handoff_transition_text=transition_text,
    )

    # Enforce domain invariants
    validated_action = ActionValidator.validate(candidate_next_action)

    return {"next_action": validated_action}
