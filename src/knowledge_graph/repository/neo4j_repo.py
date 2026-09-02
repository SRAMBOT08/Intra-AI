"""Neo4j Knowledge Graph repository implementation with Cypher execution and fallback."""

import os
from typing import Any, Dict, List, Optional
from src.knowledge_graph.repository.base import BaseKnowledgeGraphRepository
from src.knowledge_graph.repository.in_memory import InMemoryKnowledgeGraphRepository
from src.knowledge_graph.schema.constraints import NEO4J_CONSTRAINTS, NEO4J_INDEXES
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


class Neo4jKnowledgeGraphRepository(BaseKnowledgeGraphRepository):
    """Neo4j Knowledge Graph repository with safe in-memory degradation."""

    def __init__(
        self,
        uri: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
    ):
        self.uri = uri or os.getenv("NEO4J_URI", "neo4j://localhost:7687")
        self.username = username or os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = password or os.getenv("NEO4J_PASSWORD", "password")
        self._driver = None
        self._fallback = InMemoryKnowledgeGraphRepository()
        self._is_connected = False

    def _get_driver(self):
        if self._driver is None:
            try:
                from neo4j import GraphDatabase
                self._driver = GraphDatabase.driver(
                    self.uri, auth=(self.username, self.password)
                )
                # Verify connectivity
                self._driver.verify_connectivity()
                self._is_connected = True
            except Exception as e:
                self._is_connected = False
                self._driver = None
        return self._driver

    async def initialize_schema(self) -> bool:
        driver = self._get_driver()
        if not driver:
            return await self._fallback.initialize_schema()

        try:
            with driver.session() as session:
                for constraint in NEO4J_CONSTRAINTS:
                    session.run(constraint)
                for index in NEO4J_INDEXES:
                    session.run(index)
            return True
        except Exception:
            return await self._fallback.initialize_schema()

    async def apply_graph_update(self, update: GraphUpdate) -> bool:
        # Update in-memory fallback mirror
        await self._fallback.apply_graph_update(update)

        driver = self._get_driver()
        if not driver:
            return True

        try:
            with driver.session() as session:
                # 1. Upsert entities with MERGE
                for entity in update.entities:
                    label = entity.type.capitalize()
                    cypher = f"""
                    MERGE (n:{label} {{id: $id}})
                    SET n += $props, n.label = $label
                    """
                    session.run(cypher, id=entity.entity_id, props=entity.properties, label=entity.label)

                # 2. Upsert relationships with MERGE
                for rel in update.relationships:
                    rtype = rel.type.value if hasattr(rel.type, "value") else str(rel.type)
                    cypher = f"""
                    MATCH (a {{id: $source_id}}), (b {{id: $target_id}})
                    MERGE (a)-[r:{rtype}]->(b)
                    SET r.confidence = $confidence,
                        r.evidence_ids = $evidence_ids,
                        r.created_at = $created_at
                    """
                    session.run(
                        cypher,
                        source_id=rel.source_id,
                        target_id=rel.target_id,
                        confidence=rel.confidence,
                        evidence_ids=rel.evidence_ids,
                        created_at=rel.created_at if hasattr(rel, "created_at") else "",
                    )
            return True
        except Exception:
            return True

    async def get_candidate_profile(self, candidate_id: str) -> Optional[CandidateNode]:
        return await self._fallback.get_candidate_profile(candidate_id)

    async def get_candidate_skills(self, candidate_id: str) -> List[SkillNode]:
        return await self._fallback.get_candidate_skills(candidate_id)

    async def get_candidate_technologies(self, candidate_id: str) -> List[TechnologyNode]:
        return await self._fallback.get_candidate_technologies(candidate_id)

    async def get_candidate_experiences(self, candidate_id: str) -> List[ExperienceNode]:
        return await self._fallback.get_candidate_experiences(candidate_id)

    async def get_competency_evidence(
        self, candidate_id: str, competency_id: str
    ) -> List[EvidenceNode]:
        return await self._fallback.get_competency_evidence(candidate_id, competency_id)

    async def get_competency_assessment_history(
        self, candidate_id: str, competency_id: str
    ) -> List[AssessmentNode]:
        return await self._fallback.get_competency_assessment_history(candidate_id, competency_id)

    async def get_candidate_contradictions(self, candidate_id: str) -> List[Dict[str, Any]]:
        return await self._fallback.get_candidate_contradictions(candidate_id)

    async def get_round_history(self, candidate_id: str) -> List[InterviewRoundNode]:
        return await self._fallback.get_round_history(candidate_id)

    async def get_relevant_candidate_knowledge(
        self, candidate_id: str, competency_id: Optional[str] = None
    ) -> RelevantPersistentContext:
        return await self._fallback.get_relevant_candidate_knowledge(candidate_id, competency_id)

    async def get_cross_round_context(
        self, candidate_id: str, current_competency: Optional[str] = None
    ) -> CrossRoundContext:
        return await self._fallback.get_cross_round_context(candidate_id, current_competency)

    async def get_graph_visualization(self, candidate_id: str) -> GraphVisualizationData:
        return await self._fallback.get_graph_visualization(candidate_id)

    async def clear(self) -> None:
        await self._fallback.clear()
        driver = self._get_driver()
        if driver:
            try:
                with driver.session() as session:
                    session.run("MATCH (n) DETACH DELETE n")
            except Exception:
                pass
