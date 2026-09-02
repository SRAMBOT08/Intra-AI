"""End-to-end integration tests proving LLMAnswerEvaluator -> ContextAccumulator -> LangGraph Orchestrator pipeline."""

import json

from src.domain.enums import ActionType, DifficultyLevel, PerformanceRating
from src.domain.models import InterviewAIContext
from src.intelligence.context_accumulator import ContextAccumulator
from src.intelligence.llm_client import MockLLMClient
from src.intelligence.llm_evaluator import LLMAnswerEvaluator
from src.orchestrator.graph import decide_next_action


def test_e2e_llm_to_orchestrator_technical_to_product_handoff():
    """Prove canonical adaptive flow: LLM extracts evidence -> Context accumulated -> LangGraph returns SWITCH_AGENT."""
    # 1. Setup Initial State: Alex (Technical) has satisfied system_design
    initial_context = InterviewAIContext(
        interview_id="INT-E2E-LLM",
        candidate_id="CAND-777",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
        },
        accumulated_evidence=[],
        missing_competencies=["scalability", "customer_impact"],
    )
    required = ["system_design", "scalability", "customer_impact"]

    # 2. Mock LLM Response evaluating Alex's scalability question as STRONG
    mock_llm_scalability_response = json.dumps({
        "answer_id": "ANS-002",
        "overall_performance": "STRONG",
        "confidence": 0.95,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-002-001",
                "answer_id": "ANS-002",
                "competency_id": "scalability",
                "statement": "Architected multi-region auto-scaling clusters with Redis sharding to sustain 50,000 QPS.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "scalability",
                "assessment": "STRONG",
                "confidence": 0.95,
                "evidence_ids": ["EVID-ANS-002-001"]
            }
        ],
        "recommended_follow_up": "Explore business latency constraints."
    })

    llm_evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response=mock_llm_scalability_response)
    )

    # 3. LLM Evaluates Candidate Answer
    analysis = llm_evaluator.evaluate(
        question="How did you scale the system to handle peak loads?",
        candidate_answer="We deployed multi-region auto-scaling clusters with Redis sharding to handle 50k QPS.",
        target_competencies=["scalability"],
        interview_context=initial_context,
        answer_id="ANS-002",
    )

    assert analysis.overall_performance == PerformanceRating.STRONG
    assert len(analysis.evidence) == 1
    assert analysis.competency_findings[0].assessment == PerformanceRating.STRONG

    # 4. ContextAccumulator updates domain state
    updated_context = ContextAccumulator.accumulate(
        current_context=initial_context,
        analysis=analysis,
        required_competencies=required,
    )

    assert updated_context.evaluated_competencies["scalability"] == PerformanceRating.STRONG
    assert updated_context.missing_competencies == ["customer_impact"]
    assert len(updated_context.accumulated_evidence) == 1

    # 5. LangGraph Meta-Orchestrator decides NextAction
    next_action = decide_next_action(
        interview_context=updated_context,
        answer_analysis=analysis,
        required_competencies=required,
    )

    # 6. Verify Deterministic Routing: SWITCH_AGENT to Jordan for customer_impact
    assert next_action.action == ActionType.SWITCH_AGENT
    assert next_action.target_agent_id == "product"
    assert next_action.competency_id == "customer_impact"
    assert next_action.handoff_transition_text is not None
    assert "Jordan" in next_action.handoff_transition_text


def test_e2e_llm_vague_answer_triggers_clarification():
    """Prove vague LLM evaluation triggers LangGraph ASK_QUESTION clarification probe."""
    context = InterviewAIContext(
        interview_id="INT-E2E-VAGUE",
        candidate_id="CAND-777",
        current_round_id="ROUND-01",
        current_agent_id="technical",
        difficulty=DifficultyLevel.MEDIUM,
    )
    required = ["system_design", "scalability"]

    mock_vague_response = json.dumps({
        "answer_id": "ANS-VAGUE-1",
        "overall_performance": "WEAK",
        "confidence": 0.88,
        "vague": True,
        "vague_reason": "Answer did not specify database schema or caching layers, only claimed 'we made it fast'.",
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["system_design"],
        "evidence": [],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "WEAK",
                "confidence": 0.88,
                "evidence_ids": []
            }
        ],
        "recommended_follow_up": "Probe for concrete architectural specifics."
    })

    llm_evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response=mock_vague_response)
    )

    analysis = llm_evaluator.evaluate(
        question="How do you architect the database layer?",
        candidate_answer="We made it fast using best practices.",
        target_competencies=["system_design"],
        interview_context=context,
        answer_id="ANS-VAGUE-1",
    )

    updated_context = ContextAccumulator.accumulate(
        current_context=context,
        analysis=analysis,
        required_competencies=required,
    )

    next_action = decide_next_action(
        interview_context=updated_context,
        answer_analysis=analysis,
        required_competencies=required,
        current_competency="system_design",
    )

    assert next_action.action == ActionType.ASK_QUESTION
    assert next_action.target_agent_id == "technical"
    assert "vague" in next_action.reason.lower()


def test_e2e_llm_all_competencies_complete():
    """Prove completion when all required competencies are satisfied."""
    context = InterviewAIContext(
        interview_id="INT-E2E-COMP",
        candidate_id="CAND-777",
        current_round_id="ROUND-01",
        current_agent_id="product",
        evaluated_competencies={
            "system_design": PerformanceRating.STRONG,
            "scalability": PerformanceRating.STRONG,
        },
    )
    required = ["system_design", "scalability", "customer_impact"]

    mock_product_response = json.dumps({
        "answer_id": "ANS-PROD-1",
        "overall_performance": "STRONG",
        "confidence": 0.94,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-PROD-01",
                "answer_id": "ANS-PROD-1",
                "competency_id": "customer_impact",
                "statement": "Drove 18% lift in checkout conversion and reduced cart abandonment by improving p95 response time to 180ms.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "customer_impact",
                "assessment": "STRONG",
                "confidence": 0.94,
                "evidence_ids": ["EVID-PROD-01"]
            }
        ],
        "recommended_follow_up": None
    })

    llm_evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response=mock_product_response)
    )

    analysis = llm_evaluator.evaluate(
        question="What was the user and business outcome?",
        candidate_answer="We drove an 18% lift in conversion by dropping latency to 180ms.",
        target_competencies=["customer_impact"],
        interview_context=context,
        answer_id="ANS-PROD-1",
    )

    updated_context = ContextAccumulator.accumulate(
        current_context=context,
        analysis=analysis,
        required_competencies=required,
    )

    next_action = decide_next_action(
        interview_context=updated_context,
        answer_analysis=analysis,
        required_competencies=required,
    )

    assert next_action.action == ActionType.COMPLETE
    assert "evaluated satisfactorily" in next_action.reason.lower()
