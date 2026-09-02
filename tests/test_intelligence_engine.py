"""Unit tests for the Interview Intelligence Engine and subcomponents."""

from src.domain.enums import EvidenceStrength, PerformanceRating
from src.domain.models import EvidenceItem, InterviewAIContext
from src.intelligence.competency_evaluator import CompetencyEvaluator
from src.intelligence.contradiction_detector import ContradictionDetector
from src.intelligence.engine import InterviewIntelligenceEngine
from src.intelligence.evidence_extractor import EvidenceExtractor
from src.intelligence.vagueness_detector import VaguenessDetector


def test_evidence_extractor_grounding():
    extractor = EvidenceExtractor()
    question = "How do you scale high-throughput API endpoints?"
    answer = "We added Redis in front of PostgreSQL and implemented write-through caching to handle 20000 QPS."
    
    evidence = extractor.extract(
        question=question,
        answer=answer,
        target_competencies=["system_design", "scalability"],
        answer_id="ANS-001",
    )
    assert len(evidence) >= 1
    comps = [e.competency_id for e in evidence]
    assert "system_design" in comps or "scalability" in comps
    assert any("Redis" in e.statement for e in evidence)


def test_competency_evaluator_scoring():
    evaluator = CompetencyEvaluator()
    items = [
        EvidenceItem(
            evidence_id="EVID-001",
            answer_id="ANS-001",
            competency_id="system_design",
            statement="Added Redis caching in front of Postgres.",
            strength=EvidenceStrength.STRONG,
        )
    ]
    findings, overall_perf, confidence, missing = evaluator.evaluate(
        evidence=items,
        target_competencies=["system_design", "customer_impact"],
    )
    assert len(findings) == 2
    sys_finding = next(f for f in findings if f.competency_id == "system_design")
    assert sys_finding.assessment == PerformanceRating.STRONG
    assert sys_finding.confidence > 0.8
    assert "customer_impact" in missing


def test_vagueness_detector_catches_fluff():
    detector = VaguenessDetector()
    is_vague, reason = detector.detect_vagueness(
        question="How did you scale your database?",
        answer="We used best practices and standard approach to scale it.",
        target_competencies=["scalability"],
    )
    assert is_vague is True
    assert reason is not None


def test_vagueness_detector_passes_detailed_answer():
    detector = VaguenessDetector()
    is_vague, reason = detector.detect_vagueness(
        question="How did you scale your database?",
        answer="We configured read replicas for PostgreSQL with PgBouncer connection pooling and cached read queries in Redis.",
        target_competencies=["scalability"],
    )
    assert is_vague is False
    assert reason is None


def test_contradiction_detector_finds_mismatch():
    detector = ContradictionDetector()
    past_evidence = [
        EvidenceItem(
            evidence_id="EVID-1",
            answer_id="ANS-1",
            competency_id="system_design",
            statement="We ran a single-node PostgreSQL instance on EC2 without replicas.",
            strength=EvidenceStrength.STRONG,
        )
    ]
    has_contra, details = detector.detect_contradictions(
        answer="Our distributed cluster with sharded PostgreSQL database processed transactions concurrently.",
        accumulated_evidence=past_evidence,
    )
    assert has_contra is True
    assert details is not None


def test_intelligence_engine_full_analysis():
    engine = InterviewIntelligenceEngine()
    context = InterviewAIContext(
        interview_id="INT-101",
        candidate_id="CAND-505",
        current_round_id="ROUND-001",
        current_agent_id="technical",
    )
    analysis = engine.analyze(
        question="How do you scale high-throughput API endpoints?",
        candidate_answer="We added Redis in front of PostgreSQL and implemented write-through caching.",
        target_competencies=["system_design", "scalability"],
        interview_context=context,
        answer_id="ANS-001",
    )
    assert analysis.answer_id == "ANS-001"
    assert analysis.overall_performance in (PerformanceRating.STRONG, PerformanceRating.PARTIAL)
    assert analysis.confidence > 0.7
    assert analysis.vague is False
    assert analysis.contradiction_detected is False
    assert len(analysis.evidence) > 0
