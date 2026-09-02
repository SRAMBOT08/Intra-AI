"""Hardening tests for LLMAnswerEvaluator and HTTPLLMClient resilience."""

import json
import pytest

from src.domain.enums import PerformanceRating
from src.intelligence.llm_client import HTTPLLMClient, LLMProviderError, MockLLMClient
from src.intelligence.llm_evaluator import LLMAnswerEvaluator


def test_llm_provider_error_with_fallback_enabled():
    """When LLM provider fails and fallback is enabled, evaluator falls back to deterministic analysis."""
    def broken_client(sys, user):
        raise LLMProviderError("Connection refused by upstream endpoint")

    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(response_factory=broken_client),
        enable_fallback=True,
    )

    analysis = evaluator.evaluate(
        question="How do you scale high-throughput API endpoints?",
        candidate_answer="We added Redis in front of PostgreSQL and implemented write-through caching.",
        target_competencies=["system_design"],
        answer_id="ANS-FALLBACK-01",
    )

    assert analysis.answer_id == "ANS-FALLBACK-01"
    assert analysis.overall_performance in (PerformanceRating.STRONG, PerformanceRating.PARTIAL)
    assert len(analysis.evidence) >= 1


def test_llm_provider_error_with_fallback_disabled_raises():
    """When LLM provider fails and fallback is disabled, evaluator raises LLMProviderError."""
    def broken_client(sys, user):
        raise LLMProviderError("Connection timeout")

    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(response_factory=broken_client),
        enable_fallback=False,
    )

    with pytest.raises(LLMProviderError, match="failed without fallback"):
        evaluator.evaluate(
            question="How do you scale database reads?",
            candidate_answer="We added Redis caching.",
            target_competencies=["system_design"],
            answer_id="ANS-FAIL-01",
        )


def test_llm_malformed_json_triggers_fallback():
    """When LLM outputs non-JSON garbage, fallback evaluator recovers cleanly."""
    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response="<html>502 Bad Gateway</html>"),
        enable_fallback=True,
    )

    analysis = evaluator.evaluate(
        question="How do you scale database reads?",
        candidate_answer="We added Redis in front of PostgreSQL with write-through caching.",
        target_competencies=["system_design"],
        answer_id="ANS-GARBAGE-01",
    )

    assert analysis.answer_id == "ANS-GARBAGE-01"
    assert len(analysis.evidence) >= 1


def test_llm_unexpected_extra_fields_handled():
    """LLM returning extra unstructured keys does not break AnswerAnalysis validation."""
    mock_payload = json.dumps({
        "answer_id": "ANS-EXTRA-01",
        "overall_performance": "STRONG",
        "confidence": 0.92,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-01",
                "answer_id": "ANS-EXTRA-01",
                "competency_id": "system_design",
                "statement": "Used Redis cluster with 3 shards.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z",
                "extra_debug_field": "some_model_internal_token"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "STRONG",
                "confidence": 0.92,
                "evidence_ids": ["EVID-01"],
                "extra_reasoning_trace": "Candidate was articulate"
            }
        ],
        "recommended_follow_up": "Probe cache invalidation.",
        "arbitrary_meta_key": 12345
    })

    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response=mock_payload),
        enable_fallback=False,
    )

    analysis = evaluator.evaluate(
        question="How do you scale database reads?",
        candidate_answer="Used Redis cluster with 3 shards.",
        target_competencies=["system_design"],
        answer_id="ANS-EXTRA-01",
    )

    assert analysis.overall_performance == PerformanceRating.STRONG
    assert analysis.confidence == 0.92


def test_http_llm_client_missing_key_raises_cleanly():
    """HTTPLLMClient without API key raises LLMProviderError without leaking secrets."""
    client = HTTPLLMClient(api_key="")
    with pytest.raises(LLMProviderError, match="LLM API key not configured"):
        client.generate("system prompt", "user prompt")
