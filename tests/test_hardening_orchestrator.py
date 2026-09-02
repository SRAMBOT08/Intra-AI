"""Hardening tests for Meta-Orchestrator action validation and failure safety."""

import pytest

from src.domain.enums import ActionType
from src.domain.models import InterviewAIContext, NextAction
from src.orchestrator.graph import decide_next_action
from src.policies.action_validator import ActionValidator


def test_action_validator_rejects_empty_reason():
    action = NextAction(
        action=ActionType.ASK_QUESTION,
        target_agent_id="technical",
        competency_id="system_design",
        reason="   ",
        prompt_directive="Probe caching.",
    )
    with pytest.raises(ValueError, match="non-empty reason"):
        ActionValidator.validate(action)


def test_action_validator_rejects_switch_without_target_agent():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id=None,
        reason="Switch agent",
        handoff_transition_text="Handing over to Jordan.",
    )
    with pytest.raises(ValueError, match="target_agent_id"):
        ActionValidator.validate(action)


def test_action_validator_rejects_unregistered_agent():
    action = NextAction(
        action=ActionType.SWITCH_AGENT,
        target_agent_id="non_existent_persona",
        competency_id="customer_impact",
        reason="Switch agent",
        handoff_transition_text="Handing over",
    )
    with pytest.raises(ValueError, match="not a registered agent"):
        ActionValidator.validate(action)


def test_orchestrator_handles_empty_required_competencies_gracefully():
    """Empty required competencies list immediately completes interview safely."""
    context = InterviewAIContext(
        interview_id="INT-EMPTY-COMP",
        candidate_id="CAND-001",
        current_round_id="ROUND-01",
        current_agent_id="technical",
    )

    action = decide_next_action(
        interview_context=context,
        answer_analysis=None,
        required_competencies=[],
    )

    assert action.action == ActionType.COMPLETE
    assert action.reason is not None
