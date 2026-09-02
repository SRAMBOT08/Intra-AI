"""Contract tests for REST APIs exposed on Port 4005 and Port 4004."""

from fastapi.testclient import TestClient

from src.api.intelligence_api import app as intelligence_app
from src.api.orchestrator_api import app as orchestrator_app


def test_intelligence_health_endpoint():
    client = TestClient(intelligence_app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "interview-intelligence"
    assert data["port"] == 4005


def test_intelligence_analyze_endpoint():
    client = TestClient(intelligence_app)
    payload = {
        "question": "How do you scale high-throughput API endpoints?",
        "candidate_answer": "We added Redis in front of PostgreSQL and implemented write-through caching.",
        "target_competencies": ["system_design", "scalability"],
        "interview_context": {
            "interview_id": "INT-101",
            "candidate_id": "CAND-505",
            "current_round_id": "ROUND-001",
            "current_agent_id": "technical",
            "difficulty": "MEDIUM",
            "evaluated_competencies": {},
            "accumulated_evidence": [],
            "open_questions": [],
            "missing_competencies": ["system_design", "scalability"],
            "detected_contradictions": [],
        },
        "answer_id": "ANS-001",
        "candidate_profile_summary": None,
    }

    # Test main endpoint
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["answer_id"] == "ANS-001"
    assert data["overall_performance"] in ("STRONG", "PARTIAL")
    assert len(data["evidence"]) >= 1
    assert len(data["competency_findings"]) >= 1

    # Test versioned alias
    alias_response = client.post("/v1/interview-intelligence/analyze", json=payload)
    assert alias_response.status_code == 200
    assert alias_response.json()["answer_id"] == "ANS-001"


def test_orchestrator_health_endpoint():
    client = TestClient(orchestrator_app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "meta-orchestrator"
    assert data["port"] == 4004


def test_orchestrator_next_action_endpoint():
    client = TestClient(orchestrator_app)
    payload = {
        "interview_context": {
            "interview_id": "INT-101",
            "candidate_id": "CAND-505",
            "current_round_id": "ROUND-001",
            "current_agent_id": "technical",
            "difficulty": "MEDIUM",
            "evaluated_competencies": {
                "system_design": "STRONG",
                "scalability": "STRONG",
            },
            "accumulated_evidence": [],
            "open_questions": [],
            "missing_competencies": ["customer_impact"],
            "detected_contradictions": [],
        },
        "answer_analysis": {
            "answer_id": "ANS-001",
            "overall_performance": "STRONG",
            "confidence": 0.91,
            "vague": False,
            "vague_reason": None,
            "contradiction_detected": False,
            "contradiction_details": None,
            "missing_information": ["customer_impact"],
            "evidence": [],
            "competency_findings": [
                {
                    "competency_id": "scalability",
                    "assessment": "STRONG",
                    "confidence": 0.91,
                    "evidence_ids": [],
                }
            ],
            "recommended_follow_up": "Probe customer impact.",
        },
        "required_competencies": ["system_design", "scalability", "customer_impact"],
        "is_final_round": False,
    }

    # Test main endpoint
    response = client.post("/next-action", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "SWITCH_AGENT"
    assert data["target_agent_id"] == "product"
    assert data["competency_id"] == "customer_impact"
    assert data["handoff_transition_text"] is not None
    assert "Jordan" in data["handoff_transition_text"]

    # Test versioned alias
    alias_response = client.post("/v1/meta-orchestrator/next-action", json=payload)
    assert alias_response.status_code == 200
    assert alias_response.json()["action"] == "SWITCH_AGENT"
