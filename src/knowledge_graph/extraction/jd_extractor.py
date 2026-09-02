"""Extract Job Description requirements into competency requirements."""

from typing import List
from src.knowledge_graph.types.contracts import GraphUpdate, EntityItem, RelationshipItem
from src.knowledge_graph.types.relationships import RelationshipType


class JDKnowledgeExtractor:
    """Extracts required competencies and evaluation requirements from Job Description."""

    DEFAULT_COMPETENCIES = [
        ("system_design", "System Design", "technical"),
        ("scalability", "Scalability", "technical"),
        ("technical_depth", "Technical Depth", "technical"),
        ("customer_impact", "Customer Impact", "product"),
    ]

    @classmethod
    def extract_from_jd(
        cls,
        job_id: str,
        job_title: str,
        job_description: str,
        required_competencies: List[str] = None,
    ) -> GraphUpdate:
        entities: List[EntityItem] = []
        relationships: List[RelationshipItem] = []

        jid = f"job:{job_id}"
        entities.append(
            EntityItem(
                entity_id=jid,
                type="PROJECT",
                label=job_title,
                properties={"title": job_title, "description": job_description},
            )
        )

        competencies = required_competencies or ["system_design", "scalability", "customer_impact"]

        for comp in competencies:
            cid = f"competency:{comp}"
            entities.append(
                EntityItem(
                    entity_id=cid,
                    type="COMPETENCY",
                    label=comp.replace("_", " ").title(),
                    properties={"name": comp},
                )
            )
            relationships.append(
                RelationshipItem(
                    source_id=jid,
                    type=RelationshipType.REQUIRES,
                    target_id=cid,
                    confidence=1.0,
                )
            )

        return GraphUpdate(
            candidate_id="SYSTEM",
            round_id="ROUND-000",
            entities=entities,
            relationships=relationships,
        )
