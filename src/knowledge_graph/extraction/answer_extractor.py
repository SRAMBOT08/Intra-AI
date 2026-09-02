"""Extract verified facts and grounded evidence from interview answer analysis into GraphUpdate."""

import re
from typing import List, Optional
from src.domain.models import AnswerAnalysis, EvidenceItem
from src.knowledge_graph.types.contracts import GraphUpdate, EntityItem, RelationshipItem
from src.knowledge_graph.types.relationships import RelationshipType


class AnswerGraphExtractor:
    """Converts evaluated candidate answers and evidence into validated GraphUpdate."""

    KNOWN_TECHS = {
        "redis": "Redis",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "aurora": "Amazon Aurora",
        "kafka": "Apache Kafka",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "ecs": "AWS ECS",
        "pgbouncer": "PgBouncer",
    }

    KNOWN_CONCEPTS = {
        "caching": "Caching",
        "write-through": "Write-Through Caching",
        "horizontal scaling": "Horizontal Scaling",
        "autoscale": "Horizontal Scaling",
        "sharding": "Database Sharding",
        "connection pooling": "Connection Pooling",
        "latency": "Low Latency Optimization",
    }

    @classmethod
    def extract_from_analysis(
        cls,
        candidate_id: str,
        round_id: str,
        question_id: str,
        question_text: str,
        answer_id: str,
        candidate_answer: str,
        analysis: AnswerAnalysis,
    ) -> GraphUpdate:
        entities: List[EntityItem] = []
        relationships: List[RelationshipItem] = []

        cid = f"candidate:{candidate_id}"
        rid = f"round:{round_id}"
        qid = f"question:{question_id}"
        aid = f"answer:{answer_id}"

        # 1. Answer Entity
        entities.append(
            EntityItem(
                entity_id=aid,
                type="ANSWER",
                label=f"Answer {answer_id}",
                properties={"text": candidate_answer, "question_id": question_id, "round_id": round_id},
            )
        )
        relationships.append(
            RelationshipItem(
                source_id=cid,
                type=RelationshipType.PROVIDED,
                target_id=aid,
                confidence=1.0,
            )
        )
        relationships.append(
            RelationshipItem(
                source_id=aid,
                type=RelationshipType.ANSWERS,
                target_id=qid,
                confidence=1.0,
            )
        )
        relationships.append(
            RelationshipItem(
                source_id=aid,
                type=RelationshipType.BELONGS_TO,
                target_id=rid,
                confidence=1.0,
            )
        )

        # 2. Extract Evidence Items with Provenance (Only if answer is not vague or off-topic)
        for ev in analysis.evidence:
            ev_id = f"evidence:{ev.evidence_id}"
            comp_id = f"competency:{ev.competency_id}"

            entities.append(
                EntityItem(
                    entity_id=ev_id,
                    type="EVIDENCE",
                    label=ev.statement[:50],
                    properties={
                        "statement": ev.statement,
                        "strength": ev.strength.value if hasattr(ev.strength, "value") else str(ev.strength),
                        "answer_id": answer_id,
                    },
                )
            )

            # Answer contains evidence
            relationships.append(
                RelationshipItem(
                    source_id=aid,
                    type=RelationshipType.CONTAINS_EVIDENCE,
                    target_id=ev_id,
                    confidence=1.0,
                )
            )

            # Evidence supports competency
            confidence_val = 0.95 if ev.strength.value == "STRONG" else 0.70
            relationships.append(
                RelationshipItem(
                    source_id=ev_id,
                    type=RelationshipType.SUPPORTS,
                    target_id=comp_id,
                    confidence=confidence_val,
                    evidence_ids=[ev.evidence_id],
                )
            )

            # Candidate demonstrates competency via evidence
            relationships.append(
                RelationshipItem(
                    source_id=cid,
                    type=RelationshipType.DEMONSTRATES,
                    target_id=comp_id,
                    confidence=confidence_val,
                    evidence_ids=[ev.evidence_id],
                )
            )

        # 3. Extract Technology & Concept nodes mentioned in grounded evidence
        lower_ans = candidate_answer.lower()
        if analysis.overall_performance.value != "NOT_EVALUATED" and not analysis.vague:
            for tech_key, tech_label in cls.KNOWN_TECHS.items():
                if re.search(r"\b" + re.escape(tech_key) + r"\b", lower_ans):
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
                            confidence=analysis.confidence,
                            evidence_ids=[f"evidence:{analysis.evidence[0].evidence_id}"] if analysis.evidence else [],
                        )
                    )

            for concept_key, concept_label in cls.KNOWN_CONCEPTS.items():
                if concept_key in lower_ans:
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
                            confidence=analysis.confidence,
                            evidence_ids=[f"evidence:{analysis.evidence[0].evidence_id}"] if analysis.evidence else [],
                        )
                    )

        # 4. Handle Contradictions
        if analysis.contradiction_detected and analysis.evidence:
            current_ev_id = f"evidence:{analysis.evidence[0].evidence_id}"
            relationships.append(
                RelationshipItem(
                    source_id=current_ev_id,
                    type=RelationshipType.CONTRADICTS,
                    target_id=f"evidence:prior_evidence_{candidate_id}",
                    confidence=0.95,
                    metadata={"details": analysis.contradiction_details or "Direct statement contradiction"},
                )
            )

        return GraphUpdate(
            candidate_id=candidate_id,
            round_id=round_id,
            answer_id=answer_id,
            question_id=question_id,
            entities=entities,
            relationships=relationships,
        )
