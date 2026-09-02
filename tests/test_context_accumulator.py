"""Unit tests for ContextAccumulator pure state management."""

from src.domain.enums import DifficultyLevel, EvidenceStrength, PerformanceRating
from src.domain.models import (
    AnswerAnalysis,
    CompetencyFinding,
    EvidenceItem,
    InterviewAIContext,
)
from src.intelligence.context_accumulator import ContextAccumulator


def test_accumulate_evidence_and_competencies():
    initial_context = InterviewAIContext(
        interview_id="INT-100",
        candidate_id="CAND-001",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
        evaluated_competencies={},
        accumulated_evidence=[],
        missing_competencies=["system_design", "scalability", "customer_impact"],
    )

    analysis_turn1 = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        vague=False,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-001",
                answer_id="ANS-001",
                competency_id="system_design",
                statement="Added Redis cache in front of Postgres.",
                strength=EvidenceStrength.STRONG,
            )
        ],
        competency_findings=[
            CompetencyFinding(
                competency_id="system_design",
                assessment=PerformanceRating.STRONG,
                confidence=0.92,
                evidence_ids=["EVID-001"],
            )
        ],
    )

    updated_context = ContextAccumulator.accumulate(
        current_context=initial_context,
        analysis=analysis_turn1,
        required_competencies=["system_design", "scalability", "customer_impact"],
    )

    # Check evidence accumulated
    assert len(updated_context.accumulated_evidence) == 1
    assert updated_context.accumulated_evidence[0].evidence_id == "EVID-001"

    # Check evaluated competencies
    assert updated_context.evaluated_competencies.get("system_design") == PerformanceRating.STRONG

    # Check missing competencies updated (system_design removed from missing)
    assert "system_design" not in updated_context.missing_competencies
    assert "scalability" in updated_context.missing_competencies
    assert "customer_impact" in updated_context.missing_competencies

    # Check that ContextAccumulator did NOT alter routing state
    assert updated_context.current_agent_id == "technical"
    assert updated_context.difficulty == DifficultyLevel.MEDIUM


def test_accumulate_contradictions():
    context = InterviewAIContext(
        interview_id="INT-100",
        candidate_id="CAND-001",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        detected_contradictions=[],
    )

    analysis_contra = AnswerAnalysis(
        answer_id="ANS-002",
        overall_performance=PerformanceRating.WEAK,
        confidence=0.90,
        contradiction_detected=True,
        contradiction_details="Stated MongoDB earlier, now stated strictly relational Postgres.",
    )

    updated_context = ContextAccumulator.accumulate(
        current_context=context,
        analysis=analysis_contra,
    )

    assert len(updated_context.detected_contradictions) == 1
    assert "MongoDB earlier" in updated_context.detected_contradictions[0]
