"""Comprehensive LangGraph Meta-Orchestrator test suite covering all decision branches."""

from src.domain.enums import (
    ActionType,
    DifficultyLevel,
    EvidenceStrength,
    PerformanceRating,
)
from src.domain.models import (
    AnswerAnalysis,
    CompetencyFinding,
    EvidenceItem,
    InterviewAIContext,
)
from src.orchestrator.graph import decide_next_action


def test_scenario_1_strong_technical_followup_scalability():
    """Scenario 1: Strong technical answer -> follow-up question for remaining technical gap."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
        evaluated_competencies={},
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.91,
        competency_findings=[
            CompetencyFinding(
                competency_id="system_design",
                assessment=PerformanceRating.STRONG,
                confidence=0.91,
            )
        ],
    )
    required = ["system_design", "scalability"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=analysis,
        required_competencies=required,
    )

    assert action.action == ActionType.ASK_QUESTION
    assert action.target_agent_id == "technical"
    assert action.competency_id == "scalability"
    assert action.difficulty == DifficultyLevel.HARD
    assert "scalability" in action.reason.lower()


def test_scenario_2_vague_answer_triggers_clarification():
    """Scenario 2: Vague answer -> stay with current agent and probe for specifics."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-002",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.5,
        vague=True,
        vague_reason="Did not provide concrete architectural details or trade-offs.",
    )
    required = ["system_design", "scalability"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=analysis,
        required_competencies=required,
        current_competency="system_design",
    )

    assert action.action == ActionType.ASK_QUESTION
    assert action.target_agent_id == "technical"
    assert action.competency_id == "system_design"
    assert "vague" in action.reason.lower()
    assert "specifics" in action.prompt_directive.lower() or "concrete" in action.prompt_directive.lower()


def test_scenario_3_contradictory_answer_triggers_clarification():
    """Scenario 3: Contradictory answer -> stay with current agent and probe discrepancy."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-003",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.88,
        contradiction_detected=True,
        contradiction_details="Claimed single-node earlier, now claimed sharded cluster.",
    )
    required = ["system_design", "scalability"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=analysis,
        required_competencies=required,
        current_competency="system_design",
    )

    assert action.action == ActionType.ASK_QUESTION
    assert action.target_agent_id == "technical"
    assert "contradicted" in action.reason.lower()
    assert "discrepancy" in action.prompt_directive.lower()


def test_scenario_4_technical_complete_handoff_to_product():
    """Scenario 4: Technical competencies complete + product missing -> SWITCH_AGENT to product."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
            "scalability": PerformanceRating.STRONG,
        },
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-004",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        competency_findings=[
            CompetencyFinding(
                competency_id="scalability",
                assessment=PerformanceRating.STRONG,
                confidence=0.92,
            )
        ],
    )
    required = ["system_design", "scalability", "customer_impact"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=analysis,
        required_competencies=required,
    )

    assert action.action == ActionType.SWITCH_AGENT
    assert action.target_agent_id == "product"
    assert action.competency_id == "customer_impact"
    assert action.handoff_transition_text is not None
    assert "Jordan" in action.handoff_transition_text
    assert "customer impact" in action.handoff_transition_text


def test_scenario_5_all_competencies_complete():
    """Scenario 5: All required competencies satisfied -> COMPLETE."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="product",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
            "scalability": PerformanceRating.STRONG,
        },
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-005",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.93,
        competency_findings=[
            CompetencyFinding(
                competency_id="customer_impact",
                assessment=PerformanceRating.STRONG,
                confidence=0.93,
            )
        ],
    )
    required = ["system_design", "scalability", "customer_impact"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=analysis,
        required_competencies=required,
    )

    assert action.action == ActionType.COMPLETE
    assert "evaluated satisfactorily" in action.reason.lower()


def test_scenario_6_multiple_missing_competencies_plan_priority():
    """Scenario 6: Multiple missing competencies -> strictly follows interview-plan order."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        evaluated_competencies={},
    )
    # 3 competencies in specific order
    required = ["scalability", "system_design", "customer_impact"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=None,
        required_competencies=required,
    )

    assert action.action == ActionType.ASK_QUESTION
    assert action.competency_id == "scalability"


def test_scenario_7_current_agent_owns_selected_gap():
    """Scenario 7: Current agent owns selected gap -> ASK_QUESTION."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="product",
        evaluated_competencies={},
    )
    required = ["customer_impact"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=None,
        required_competencies=required,
    )

    assert action.action == ActionType.ASK_QUESTION
    assert action.target_agent_id == "product"
    assert action.competency_id == "customer_impact"


def test_scenario_8_different_agent_owns_selected_gap():
    """Scenario 8: Different agent owns selected gap -> SWITCH_AGENT."""
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="product",
        evaluated_competencies={
            "customer_impact": PerformanceRating.STRONG,
        },
    )
    required = ["customer_impact", "system_design"]

    action = decide_next_action(
        interview_context=context,
        answer_analysis=None,
        required_competencies=required,
    )

    assert action.action == ActionType.SWITCH_AGENT
    assert action.target_agent_id == "technical"
    assert action.competency_id == "system_design"
    assert action.handoff_transition_text is not None
    assert "Alex" in action.handoff_transition_text
