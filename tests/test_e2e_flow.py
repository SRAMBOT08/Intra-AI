"""End-to-end integration tests simulating complete multi-turn adaptive interview flows."""

from src.domain.enums import ActionType, DifficultyLevel, PerformanceRating
from src.domain.models import InterviewAIContext
from src.intelligence.engine import InterviewIntelligenceEngine
from src.orchestrator.graph import decide_next_action


def test_full_adaptive_interview_lifecycle():
    """Simulate a complete 3-turn interview lifecycle across Technical and Product personas."""
    intelligence = InterviewIntelligenceEngine()
    required_competencies = ["system_design", "scalability", "customer_impact"]

    # =========================================================================
    # Turn 1: Alex asks initial system design question
    # =========================================================================
    context = InterviewAIContext(
        interview_id="INT-E2E-001",
        candidate_id="CAND-999",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
        evaluated_competencies={},
        accumulated_evidence=[],
        missing_competencies=list(required_competencies),
    )

    q1 = "How do you design your caching layer and primary database integration?"
    a1 = "We placed Redis in front of PostgreSQL with write-through caching to accelerate frequent read queries."

    analysis_1 = intelligence.analyze(
        question=q1,
        candidate_answer=a1,
        target_competencies=["system_design"],
        interview_context=context,
        answer_id="ANS-001",
    )

    assert analysis_1.overall_performance == PerformanceRating.STRONG
    assert len(analysis_1.evidence) >= 1

    action_1 = decide_next_action(
        interview_context=context,
        answer_analysis=analysis_1,
        required_competencies=required_competencies,
    )

    # Expected: Alex stays on to probe remaining technical gap (scalability)
    assert action_1.action == ActionType.ASK_QUESTION
    assert action_1.target_agent_id == "technical"
    assert action_1.competency_id == "scalability"
    assert action_1.difficulty == DifficultyLevel.HARD

    # Update context for Turn 2
    context.accumulated_evidence.extend(analysis_1.evidence)
    for finding in analysis_1.competency_findings:
        context.evaluated_competencies[finding.competency_id] = finding.assessment
    context.difficulty = action_1.difficulty or context.difficulty

    # =========================================================================
    # Turn 2: Alex probes scalability; candidate gives strong answer
    # =========================================================================
    q2 = "How did you scale this to handle 50,000 requests per second under peak load?"
    a2 = "We added horizontal auto-scaling on ECS, configured Redis cluster with 3 shards, and implemented connection pooling with PgBouncer."

    analysis_2 = intelligence.analyze(
        question=q2,
        candidate_answer=a2,
        target_competencies=["scalability"],
        interview_context=context,
        answer_id="ANS-002",
    )

    assert analysis_2.overall_performance == PerformanceRating.STRONG

    action_2 = decide_next_action(
        interview_context=context,
        answer_analysis=analysis_2,
        required_competencies=required_competencies,
    )

    # Expected: Technical complete -> handoff to Jordan (Product Lead) for customer_impact
    assert action_2.action == ActionType.SWITCH_AGENT
    assert action_2.target_agent_id == "product"
    assert action_2.competency_id == "customer_impact"
    assert action_2.handoff_transition_text is not None
    assert "Jordan" in action_2.handoff_transition_text

    # Update context for Turn 3
    context.current_agent_id = action_2.target_agent_id
    context.accumulated_evidence.extend(analysis_2.evidence)
    for finding in analysis_2.competency_findings:
        context.evaluated_competencies[finding.competency_id] = finding.assessment

    # =========================================================================
    # Turn 3: Jordan probes customer impact; candidate gives strong answer
    # =========================================================================
    q3 = "What was the direct impact on user conversion and checkout latency?"
    a3 = "Checkout drop-off decreased by 18%, and the 99th percentile page load dropped from 1.2s to 180ms, significantly improving user retention."

    analysis_3 = intelligence.analyze(
        question=q3,
        candidate_answer=a3,
        target_competencies=["customer_impact"],
        interview_context=context,
        answer_id="ANS-003",
    )

    assert analysis_3.overall_performance == PerformanceRating.STRONG

    action_3 = decide_next_action(
        interview_context=context,
        answer_analysis=analysis_3,
        required_competencies=required_competencies,
    )

    # Expected: All 3 competencies satisfied -> COMPLETE interview
    assert action_3.action == ActionType.COMPLETE
    assert "evaluated satisfactorily" in action_3.reason.lower()
