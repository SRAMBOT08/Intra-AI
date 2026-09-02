"""Unit tests for domain models and enums."""

import pytest
from pydantic import ValidationError

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


def test_evidence_item_creation():
    item = EvidenceItem(
        evidence_id="EVID-001",
        answer_id="ANS-101",
        competency_id="system_design",
        statement="Used Redis cache in front of Postgres to reduce DB read latency.",
        strength=EvidenceStrength.STRONG,
    )
    assert item.evidence_id == "EVID-001"
    assert item.strength == EvidenceStrength.STRONG
    assert item.timestamp is not None


def test_competency_finding_validation():
    finding = CompetencyFinding(
        competency_id="system_design",
        assessment=PerformanceRating.STRONG,
        confidence=0.95,
        evidence_ids=["EVID-001"],
    )
    assert finding.competency_id == "system_design"
    assert finding.assessment == PerformanceRating.STRONG
    assert finding.confidence == 0.95

    # Test confidence bounds
    with pytest.raises(ValidationError):
        CompetencyFinding(
            competency_id="system_design",
            assessment=PerformanceRating.STRONG,
            confidence=1.5,
        )


def test_answer_analysis_serialization():
    item = EvidenceItem(
        evidence_id="EVID-001",
        answer_id="ANS-101",
        competency_id="system_design",
        statement="Used Redis for caching.",
        strength=EvidenceStrength.STRONG,
    )
    finding = CompetencyFinding(
        competency_id="system_design",
        assessment=PerformanceRating.STRONG,
        confidence=0.9,
        evidence_ids=["EVID-001"],
    )
    analysis = AnswerAnalysis(
        answer_id="ANS-101",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.9,
        vague=False,
        evidence=[item],
        competency_findings=[finding],
        missing_information=["customer_impact"],
        recommended_follow_up="Explore customer impact metrics.",
    )

    data = analysis.model_dump()
    assert data["answer_id"] == "ANS-101"
    assert data["overall_performance"] == "STRONG"
    assert len(data["evidence"]) == 1
    assert data["missing_information"] == ["customer_impact"]


def test_next_action_creation():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id="product",
        competency_id="customer_impact",
        difficulty=DifficultyLevel.MEDIUM,
        reason="Technical coverage satisfied; switching to Product Lead.",
        prompt_directive="Probe business impact.",
        handoff_transition_text="Handing over to Jordan.",
    )
    assert action.action == ActionType.SWITCH_AGENT
    assert action.target_agent_id == "product"
    assert action.difficulty == DifficultyLevel.MEDIUM


def test_interview_ai_context_defaults():
    context = InterviewAIContext(
        interview_id="INT-001",
        candidate_id="CAND-001",
        current_round_id="ROUND-001",
        current_agent_id="technical",
    )
    assert context.difficulty == DifficultyLevel.MEDIUM
    assert context.evaluated_competencies == {}
    assert context.accumulated_evidence == []
    assert context.missing_competencies == []


def test_agent_profile_defaults():
    profile = AgentProfile(
        agent_id="technical",
        role=AgentRole.TECHNICAL_INTERVIEWER,
        display_name="Alex",
        description="Assesses engineering design and scalability.",
        focal_competencies=["system_design", "scalability"],
        questioning_style="deep technical probe",
        instructions="Focus on architecture and trade-offs.",
    )
    assert profile.agent_id == "technical"
    assert profile.role == AgentRole.TECHNICAL_INTERVIEWER
    assert len(profile.allowed_actions) == 3
