"""Validation layer for GraphUpdate contracts ensuring strict provenance and integrity."""

import re
from typing import List, Tuple
from src.knowledge_graph.types.contracts import GraphUpdate, EntityItem, RelationshipItem
from src.knowledge_graph.types.relationships import RelationshipType

VALID_ENTITY_TYPES = {
    "CANDIDATE",
    "INTERVIEW_ROUND",
    "EXPERIENCE",
    "PROJECT",
    "SKILL",
    "TECHNOLOGY",
    "CONCEPT",
    "COMPETENCY",
    "QUESTION",
    "ANSWER",
    "EVIDENCE",
    "ASSESSMENT",
}


class GraphUpdateValidator:
    """Validates GraphUpdate payloads before modifying Knowledge Graph."""

    @classmethod
    def validate(cls, update: GraphUpdate) -> Tuple[bool, List[str]]:
        errors: List[str] = []

        if not update.candidate_id or not update.candidate_id.strip():
            errors.append("GraphUpdate missing required candidate_id")

        if not update.round_id or not update.round_id.strip():
            errors.append("GraphUpdate missing required round_id")

        # 1. Validate entities
        entity_ids = set()
        for entity in update.entities:
            if not entity.entity_id or not entity.entity_id.strip():
                errors.append("Entity item missing entity_id")
            entity_ids.add(entity.entity_id)

            if entity.type.upper() not in VALID_ENTITY_TYPES:
                errors.append(f"Invalid entity type: '{entity.type}'. Must be one of {VALID_ENTITY_TYPES}")

        # 2. Validate relationships
        for rel in update.relationships:
            if not rel.source_id or not rel.source_id.strip():
                errors.append("Relationship item missing source_id")
            if not rel.target_id or not rel.target_id.strip():
                errors.append("Relationship item missing target_id")

            if rel.confidence < 0.0 or rel.confidence > 1.0:
                errors.append(f"Relationship confidence {rel.confidence} out of range [0.0, 1.0]")

            # Provenance Check: If relationship is DEMONSTRATES or SUPPORTS, must have evidence IDs
            if rel.type in (RelationshipType.DEMONSTRATES, RelationshipType.SUPPORTS):
                if not rel.evidence_ids and not update.answer_id:
                    errors.append(
                        f"Provenance violation: Relationship {rel.type} from {rel.source_id} to {rel.target_id} lacks supporting evidence_ids."
                    )

        return len(errors) == 0, errors
