"""In-memory Knowledge Graph repository for unit testing and local development."""

from typing import Any, Dict, List, Optional, Set
from src.knowledge_graph.repository.base import BaseKnowledgeGraphRepository
from src.knowledge_graph.types.nodes import (
    CandidateNode,
    InterviewRoundNode,
    ExperienceNode,
    ProjectNode,
    SkillNode,
    TechnologyNode,
    ConceptNode,
    CompetencyNode,
    QuestionNode,
    AnswerNode,
    EvidenceNode,
    AssessmentNode,
)
from src.knowledge_graph.types.relationships import GraphRelationship, RelationshipType
from src.knowledge_graph.types.contracts import (
    GraphUpdate,
    RelevantPersistentContext,
    CrossRoundContext,
    GraphVisualizationData,
)


class InMemoryKnowledgeGraphRepository(BaseKnowledgeGraphRepository):
    """Full in-memory implementation of Knowledge Graph with node and edge indexes."""

    def __init__(self):
        # Node storage keyed by unique node ID (e.g. 'candidate:CAND-505', 'tech:redis')
        self.nodes: Dict[str, Dict[str, Any]] = {}
        # Relationships stored as set of GraphRelationship
        self.relationships: List[GraphRelationship] = []
        # Index of outgoing edges: source_id -> list of GraphRelationship
        self.outgoing: Dict[str, List[GraphRelationship]] = {}
        # Index of incoming edges: target_id -> list of GraphRelationship
        self.incoming: Dict[str, List[GraphRelationship]] = {}

    async def initialize_schema(self) -> bool:
        return True

    def _normalize_id(self, raw_id: str, default_prefix: str) -> str:
        if ":" in raw_id:
            return raw_id
        return f"{default_prefix}:{raw_id}"

    async def apply_graph_update(self, update: GraphUpdate) -> bool:
        """Atomically apply a validated GraphUpdate with idempotent MERGE semantics."""
        cand_id = self._normalize_id(update.candidate_id, "candidate")
        round_id = self._normalize_id(update.round_id, "round")

        # 1. Upsert entities idempotently
        for entity in update.entities:
            eid = entity.entity_id
            if eid not in self.nodes:
                self.nodes[eid] = {
                    "id": eid,
                    "type": entity.type,
                    "label": entity.label,
                    **entity.properties,
                }
            else:
                self.nodes[eid].update(entity.properties)
                if entity.label:
                    self.nodes[eid]["label"] = entity.label

        # 2. Upsert relationships idempotently (avoid duplicates by source, type, target)
        for rel in update.relationships:
            src = rel.source_id
            tgt = rel.target_id
            rtype = rel.type

            # Check if relationship already exists
            existing = next(
                (
                    r
                    for r in self.relationships
                    if r.source_id == src and r.type == rtype and r.target_id == tgt
                ),
                None,
            )

            if existing:
                # Merge evidence IDs and update confidence
                for ev in rel.evidence_ids:
                    if ev not in existing.evidence_ids:
                        existing.evidence_ids.append(ev)
                existing.confidence = max(existing.confidence, rel.confidence)
                existing.metadata.update(rel.metadata)
            else:
                new_rel = GraphRelationship(
                    source_id=src,
                    type=rtype,
                    target_id=tgt,
                    confidence=rel.confidence,
                    evidence_ids=list(rel.evidence_ids),
                    metadata=dict(rel.metadata),
                )
                self.relationships.append(new_rel)
                self.outgoing.setdefault(src, []).append(new_rel)
                self.incoming.setdefault(tgt, []).append(new_rel)

        return True

    async def get_candidate_profile(self, candidate_id: str) -> Optional[CandidateNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        data = self.nodes.get(cid)
        if not data:
            return None
        return CandidateNode(
            id=data["id"],
            candidate_id=candidate_id.replace("candidate:", ""),
            name=data.get("name", data.get("label", "Alex Johnson")),
            email=data.get("email"),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
        )

    async def get_candidate_skills(self, candidate_id: str) -> List[SkillNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        skills: List[SkillNode] = []
        for rel in self.outgoing.get(cid, []):
            if rel.type == RelationshipType.HAS_SKILL and rel.target_id in self.nodes:
                node = self.nodes[rel.target_id]
                skills.append(
                    SkillNode(
                        id=node["id"],
                        name=node.get("label", node["id"].split(":")[-1]),
                        category=node.get("category"),
                    )
                )
        return skills

    async def get_candidate_technologies(self, candidate_id: str) -> List[TechnologyNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        techs: List[TechnologyNode] = []
        visited = set()

        # Check direct candidate -> tech, or candidate -> worked_on -> project -> uses -> tech
        for rel in self.outgoing.get(cid, []):
            tgt = rel.target_id
            if tgt in self.nodes:
                node = self.nodes[tgt]
                if node.get("type") in ("TECHNOLOGY", "tech") and tgt not in visited:
                    visited.add(tgt)
                    techs.append(TechnologyNode(id=tgt, name=node.get("label", tgt.split(":")[-1])))
            # Check experience/project links
            for child_rel in self.outgoing.get(tgt, []):
                if child_rel.type == RelationshipType.USES and child_rel.target_id in self.nodes:
                    cnode = self.nodes[child_rel.target_id]
                    if child_rel.target_id not in visited:
                        visited.add(child_rel.target_id)
                        techs.append(
                            TechnologyNode(
                                id=child_rel.target_id,
                                name=cnode.get("label", child_rel.target_id.split(":")[-1]),
                            )
                        )
        return techs

    async def get_candidate_experiences(self, candidate_id: str) -> List[ExperienceNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        exps: List[ExperienceNode] = []
        for rel in self.outgoing.get(cid, []):
            if rel.type in (RelationshipType.HAS_EXPERIENCE, RelationshipType.WORKED_ON, RelationshipType.WORKED_ON_PROJECT):
                node = self.nodes.get(rel.target_id)
                if node:
                    exps.append(
                        ExperienceNode(
                            id=node["id"],
                            title=node.get("label", node.get("title", "Software Engineer")),
                            organization=node.get("organization", node.get("company")),
                            description=node.get("description"),
                        )
                    )
        return exps

    async def get_competency_evidence(
        self, candidate_id: str, competency_id: str
    ) -> List[EvidenceNode]:
        comp_id = self._normalize_id(competency_id, "competency")
        evidence_list: List[EvidenceNode] = []

        # Find all evidence that SUPPORTS this competency
        for rel in self.incoming.get(comp_id, []):
            if rel.type in (RelationshipType.SUPPORTS, RelationshipType.DEMONSTRATES):
                ev_node = self.nodes.get(rel.source_id)
                if ev_node and ev_node.get("type") in ("EVIDENCE", "evidence"):
                    evidence_list.append(
                        EvidenceNode(
                            id=ev_node["id"],
                            answer_id=ev_node.get("answer_id", ""),
                            statement=ev_node.get("statement", ev_node.get("label", "")),
                            strength=ev_node.get("strength", "STRONG"),
                            confidence=float(ev_node.get("confidence", rel.confidence)),
                        )
                    )
        return evidence_list

    async def get_competency_assessment_history(
        self, candidate_id: str, competency_id: str
    ) -> List[AssessmentNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        comp_id = self._normalize_id(competency_id, "competency")
        assessments: List[AssessmentNode] = []

        for rel in self.outgoing.get(cid, []):
            if rel.type == RelationshipType.HAS_ASSESSMENT:
                as_node = self.nodes.get(rel.target_id)
                if as_node and (as_node.get("competency_id") == comp_id or as_node.get("competency_id") == competency_id):
                    assessments.append(
                        AssessmentNode(
                            id=as_node["id"],
                            candidate_id=candidate_id,
                            competency_id=competency_id,
                            rating=as_node.get("rating", "PARTIAL"),
                            confidence=float(as_node.get("confidence", 0.9)),
                            round_id=as_node.get("round_id", "ROUND-001"),
                            timestamp=as_node.get("timestamp", ""),
                        )
                    )
        return assessments

    async def get_candidate_contradictions(self, candidate_id: str) -> List[Dict[str, Any]]:
        contradictions: List[Dict[str, Any]] = []
        for rel in self.relationships:
            if rel.type == RelationshipType.CONTRADICTS:
                src_node = self.nodes.get(rel.source_id, {})
                tgt_node = self.nodes.get(rel.target_id, {})
                contradictions.append(
                    {
                        "source_evidence_id": rel.source_id,
                        "source_statement": src_node.get("statement", src_node.get("label", "")),
                        "contradicted_evidence_id": rel.target_id,
                        "contradicted_statement": tgt_node.get("statement", tgt_node.get("label", "")),
                        "confidence": rel.confidence,
                        "details": rel.metadata.get("details", "Discrepancy in technical statements"),
                    }
                )
        return contradictions

    async def get_round_history(self, candidate_id: str) -> List[InterviewRoundNode]:
        cid = self._normalize_id(candidate_id, "candidate")
        rounds: List[InterviewRoundNode] = []
        for rel in self.outgoing.get(cid, []):
            if rel.type == RelationshipType.PARTICIPATED_IN:
                r_node = self.nodes.get(rel.target_id)
                if r_node:
                    rounds.append(
                        InterviewRoundNode(
                            id=r_node["id"],
                            interview_id=r_node.get("interview_id", ""),
                            round_number=int(r_node.get("round_number", 1)),
                            round_type=r_node.get("round_type", "technical"),
                        )
                    )
        return rounds

    async def get_relevant_candidate_knowledge(
        self, candidate_id: str, competency_id: Optional[str] = None
    ) -> RelevantPersistentContext:
        """Retrieve compact, relevant persistent context for M1 / LangGraph."""
        cid = self._normalize_id(candidate_id, "candidate")
        cand_node = self.nodes.get(cid, {})
        cand_name = cand_node.get("name", cand_node.get("label", "Candidate"))

        skills = [s.name for s in await self.get_candidate_skills(candidate_id)]
        techs = [t.name for t in await self.get_candidate_technologies(candidate_id)]
        exps = [
            {"title": e.title, "organization": e.organization, "description": e.description}
            for e in await self.get_candidate_experiences(candidate_id)
        ]

        # Concepts
        concepts = []
        for rel in self.outgoing.get(cid, []):
            node = self.nodes.get(rel.target_id)
            if node and node.get("type") in ("CONCEPT", "concept"):
                concepts.append(node.get("label", node["id"].split(":")[-1]))

        # Evidence
        evidence = []
        if competency_id:
            evs = await self.get_competency_evidence(candidate_id, competency_id)
            evidence = [{"id": e.id, "statement": e.statement, "strength": e.strength} for e in evs]
        else:
            for eid, node in self.nodes.items():
                if node.get("type") in ("EVIDENCE", "evidence"):
                    evidence.append({"id": eid, "statement": node.get("statement", node.get("label", "")), "strength": node.get("strength", "STRONG")})

        # Contradictions
        contradictions = await self.get_candidate_contradictions(candidate_id)

        # Build compact summary string for LLM injection
        summary_parts = []
        if exps:
            summary_parts.append(f"Projects/Experience: {', '.join(e['title'] for e in exps[:3])}")
        if techs:
            summary_parts.append(f"Verified Technologies: {', '.join(techs[:5])}")
        if skills:
            summary_parts.append(f"Skills: {', '.join(skills[:5])}")
        if concepts:
            summary_parts.append(f"Demonstrated Concepts: {', '.join(concepts[:5])}")
        if evidence:
            summary_parts.append(f"Prior Evidence: {evidence[0]['statement']}")

        return RelevantPersistentContext(
            candidate_id=candidate_id,
            candidate_name=cand_name,
            relevant_experiences=exps,
            relevant_skills=skills,
            relevant_technologies=techs,
            relevant_concepts=concepts,
            prior_evidence=evidence,
            unresolved_contradictions=contradictions,
            summary_text=" | ".join(summary_parts),
        )

    async def get_cross_round_context(
        self, candidate_id: str, current_competency: Optional[str] = None
    ) -> CrossRoundContext:
        """Retrieve grounded prior technical context for persona handoff (e.g. Alex -> Jordan)."""
        cid = self._normalize_id(candidate_id, "candidate")
        cand_node = self.nodes.get(cid, {})
        cand_name = cand_node.get("name", cand_node.get("label", "Alex Johnson"))

        techs = [t.name for t in await self.get_candidate_technologies(candidate_id)]
        exps = [e.title for e in await self.get_candidate_experiences(candidate_id)]

        # Collect demonstrated concepts from technical round
        concepts = []
        for node in self.nodes.values():
            if node.get("type") in ("CONCEPT", "concept"):
                concepts.append(node.get("label", node["id"].split(":")[-1]))

        # High-level technical evidence statements
        tech_evidence = []
        for node in self.nodes.values():
            if node.get("type") in ("EVIDENCE", "evidence") and node.get("strength") == "STRONG":
                tech_evidence.append(node.get("statement", node.get("label", "")))

        # Bridge prompt string for Jordan (Product Lead)
        bridge = ""
        if exps or techs:
            proj = exps[0] if exps else "backend architecture"
            tlist = ", ".join(techs[:3]) if techs else "distributed services"
            bridge = f"Candidate previously discussed {proj} utilizing {tlist}. Explore the user adoption, business metrics, and operational impact of these technical decisions."

        return CrossRoundContext(
            candidate_id=candidate_id,
            candidate_name=cand_name,
            completed_rounds=[1],
            technical_highlights=tech_evidence[:3],
            verified_technologies=techs,
            verified_concepts=concepts,
            grounded_bridge_prompt=bridge,
        )

    async def get_graph_visualization(self, candidate_id: str) -> GraphVisualizationData:
        """Generate read-only visualization data (nodes + links) for developer UI."""
        nodes_list = []
        for nid, data in self.nodes.items():
            nodes_list.append(
                {
                    "id": nid,
                    "label": data.get("label", data.get("name", nid)),
                    "type": data.get("type", "UNKNOWN"),
                }
            )

        links_list = []
        for rel in self.relationships:
            links_list.append(
                {
                    "source": rel.source_id,
                    "target": rel.target_id,
                    "type": rel.type.value if hasattr(rel.type, "value") else str(rel.type),
                    "confidence": rel.confidence,
                }
            )

        return GraphVisualizationData(nodes=nodes_list, links=links_list)

    async def clear(self) -> None:
        self.nodes.clear()
        self.relationships.clear()
        self.outgoing.clear()
        self.incoming.clear()
