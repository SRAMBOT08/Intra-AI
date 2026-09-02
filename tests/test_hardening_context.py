"""Hardening tests for ContextAccumulator idempotency and state safety."""

from src.domain.enums import DifficultyLevel, EvidenceStrength, PerformanceRating
from src.domain.models import (
    AnswerAnalysis,
    CompetencyFinding,
    EvidenceItem,
    InterviewAIContext,
)
from src.intelligence.context_accumulator import ContextAccumulator


def test_idempotent_duplicate_evidence_by_id():
    """Applying the exact same AnswerAnalysis twice does not duplicate evidence items."""
    context = InterviewAIContext(
        interview_id="INT-IDEMP-01",
        candidate_id="CAND-01",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
    )

    analysis = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
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

    # First turn accumulation
    context_turn1 = ContextAccumulator.accumulate(context, analysis)
    assert len(context_turn1.accumulated_evidence) == 1

    # Retry/duplicate accumulation
    context_retry = ContextAccumulator.accumulate(context_turn1, analysis)
    assert len(context_retry.accumulated_evidence) == 1


def test_idempotent_repeated_answer_different_evidence_id():
    """Identical answer re-processed with a new evidence_id is deduplicated by content signature."""
    context = InterviewAIContext(
        interview_id="INT-IDEMP-02",
        candidate_id="CAND-01",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
    )

    analysis_1 = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-RUN1-001",
                answer_id="ANS-001",
                competency_id="system_design",
                statement="Added Redis cache in front of Postgres.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )

    analysis_2 = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-RUN2-001",  # Different ID, same answer content
                answer_id="ANS-001",
                competency_id="system_design",
                statement="Added Redis cache in front of Postgres.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )

    c1 = ContextAccumulator.accumulate(context, analysis_1)
    assert len(c1.accumulated_evidence) == 1

    c2 = ContextAccumulator.accumulate(c1, analysis_2)
    assert len(c2.accumulated_evidence) == 1


def test_context_accumulator_preserves_routing_invariants():
    """ContextAccumulator must never modify current_agent_id, difficulty, or routing state."""
    initial_context = InterviewAIContext(
        interview_id="INT-INVARIANTS",
        candidate_id="CAND-999",
        current_round_id="ROUND-42",
        current_agent_id="technical",
        difficulty=DifficultyLevel.EASY,
        open_questions=["What about sharding?"],
    )

    analysis = AnswerAnalysis(
        answer_id="ANS-003",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.95,
        evidence=[],
        competency_findings=[],
    )

    updated = ContextAccumulator.accumulate(initial_context, analysis)

    assert updated.current_agent_id == "technical"
    assert updated.difficulty == DifficultyLevel.EASY
    assert updated.interview_id == "INT-INVARIANTS"
    assert updated.candidate_id == "CAND-999"
    assert updated.current_round_id == "ROUND-42"
    assert updated.open_questions == ["What about sharding?"]
