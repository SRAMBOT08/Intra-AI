"""Comprehensive test suite for EchoSphere V1 Knowledge Graph (20 Tests)."""

import pytest
from src.domain.enums import DifficultyLevel, EvidenceStrength, PerformanceRating
from src.domain.models import AnswerAnalysis, EvidenceItem, InterviewAIContext
from src.knowledge_graph.extraction.cv_extractor import CVKnowledgeExtractor
from src.knowledge_graph.extraction.jd_extractor import JDKnowledgeExtractor
from src.knowledge_graph.extraction.answer_extractor import AnswerGraphExtractor
from src.knowledge_graph.repository.in_memory import InMemoryKnowledgeGraphRepository
from src.knowledge_graph.services.knowledge_graph_service import KnowledgeGraphService
from src.knowledge_graph.types.contracts import (
    EntityItem,
    GraphUpdate,
    RelationshipItem,
)
from src.knowledge_graph.types.relationships import RelationshipType
from src.knowledge_graph.validation.validator import GraphUpdateValidator


@pytest.fixture
def repo():
    return InMemoryKnowledgeGraphRepository()


@pytest.fixture
def service(repo):
    return KnowledgeGraphService(repository=repo)


# ============================================================
# TEST 1: Create candidate
# ============================================================
@pytest.mark.asyncio
async def test_1_create_candidate(repo):
    update = GraphUpdate(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        entities=[
            EntityItem(
                entity_id="candidate:CAND-505",
                type="CANDIDATE",
                label="Alex Johnson",
                properties={"name": "Alex Johnson", "email": "alex@example.com"},
            )
        ],
    )
    assert await repo.apply_graph_update(update) is True
    profile = await repo.get_candidate_profile("CAND-505")
    assert profile is not None
    assert profile.name == "Alex Johnson"
    assert profile.candidate_id == "CAND-505"


# ============================================================
# TEST 2: Create candidate CV knowledge
# ============================================================
@pytest.mark.asyncio
async def test_2_create_candidate_cv_knowledge(service, repo):
    cv_text = "Experienced software engineer. Built payment APIs using PostgreSQL and Redis with caching and horizontal scaling."
    success = await service.ingest_cv(candidate_id="CAND-505", cv_text=cv_text, candidate_name="Alex Johnson")
    assert success is True

    profile = await repo.get_candidate_profile("CAND-505")
    assert profile is not None
    assert profile.name == "Alex Johnson"


# ============================================================
# TEST 3: Create experience/project relationships
# ============================================================
@pytest.mark.asyncio
async def test_3_create_experience_project_relationships(service, repo):
    cv_text = "Designed and launched the core Payment API service handling high throughput."
    await service.ingest_cv(candidate_id="CAND-505", cv_text=cv_text)
    exps = await repo.get_candidate_experiences("CAND-505")
    assert len(exps) >= 1
    assert "Payment API" in [e.title for e in exps]


# ============================================================
# TEST 4: Create skill/technology relationships
# ============================================================
@pytest.mark.asyncio
async def test_4_create_skill_technology_relationships(service, repo):
    cv_text = "Built backend microservices using PostgreSQL and Redis."
    await service.ingest_cv(candidate_id="CAND-505", cv_text=cv_text)
    techs = await repo.get_candidate_technologies("CAND-505")
    tech_names = [t.name for t in techs]
    assert "PostgreSQL" in tech_names
    assert "Redis" in tech_names


# ============================================================
# TEST 5: Create competency requirements from JD
# ============================================================
@pytest.mark.asyncio
async def test_5_create_competency_requirements(service, repo):
    success = await service.ingest_jd(
        job_id="JOB-101",
        job_title="Staff Backend Engineer",
        job_description="Seeking backend engineer to build scalable payment infrastructure.",
        required_competencies=["system_design", "scalability", "customer_impact"],
    )
    assert success is True
    assert "job:JOB-101" in repo.nodes
    assert "competency:system_design" in repo.nodes
    assert "competency:scalability" in repo.nodes


# ============================================================
# TEST 6: Answer creates Answer + Evidence
# ============================================================
@pytest.mark.asyncio
async def test_6_answer_creates_answer_and_evidence(service, repo):
    analysis = AnswerAnalysis(
        answer_id="ANS-001",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-001",
                answer_id="ANS-001",
                competency_id="system_design",
                statement="Implemented a Redis cluster with write-through caching in front of Aurora PostgreSQL.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )
    success = await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        question_id="Q-001",
        question_text="How do you design your database tier?",
        answer_id="ANS-001",
        candidate_answer="We deployed Redis write-through caching in front of PostgreSQL.",
        analysis=analysis,
    )
    assert success is True
    assert "answer:ANS-001" in repo.nodes
    assert "evidence:EVID-001" in repo.nodes


# ============================================================
# TEST 7: Evidence supports competency
# ============================================================
@pytest.mark.asyncio
async def test_7_evidence_supports_competency(service, repo):
    analysis = AnswerAnalysis(
        answer_id="ANS-002",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.90,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-002",
                answer_id="ANS-002",
                competency_id="scalability",
                statement="Autoscaled ECS tasks across 3 AZs to handle 50k QPS peak load.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )
    await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        question_id="Q-002",
        question_text="How do you scale under peak traffic?",
        answer_id="ANS-002",
        candidate_answer="We autoscaled ECS tasks across 3 AZs to handle 50,000 QPS.",
        analysis=analysis,
    )
    ev_list = await repo.get_competency_evidence("CAND-505", "scalability")
    assert len(ev_list) >= 1
    assert "Autoscaled ECS tasks" in ev_list[0].statement


# ============================================================
# TEST 8: Evidence retains provenance
# ============================================================
@pytest.mark.asyncio
async def test_8_evidence_retains_provenance(service, repo):
    analysis = AnswerAnalysis(
        answer_id="ANS-003",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.95,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-003",
                answer_id="ANS-003",
                competency_id="system_design",
                statement="Configured PgBouncer connection pooling to eliminate database starvation.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )
    await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        question_id="Q-003",
        question_text="How did you manage database connections?",
        answer_id="ANS-003",
        candidate_answer="We configured PgBouncer connection pooling.",
        analysis=analysis,
    )

    ev_node = repo.nodes.get("evidence:EVID-003")
    assert ev_node is not None
    assert ev_node["answer_id"] == "ANS-003"

    # Verify link from answer to evidence
    ans_links = repo.outgoing.get("answer:ANS-003", [])
    contains_link = next((l for l in ans_links if l.type == RelationshipType.CONTAINS_EVIDENCE), None)
    assert contains_link is not None
    assert contains_link.target_id == "evidence:EVID-003"


# ============================================================
# TEST 9: Duplicate answer_id does not create duplicate graph data (Idempotency)
# ============================================================
@pytest.mark.asyncio
async def test_9_idempotency_duplicate_answer_processing(service, repo):
    analysis = AnswerAnalysis(
        answer_id="ANS-004",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.90,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-004",
                answer_id="ANS-004",
                competency_id="system_design",
                statement="Deployed Redis Cluster.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )

    # Call 3 times identically
    await service.process_answer_analysis("CAND-505", "ROUND-001", "Q-004", "Q?", "ANS-004", "Redis", analysis)
    node_count_1 = len(repo.nodes)
    rel_count_1 = len(repo.relationships)

    await service.process_answer_analysis("CAND-505", "ROUND-001", "Q-004", "Q?", "ANS-004", "Redis", analysis)
    await service.process_answer_analysis("CAND-505", "ROUND-001", "Q-004", "Q?", "ANS-004", "Redis", analysis)

    assert len(repo.nodes) == node_count_1
    assert len(repo.relationships) == rel_count_1


# ============================================================
# TEST 10: Vague answer does not create strong unsupported evidence
# ============================================================
@pytest.mark.asyncio
async def test_10_vague_answer_does_not_create_strong_evidence(service, repo):
    vague_analysis = AnswerAnalysis(
        answer_id="ANS-VAGUE",
        overall_performance=PerformanceRating.PARTIAL,
        confidence=0.2,
        vague=True,
        vague_reason="Candidate gave superficial fluff without details.",
        evidence=[],  # No evidence
    )
    await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        question_id="Q-005",
        question_text="How do you handle scaling?",
        answer_id="ANS-VAGUE",
        candidate_answer="We just used some servers and made it fast.",
        analysis=vague_analysis,
    )

    ev_list = await repo.get_competency_evidence("CAND-505", "scalability")
    # Must not have created fake strong evidence
    vague_ev = [e for e in ev_list if "some servers" in e.statement]
    assert len(vague_ev) == 0


# ============================================================
# TEST 11: Off-topic answer does not create unrelated candidate knowledge
# ============================================================
@pytest.mark.asyncio
async def test_11_off_topic_answer_does_not_pollute_graph(service, repo):
    off_topic_analysis = AnswerAnalysis(
        answer_id="ANS-OFFTOPIC",
        overall_performance=PerformanceRating.NOT_EVALUATED,
        confidence=0.0,
        vague=False,
        evidence=[],
    )
    await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-001",
        question_id="Q-006",
        question_text="How do you design database replicas?",
        answer_id="ANS-OFFTOPIC",
        candidate_answer="My favorite movie is Interstellar.",
        analysis=off_topic_analysis,
    )

    assert "concept:interstellar" not in repo.nodes
    assert "tech:interstellar" not in repo.nodes


# ============================================================
# TEST 12: Contradictory evidence creates CONTRADICTS relationship
# ============================================================
@pytest.mark.asyncio
async def test_12_contradictory_evidence_creates_contradicts_rel(service, repo):
    contradiction_analysis = AnswerAnalysis(
        answer_id="ANS-CONTRADICT",
        overall_performance=PerformanceRating.PARTIAL,
        confidence=0.85,
        contradiction_detected=True,
        contradiction_details="Candidate claimed not using caching after earlier stating Redis was their primary cache.",
        evidence=[
            EvidenceItem(
                evidence_id="EVID-CONTRADICT-01",
                answer_id="ANS-CONTRADICT",
                competency_id="system_design",
                statement="We did not use any caching layer in our architecture.",
                strength=EvidenceStrength.MODERATE,
            )
        ],
    )
    await service.process_answer_analysis(
        candidate_id="CAND-505",
        round_id="ROUND-002",
        question_id="Q-007",
        question_text="Did you use caching?",
        answer_id="ANS-CONTRADICT",
        candidate_answer="No, we avoided caching completely.",
        analysis=contradiction_analysis,
    )

    contradictions = await repo.get_candidate_contradictions("CAND-505")
    assert len(contradictions) >= 1
    assert contradictions[0]["confidence"] >= 0.90


# ============================================================
# TEST 13: Round 2 can retrieve Round 1 knowledge
# ============================================================
@pytest.mark.asyncio
async def test_13_round_2_retrieves_round_1_knowledge(service, repo):
    # Round 1: Technical discussion on Redis and PostgreSQL
    await service.ingest_cv("CAND-505", "Built payment API with PostgreSQL and Redis.")
    analysis = AnswerAnalysis(
        answer_id="ANS-R1",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.92,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-R1",
                answer_id="ANS-R1",
                competency_id="system_design",
                statement="Scaled payment API to 50k QPS.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )
    await service.process_answer_analysis("CAND-505", "ROUND-001", "Q-R1", "Q?", "ANS-R1", "Scaled to 50k QPS", analysis)

    # In Round 2 (Product round), retrieve cross-round context
    cross_ctx = await service.get_cross_round_context("CAND-505", "customer_impact")
    assert cross_ctx.candidate_id == "CAND-505"
    assert "PostgreSQL" in cross_ctx.verified_technologies
    assert "Redis" in cross_ctx.verified_technologies
    assert "Payment API" in cross_ctx.grounded_bridge_prompt


# ============================================================
# TEST 14: InterviewAIContext reset preserves persistent graph
# ============================================================
@pytest.mark.asyncio
async def test_14_interview_context_reset_preserves_persistent_graph(service, repo):
    # Ingest CV and Round 1 answers
    await service.ingest_cv("CAND-505", "Built payment API with Redis and PostgreSQL.")

    # Simulate fresh round starting with an empty InterviewAIContext
    fresh_round_context = InterviewAIContext(
        interview_id="INT-ROUND-2",
        candidate_id="CAND-505",
        current_round_id="ROUND-002",
        current_agent_id="product",
        difficulty=DifficultyLevel.HARD,
        evaluated_competencies={},
        accumulated_evidence=[],
        missing_competencies=["customer_impact"],
    )

    # Verify persistent Knowledge Graph remains intact and populated
    pers_ctx = await service.get_relevant_context("CAND-505")
    assert "PostgreSQL" in pers_ctx.relevant_technologies
    assert "Payment API" in pers_ctx.summary_text


# ============================================================
# TEST 15: Relevant context query returns only relevant knowledge
# ============================================================
@pytest.mark.asyncio
async def test_15_relevant_context_query(service, repo):
    await service.ingest_cv("CAND-505", "Payment API, Redis, PostgreSQL, caching, horizontal scaling.")
    ctx = await service.get_relevant_context("CAND-505", "scalability")
    assert ctx.candidate_id == "CAND-505"
    assert len(ctx.summary_text) > 0
    assert "Redis" in ctx.summary_text or "Payment API" in ctx.summary_text


# ============================================================
# TEST 16: Unknown candidate has clean empty persistent context
# ============================================================
@pytest.mark.asyncio
async def test_16_unknown_candidate_empty_context(service, repo):
    ctx = await service.get_relevant_context("CAND-UNKNOWN-999")
    assert ctx.candidate_id == "CAND-UNKNOWN-999"
    assert ctx.relevant_experiences == []
    assert ctx.relevant_technologies == []
    assert ctx.prior_evidence == []


# ============================================================
# TEST 17: Unknown competency is handled safely
# ============================================================
@pytest.mark.asyncio
async def test_17_unknown_competency_handled_safely(service, repo):
    evs = await repo.get_competency_evidence("CAND-505", "quantum_computing_unknown")
    assert evs == []


# ============================================================
# TEST 18: Controlled degradation on repository error
# ============================================================
@pytest.mark.asyncio
async def test_18_controlled_degradation_on_repo_error():
    # If service repo throws, service catches and returns safe fallback
    class FailingRepo(InMemoryKnowledgeGraphRepository):
        async def get_relevant_candidate_knowledge(self, cid, comp=None):
            raise ConnectionError("Neo4j database connection timeout")

    failing_service = KnowledgeGraphService(repository=FailingRepo())
    safe_ctx = await failing_service.get_relevant_context("CAND-505")
    assert safe_ctx.candidate_id == "CAND-505"
    assert "No prior graph context available" in safe_ctx.summary_text


# ============================================================
# TEST 19: Graph update failure does not corrupt answer flow
# ============================================================
@pytest.mark.asyncio
async def test_19_graph_update_failure_does_not_corrupt_flow():
    class BrokenRepo(InMemoryKnowledgeGraphRepository):
        async def apply_graph_update(self, update):
            raise RuntimeError("Disk full")

    failing_service = KnowledgeGraphService(repository=BrokenRepo())
    analysis = AnswerAnalysis(
        answer_id="ANS-FAIL",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.9,
        evidence=[],
    )
    result = await failing_service.process_answer_analysis("CAND-505", "ROUND-001", "Q-1", "Q?", "ANS-FAIL", "Ans", analysis)
    assert result is False  # Safe failure boolean, does not raise unhandled exception


# ============================================================
# TEST 20: Alex -> Jordan handoff preserves access to technical history
# ============================================================
@pytest.mark.asyncio
async def test_20_alex_to_jordan_handoff_preserves_technical_history(service, repo):
    # Alex's technical round
    await service.ingest_cv("CAND-505", "Built payment API using Redis and PostgreSQL.")
    analysis = AnswerAnalysis(
        answer_id="ANS-TECH",
        overall_performance=PerformanceRating.STRONG,
        confidence=0.95,
        evidence=[
            EvidenceItem(
                evidence_id="EVID-TECH-01",
                answer_id="ANS-TECH",
                competency_id="system_design",
                statement="Designed write-through caching with Redis to eliminate PostgreSQL bottleneck.",
                strength=EvidenceStrength.STRONG,
            )
        ],
    )
    await service.process_answer_analysis("CAND-505", "ROUND-001", "Q-TECH", "Q?", "ANS-TECH", "Ans", analysis)

    # Jordan takes over in Product round
    bridge = await service.get_cross_round_context("CAND-505", "customer_impact")
    assert bridge.candidate_id == "CAND-505"
    assert "Redis" in bridge.verified_technologies
    assert "PostgreSQL" in bridge.verified_technologies
    assert "Payment API" in bridge.grounded_bridge_prompt
