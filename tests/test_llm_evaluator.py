"""Unit tests for LLMAnswerEvaluator with mocked LLM provider responses."""

import json
import pytest

from src.domain.enums import EvidenceStrength, PerformanceRating
from src.domain.models import EvidenceItem, InterviewAIContext
from src.intelligence.deterministic_evaluator import DeterministicAnswerEvaluator
from src.intelligence.llm_client import MockLLMClient
from src.intelligence.llm_evaluator import LLMAnswerEvaluator


def test_1_strong_technical_answer():
    mock_response = json.dumps({
        "answer_id": "ANS-001",
        "overall_performance": "STRONG",
        "confidence": 0.94,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-001-001",
                "answer_id": "ANS-001",
                "competency_id": "system_design",
                "statement": "Implemented Redis caching in front of PostgreSQL and configured horizontal read replicas.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "STRONG",
                "confidence": 0.94,
                "evidence_ids": ["EVID-ANS-001-001"]
            }
        ],
        "recommended_follow_up": "Probe cache invalidation and write consistency strategies."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How do you scale database reads?",
        candidate_answer="We horizontally scaled the API layer behind a load balancer and introduced Redis caching to reduce database reads. We monitored p95 latency and cache hit rate.",
        target_competencies=["system_design"],
        answer_id="ANS-001",
    )

    assert analysis.overall_performance == PerformanceRating.STRONG
    assert analysis.confidence == 0.94
    assert analysis.vague is False
    assert len(analysis.evidence) == 1
    assert analysis.competency_findings[0].assessment == PerformanceRating.STRONG


def test_2_weak_answer():
    mock_response = json.dumps({
        "answer_id": "ANS-002",
        "overall_performance": "WEAK",
        "confidence": 0.82,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["system_design"],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-002-001",
                "answer_id": "ANS-002",
                "competency_id": "system_design",
                "statement": "Claimed microservices automatically solve scaling without discussing state or bottlenecks.",
                "strength": "WEAK",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "WEAK",
                "confidence": 0.82,
                "evidence_ids": ["EVID-ANS-002-001"]
            }
        ],
        "recommended_follow_up": "Ask for specific technical architecture trade-offs."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How do you scale high-throughput endpoints?",
        candidate_answer="We used microservices and caching because it scales better.",
        target_competencies=["system_design"],
        answer_id="ANS-002",
    )

    assert analysis.overall_performance == PerformanceRating.WEAK
    assert analysis.competency_findings[0].assessment == PerformanceRating.WEAK


def test_3_vague_answer():
    mock_response = json.dumps({
        "answer_id": "ANS-003",
        "overall_performance": "WEAK",
        "confidence": 0.85,
        "vague": True,
        "vague_reason": "Answer offered abstract buzzwords ('good architecture') without citing databases, caches, or protocols.",
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["scalability"],
        "evidence": [],
        "competency_findings": [
            {
                "competency_id": "scalability",
                "assessment": "WEAK",
                "confidence": 0.85,
                "evidence_ids": []
            }
        ],
        "recommended_follow_up": "Ask the candidate for concrete components and metrics."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How would you design a scalable payment system?",
        candidate_answer="I would make it scalable using a good architecture.",
        target_competencies=["scalability"],
        answer_id="ANS-003",
    )

    assert analysis.vague is True
    assert "buzzwords" in analysis.vague_reason.lower() or "abstract" in analysis.vague_reason.lower()


def test_4_partially_correct_answer():
    mock_response = json.dumps({
        "answer_id": "ANS-004",
        "overall_performance": "PARTIAL",
        "confidence": 0.76,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["data_consistency"],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-004-001",
                "answer_id": "ANS-004",
                "competency_id": "system_design",
                "statement": "Explained read caching but omitted database write-path replication.",
                "strength": "MODERATE",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "PARTIAL",
                "confidence": 0.76,
                "evidence_ids": ["EVID-ANS-004-001"]
            }
        ],
        "recommended_follow_up": "Probe write synchronization and replication lag."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How do you handle high read/write loads?",
        candidate_answer="We cached queries in Redis to relieve reads, but writes still went straight to the main DB.",
        target_competencies=["system_design"],
        answer_id="ANS-004",
    )

    assert analysis.overall_performance == PerformanceRating.PARTIAL
    assert analysis.competency_findings[0].assessment == PerformanceRating.PARTIAL


def test_5_missing_competency():
    mock_response = json.dumps({
        "answer_id": "ANS-005",
        "overall_performance": "PARTIAL",
        "confidence": 0.90,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["customer_impact"],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-005-001",
                "answer_id": "ANS-005",
                "competency_id": "system_design",
                "statement": "Detailed Postgres connection pooling using PgBouncer.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "STRONG",
                "confidence": 0.92,
                "evidence_ids": ["EVID-ANS-005-001"]
            },
            {
                "competency_id": "customer_impact",
                "assessment": "NOT_EVALUATED",
                "confidence": 0.0,
                "evidence_ids": []
            }
        ],
        "recommended_follow_up": "Explore the business and customer impact of connection pooling."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How do you optimize DB connections and what was the customer impact?",
        candidate_answer="We configured PgBouncer for transaction connection pooling to prevent connection exhaustion.",
        target_competencies=["system_design", "customer_impact"],
        answer_id="ANS-005",
    )

    assert "customer_impact" in analysis.missing_information
    cust_finding = next(f for f in analysis.competency_findings if f.competency_id == "customer_impact")
    assert cust_finding.assessment == PerformanceRating.NOT_EVALUATED


def test_6_multiple_competencies_in_one_answer():
    mock_response = json.dumps({
        "answer_id": "ANS-006",
        "overall_performance": "STRONG",
        "confidence": 0.95,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-006-001",
                "answer_id": "ANS-006",
                "competency_id": "system_design",
                "statement": "Architected distributed Redis cluster with multi-AZ replication.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            },
            {
                "evidence_id": "EVID-ANS-006-002",
                "answer_id": "ANS-006",
                "competency_id": "scalability",
                "statement": "Scaled throughput to 45,000 QPS with p99 latency under 8ms.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "STRONG",
                "confidence": 0.95,
                "evidence_ids": ["EVID-ANS-006-001"]
            },
            {
                "competency_id": "scalability",
                "assessment": "STRONG",
                "confidence": 0.94,
                "evidence_ids": ["EVID-ANS-006-002"]
            }
        ],
        "recommended_follow_up": "Probe disaster recovery."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="Describe your high-throughput caching implementation.",
        candidate_answer="We deployed an AWS ElastiCache Redis cluster across 3 AZs and benchmarked it up to 45k QPS with sub-8ms p99 latency.",
        target_competencies=["system_design", "scalability"],
        answer_id="ANS-006",
    )

    assert len(analysis.evidence) == 2
    assert len(analysis.competency_findings) == 2
    assert all(f.assessment == PerformanceRating.STRONG for f in analysis.competency_findings)


def test_7_contradiction_detected():
    mock_response = json.dumps({
        "answer_id": "ANS-007",
        "overall_performance": "WEAK",
        "confidence": 0.91,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": True,
        "contradiction_details": "Candidate previously stated PostgreSQL was the primary DB, but now asserted they don't use PostgreSQL anywhere in the system.",
        "missing_information": [],
        "evidence": [],
        "competency_findings": [
            {
                "competency_id": "system_design",
                "assessment": "WEAK",
                "confidence": 0.90,
                "evidence_ids": []
            }
        ],
        "recommended_follow_up": "Ask candidate to clarify the apparent discrepancy regarding their primary database choice."
    })

    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-001",
        current_round_id="ROUND-001",
        current_agent_id="technical",
        accumulated_evidence=[
            EvidenceItem(
                evidence_id="EVID-OLD-01",
                answer_id="ANS-000",
                competency_id="system_design",
                statement="Candidate stated PostgreSQL is the primary database.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How do you store relational transactions?",
        candidate_answer="We don't use PostgreSQL anywhere in the system; everything is pure Cassandra.",
        target_competencies=["system_design"],
        interview_context=context,
        answer_id="ANS-007",
    )

    assert analysis.contradiction_detected is True
    assert "previously stated" in analysis.contradiction_details.lower()


def test_8_no_useful_evidence():
    mock_response = json.dumps({
        "answer_id": "ANS-008",
        "overall_performance": "NOT_EVALUATED",
        "confidence": 0.1,
        "vague": True,
        "vague_reason": "Candidate declined to answer or stated unfamiliarity.",
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": ["scalability"],
        "evidence": [],
        "competency_findings": [
            {
                "competency_id": "scalability",
                "assessment": "NOT_EVALUATED",
                "confidence": 0.0,
                "evidence_ids": []
            }
        ],
        "recommended_follow_up": "Pivot to a foundational scaling concept."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="How would you implement Paxos or Raft consensus?",
        candidate_answer="I haven't worked with consensus protocols before.",
        target_competencies=["scalability"],
        answer_id="ANS-008",
    )

    assert len(analysis.evidence) == 0
    assert analysis.competency_findings[0].assessment == PerformanceRating.NOT_EVALUATED


def test_9_customer_impact_evidence():
    mock_response = json.dumps({
        "answer_id": "ANS-009",
        "overall_performance": "STRONG",
        "confidence": 0.93,
        "vague": False,
        "vague_reason": None,
        "contradiction_detected": False,
        "contradiction_details": None,
        "missing_information": [],
        "evidence": [
            {
                "evidence_id": "EVID-ANS-009-001",
                "answer_id": "ANS-009",
                "competency_id": "customer_impact",
                "statement": "Reduced checkout latency from 900ms to 250ms, decreasing user drop-off and lifting checkout conversion by 18%.",
                "strength": "STRONG",
                "timestamp": "2026-09-02T20:30:00Z"
            }
        ],
        "competency_findings": [
            {
                "competency_id": "customer_impact",
                "assessment": "STRONG",
                "confidence": 0.93,
                "evidence_ids": ["EVID-ANS-009-001"]
            }
        ],
        "recommended_follow_up": "Probe how latency reduction was prioritized against new feature requests."
    })

    evaluator = LLMAnswerEvaluator(llm_client=MockLLMClient(default_response=mock_response))
    analysis = evaluator.evaluate(
        question="What was the business impact of your optimization?",
        candidate_answer="We reduced checkout latency from 900ms to 250ms, which improved conversion.",
        target_competencies=["customer_impact"],
        answer_id="ANS-009",
    )

    assert analysis.competency_findings[0].competency_id == "customer_impact"
    assert analysis.competency_findings[0].assessment == PerformanceRating.STRONG
    assert len(analysis.evidence) == 1


def test_10_malformed_llm_response_triggers_deterministic_fallback():
    # Return broken JSON that will fail parsing
    mock_response = "NOT VALID JSON {broken"
    evaluator = LLMAnswerEvaluator(
        llm_client=MockLLMClient(default_response=mock_response),
        fallback_evaluator=DeterministicAnswerEvaluator(),
        enable_fallback=True,
    )

    analysis = evaluator.evaluate(
        question="How do you scale high-throughput API endpoints?",
        candidate_answer="We added Redis in front of PostgreSQL and implemented write-through caching.",
        target_competencies=["system_design"],
        answer_id="ANS-010",
    )

    # Deterministic fallback should step in and evaluate the Redis/Postgres answer
    assert analysis.answer_id == "ANS-010"
    assert analysis.overall_performance in (PerformanceRating.STRONG, PerformanceRating.PARTIAL)
    assert len(analysis.evidence) >= 1
