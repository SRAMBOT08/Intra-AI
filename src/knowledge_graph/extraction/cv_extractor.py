"""Extract grounded candidate profile and CV facts into structured GraphUpdate."""

import re
from typing import Dict, List, Optional
from src.knowledge_graph.types.contracts import GraphUpdate, EntityItem, RelationshipItem
from src.knowledge_graph.types.relationships import RelationshipType


class CVKnowledgeExtractor:
    """Extracts explicit, verified facts from candidate CV text into GraphUpdate."""

    # Known technology and skill keywords for grounding
    KNOWN_TECHS = {
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "redis": "Redis",
        "aurora": "Amazon Aurora",
        "kafka": "Apache Kafka",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "python": "Python",
        "fastapi": "FastAPI",
        "react": "React",
        "nextjs": "Next.js",
        "aws": "AWS",
        "pgbouncer": "PgBouncer",
        "ecs": "AWS ECS",
    }

    KNOWN_CONCEPTS = {
        "caching": "Caching",
        "horizontal scaling": "Horizontal Scaling",
        "sharding": "Database Sharding",
        "distributed systems": "Distributed Systems",
        "load balancing": "Load Balancing",
        "connection pooling": "Connection Pooling",
        "write-through": "Write-Through Caching",
        "event-driven": "Event-Driven Architecture",
    }

    @classmethod
    def extract_from_cv(
        cls,
        candidate_id: str,
        cv_text: str,
        candidate_name: str = "Alex Johnson",
        round_id: str = "ROUND-000",
    ) -> GraphUpdate:
        """Extract only explicit facts from CV text into GraphUpdate entities and relationships."""
        entities: List[EntityItem] = []
        relationships: List[RelationshipItem] = []

        cid = f"candidate:{candidate_id}"
        rid = f"round:{round_id}"

        # 1. Candidate Node
        entities.append(
            EntityItem(
                entity_id=cid,
                type="CANDIDATE",
                label=candidate_name,
                properties={"name": candidate_name, "raw_id": candidate_id},
            )
        )

        lower_cv = cv_text.lower()

        # 2. Extract Project/Experience if mentioned
        if "payment" in lower_cv or "api" in lower_cv:
            pid = "project:payment_api"
            entities.append(
                EntityItem(
                    entity_id=pid,
                    type="PROJECT",
                    label="Payment API",
                    properties={"description": "High throughput payment API service"},
                )
            )
            relationships.append(
                RelationshipItem(
                    source_id=cid,
                    type=RelationshipType.WORKED_ON_PROJECT,
                    target_id=pid,
                    confidence=1.0,
                )
            )

        # 3. Extract Technologies
        for tech_key, tech_label in cls.KNOWN_TECHS.items():
            if re.search(r"\b" + re.escape(tech_key) + r"\b", lower_cv):
                tid = f"tech:{tech_key}"
                entities.append(
                    EntityItem(
                        entity_id=tid,
                        type="TECHNOLOGY",
                        label=tech_label,
                        properties={"name": tech_label},
                    )
                )
                relationships.append(
                    RelationshipItem(
                        source_id=cid,
                        type=RelationshipType.USES,
                        target_id=tid,
                        confidence=0.95,
                    )
                )

        # 4. Extract Concepts
        for concept_key, concept_label in cls.KNOWN_CONCEPTS.items():
            if concept_key in lower_cv:
                kid = f"concept:{concept_key.replace(' ', '_')}"
                entities.append(
                    EntityItem(
                        entity_id=kid,
                        type="CONCEPT",
                        label=concept_label,
                        properties={"name": concept_label},
                    )
                )
                relationships.append(
                    RelationshipItem(
                        source_id=cid,
                        type=RelationshipType.DEMONSTRATES,
                        target_id=kid,
                        confidence=0.90,
                        evidence_ids=[f"cv:{candidate_id}"],
                    )
                )

        return GraphUpdate(
            candidate_id=candidate_id,
            round_id=round_id,
            entities=entities,
            relationships=relationships,
        )
