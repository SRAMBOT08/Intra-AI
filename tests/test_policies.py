"""Unit tests for EchoSphere decision and routing policies."""

import pytest

from src.domain.enums import (
    ActionType,
    AgentRole,
    DifficultyLevel,
    EvidenceStrength,
    PerformanceRating,
)
from src.domain.models import (
    AgentProfile,
    AnswerAnalysis,
    CompetencyFinding,
    EvidenceItem,
    InterviewAIContext,
    NextAction,
)
from src.policies.action_validator import ActionValidator
from src.policies.agent_registry import DEFAULT_AGENT_REGISTRY, AgentRegistry
from src.policies.clarification_policy import ClarificationPolicy
from src.policies.completion_policy import CompletionPolicy
from src.policies.difficulty_policy import DifficultyPolicy
from src.policies.gap_prioritizer import GapPrioritizer
from src.policies.handoff_policy import HandoffPolicy
from src.policies.transition_builder import TransitionBuilder


# ==========================================
# TransitionBuilder Tests
# ==========================================

def test_transition_technical_to_product():
    alex = DEFAULT_AGENT_REGISTRY.get("technical")
    jordan = DEFAULT_AGENT_REGISTRY.get("product")
    
    text = TransitionBuilder.build_transition(
        current_agent=alex,
        target_agent=jordan,
        competency_id="customer_impact",
    )
    assert "Thank you for walking through the technical architecture." in text
    assert "Jordan" in text
    assert "customer impact" in text


def test_transition_generic_persona():
    custom_curr = AgentProfile(
        agent_id="system_architect",
        role=AgentRole.SYSTEM_DESIGNER,
        display_name="Morgan",
        description="Architecture specialist",
        focal_competencies=["distributed_systems"],
    )
    custom_target = AgentProfile(
        agent_id="hiring_manager",
        role=AgentRole.HIRING_MANAGER,
        display_name="Taylor",
        description="Leadership lead",
        focal_competencies=["leadership"],
    )

    text = TransitionBuilder.build_transition(
        current_agent=custom_curr,
        target_agent=custom_target,
        competency_id="leadership",
    )
    assert "Taylor" in text
    assert "Hiring Manager" in text
    assert "leadership" in text


def test_transition_missing_target_agent():
    alex = DEFAULT_AGENT_REGISTRY.get("technical")
    text = TransitionBuilder.build_transition(
        current_agent=alex,
        target_agent=None,
        competency_id="scalability",
    )
    assert "scalability" in text
    assert "Let's move on to the next section" in text


def test_transition_missing_competency():
    alex = DEFAULT_AGENT_REGISTRY.get("technical")
    text = TransitionBuilder.build_transition(
        current_agent=alex,
        target_agent=None,
        competency_id=None,
    )
    assert "Let's proceed to the next part of our interview." in text


# ==========================================
# AgentRegistry Tests
# ==========================================

def test_agent_registry_lookup():
    reg = DEFAULT_AGENT_REGISTRY
    assert reg.get("technical") is not None
    assert reg.get("product") is not None
    assert reg.get("nonexistent") is None

    # Competency ownership lookup
    owner_sys = reg.get_owner_for_competency("system_design")
    assert owner_sys is not None
    assert owner_sys.agent_id == "technical"

    owner_cust = reg.get_owner_for_competency("customer_impact")
    assert owner_cust is not None
    assert owner_cust.agent_id == "product"


# ==========================================
# CompletionPolicy Tests
# ==========================================

def test_completion_policy_all_satisfied():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
            "scalability": PerformanceRating.PARTIAL,
        },
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-1",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.9,
        competency_findings=[
            CompetencyFinding(
                competency_id="customer_impact",
                assessment=PerformanceRating.STRONG,
                confidence=0.9,
            )
        ],
    )
    required = ["system_design", "scalability", "customer_impact"]
    assert CompletionPolicy.evaluate_completion(context, analysis, required, is_final_round=False) is True


def test_completion_policy_missing_competency():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
        },
    )
    required = ["system_design", "scalability", "customer_impact"]
    assert CompletionPolicy.evaluate_completion(context, None, required, is_final_round=False) is False


def test_completion_policy_final_round():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
        },
    )
    required = ["system_design", "scalability", "customer_impact"]
    assert CompletionPolicy.evaluate_completion(context, None, required, is_final_round=True) is True


# ==========================================
# ClarificationPolicy Tests
# ==========================================

def test_clarification_policy_vague():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-1",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.5,
        vague=True,
        vague_reason="Did not specify cache invalidation strategy.",
    )
    needed, reason, directive, comp = ClarificationPolicy.evaluate_clarification(
        context, analysis, current_competency="system_design"
    )
    assert needed is True
    assert "vague" in reason
    assert "cache invalidation" in directive


def test_clarification_policy_contradiction():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-1",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.8,
        contradiction_detected=True,
        contradiction_details="Previously stated PostgreSQL was single node, now claimed sharded Aurora.",
    )
    needed, reason, directive, comp = ClarificationPolicy.evaluate_clarification(
        context, analysis, current_competency="system_design"
    )
    assert needed is True
    assert "contradicted" in reason
    assert "discrepancy" in directive


def test_clarification_policy_clear():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-1",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.9,
        vague=False,
        contradiction_detected=False,
    )
    needed, reason, directive, comp = ClarificationPolicy.evaluate_clarification(
        context, analysis, current_competency="system_design"
    )
    assert needed is False


# ==========================================
# GapPrioritizer Tests
# ==========================================

def test_gap_prioritizer_order():
    context = InterviewAIContext(
        interview_id="INT-1",
        candidate_id="CAND-1",
        current_round_id="R1",
        current_agent_id="technical",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
        },
    )
    required = ["system_design", "scalability", "customer_impact"]
    gaps, selected = GapPrioritizer.prioritize_gaps(context, None, required)
    assert gaps == ["scalability", "customer_impact"]
    assert selected == "scalability"


# ==========================================
# HandoffPolicy Tests
# ==========================================

def test_handoff_policy_same_agent():
    action, target, comp, reason, directive, transition = HandoffPolicy.resolve_action_for_gap(
        selected_gap="scalability",
        current_agent_id="technical",
    )
    assert action == ActionType.ASK_QUESTION
    assert target == "technical"
    assert comp == "scalability"
    assert transition is None


def test_handoff_policy_switch_agent():
    action, target, comp, reason, directive, transition = HandoffPolicy.resolve_action_for_gap(
        selected_gap="customer_impact",
        current_agent_id="technical",
    )
    assert action == ActionType.SWITCH_AGENT
    assert target == "product"
    assert comp == "customer_impact"
    assert transition is not None
    assert "Jordan" in transition


# ==========================================
# DifficultyPolicy Tests
# ==========================================

def test_difficulty_policy_adaptation():
    alex = DEFAULT_AGENT_REGISTRY.get("technical")
    
    # Step up on strong
    analysis_strong = AnswerAnalysis(
        answer_id="A1",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.9,
    )
    diff = DifficultyPolicy.adapt_difficulty(DifficultyLevel.EASY, analysis_strong, alex)
    assert diff == DifficultyLevel.MEDIUM

    # Step down on weak
    analysis_weak = AnswerAnalysis(
        answer_id="A2",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.5,
    )
    diff = DifficultyPolicy.adapt_difficulty(DifficultyLevel.HARD, analysis_weak, alex)
    assert diff == DifficultyLevel.MEDIUM


# ==========================================
# ActionValidator Tests
# ==========================================

def test_action_validator_valid():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id="product",
        competency_id="customer_impact",
        difficulty=DifficultyLevel.MEDIUM,
        reason="Switch to Jordan.",
        prompt_directive="Probe customer impact.",
        handoff_transition_text="Handing over to Jordan.",
    )
    validated = ActionValidator.validate(action)
    assert validated == action


def test_action_validator_invalid_switch_missing_text():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id="product",
        competency_id="customer_impact",
        reason="Switch to Jordan.",
        handoff_transition_text="",
    )
    with pytest.raises(ValueError, match="handoff_transition_text"):
        ActionValidator.validate(action)


def test_action_validator_invalid_unknown_agent():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id="nonexistent_agent",
        reason="Switch to unknown.",
        handoff_transition_text="Transition text",
    )
    with pytest.raises(ValueError, match="not a registered agent"):
        ActionValidator.validate(action)
