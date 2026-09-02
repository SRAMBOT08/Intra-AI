"""Hardening tests for FastAPI endpoints error handling and schema validation."""

from fastapi.testclient import TestClient

from src.api.intelligence_api import app as intelligence_app
from src.api.orchestrator_api import app as orchestrator_app
from src.intelligence.engine import InterviewIntelligenceEngine
from src.intelligence.llm_client import LLMProviderError, MockLLMClient
from src.intelligence.llm_evaluator import LLMAnswerEvaluator


def test_api_rejects_empty_target_competencies():
    client = TestClient(intelligence_app)
    payload = {
        "question": "How do you scale reads?",
        "candidate_answer": "We used Redis.",
        "target_competencies": [],  # Empty
        "answer_id": "ANS-001"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422


def test_api_rejects_missing_question():
    client = TestClient(intelligence_app)
    payload = {
        "candidate_answer": "We used Redis.",
        "target_competencies": ["system_design"],
        "answer_id": "ANS-001"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422


def test_api_rejects_invalid_enum_in_context():
    client = TestClient(orchestrator_app)
    payload = {
        "interview_context": {
            "interview_id": "INT-01",
            "candidate_id": "CAND-01",
            "current_round_id": "ROUND-01",
            "current_agent_id": "technical",
            "difficulty": "SUPER_HARD_INVALID_ENUM",
        },
        "required_competencies": ["system_design"]
    }
    response = client.post("/next-action", json=payload)
    assert response.status_code == 422


def test_api_returns_502_when_llm_provider_fails_without_fallback(monkeypatch):
    def failing_client(sys, user):
        raise LLMProviderError("Upstream LLM timeout")

    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(response_factory=failing_client),
        enable_fallback=False,
    )
    custom_engine = InterviewIntelligenceEngine(evaluator=evaluator)

    # Monkeypatch the module engine instance in intelligence_api
    import src.api.intelligence_api as intel_module
    monkeypatch.setattr(intel_module, "engine", custom_engine)

    client = TestClient(intel_module.app)
    payload = {
        "question": "How do you scale database reads?",
        "candidate_answer": "We used Redis.",
        "target_competencies": ["system_design"],
        "answer_id": "ANS-502-TEST"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 502
    assert "LLM provider unavailable" in response.json()["detail"]
