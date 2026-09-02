"""LangGraph Meta-Orchestrator definition and compilation."""

from typing import List, Optional
from langgraph.graph import END, START, StateGraph

from src.domain.models import AnswerAnalysis, InterviewAIContext, NextAction
from src.orchestrator.nodes import (
    apply_difficulty_or_fallback_node,
    check_clarification_node,
    check_completion_node,
    prioritize_gaps_node,
    resolve_competency_owner_node,
    validate_and_finalize_action_node,
    validate_inputs_node,
)
from src.orchestrator.state import InterviewGraphState


def create_meta_orchestrator_graph():
    """Build and compile the LangGraph Meta-Orchestrator decision graph."""
    builder = StateGraph(InterviewGraphState)

    # 1. Add Nodes
    builder.add_node("validate_inputs", validate_inputs_node)
    builder.add_node("check_completion", check_completion_node)
    builder.add_node("check_clarification_or_vagueness", check_clarification_node)
    builder.add_node("prioritize_gaps", prioritize_gaps_node)
    builder.add_node("resolve_competency_owner", resolve_competency_owner_node)
    builder.add_node("apply_difficulty_or_fallback", apply_difficulty_or_fallback_node)
    builder.add_node("validate_and_finalize_action", validate_and_finalize_action_node)

    # 2. Add Flow Edges
    builder.add_edge(START, "validate_inputs")
    builder.add_edge("validate_inputs", "check_completion")

    # Branch 1: If complete, skip to finalize; else check clarification
    def route_completion(state: InterviewGraphState) -> str:
        if state.get("is_complete"):
            return "apply_difficulty_or_fallback"
        return "check_clarification_or_vagueness"

    builder.add_conditional_edges(
        "check_completion",
        route_completion,
        {
            "apply_difficulty_or_fallback": "apply_difficulty_or_fallback",
            "check_clarification_or_vagueness": "check_clarification_or_vagueness",
        },
    )

    # Branch 2: If clarification needed, skip to finalize; else prioritize gaps
    def route_clarification(state: InterviewGraphState) -> str:
        if state.get("requires_clarification"):
            return "apply_difficulty_or_fallback"
        return "prioritize_gaps"

    builder.add_conditional_edges(
        "check_clarification_or_vagueness",
        route_clarification,
        {
            "apply_difficulty_or_fallback": "apply_difficulty_or_fallback",
            "prioritize_gaps": "prioritize_gaps",
        },
    )

    # Branch 3: If gap selected, resolve owner; else fallback
    def route_gap(state: InterviewGraphState) -> str:
        if state.get("selected_gap"):
            return "resolve_competency_owner"
        return "apply_difficulty_or_fallback"

    builder.add_conditional_edges(
        "prioritize_gaps",
        route_gap,
        {
            "resolve_competency_owner": "resolve_competency_owner",
            "apply_difficulty_or_fallback": "apply_difficulty_or_fallback",
        },
    )

    builder.add_edge("resolve_competency_owner", "apply_difficulty_or_fallback")
    builder.add_edge("apply_difficulty_or_fallback", "validate_and_finalize_action")
    builder.add_edge("validate_and_finalize_action", END)

    return builder.compile()


# Compiled Singleton Graph Instance
META_ORCHESTRATOR_GRAPH = create_meta_orchestrator_graph()


def decide_next_action(
    interview_context: InterviewAIContext,
    answer_analysis: Optional[AnswerAnalysis] = None,
    required_competencies: Optional[List[str]] = None,
    is_final_round: bool = False,
    current_competency: Optional[str] = None,
) -> NextAction:
    """Convenience runner executing the LangGraph Meta-Orchestrator to produce NextAction."""
    initial_state: InterviewGraphState = {
        "interview_context": interview_context,
        "answer_analysis": answer_analysis,
        "required_competencies": required_competencies or [],
        "is_final_round": is_final_round,
        "current_agent_id": interview_context.current_agent_id,
        "current_competency": current_competency,
    }

    final_state = META_ORCHESTRATOR_GRAPH.invoke(initial_state)
    return final_state["next_action"]
