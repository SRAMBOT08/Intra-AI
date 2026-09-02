"""Grounded evidence extractor implementation for candidate interview responses."""

import re
from typing import List, Optional
from datetime import datetime, timezone

from src.domain.enums import EvidenceStrength
from src.domain.models import EvidenceItem, InterviewAIContext
from src.intelligence.interfaces import IEvidenceExtractor


class EvidenceExtractor(IEvidenceExtractor):
    """Extracts grounded factual evidence statements from candidate answers."""

    # Conceptual keywords associated with common interview competencies
    COMPETENCY_CUES = {
        "system_design": [
            "redis", "postgresql", "postgres", "cache", "caching", "database", "microservice",
            "architecture", "queue", "kafka", "api", "load balancer", "sharding", "replication",
            "event-driven", "grpc", "graphql", "rest", "gateway", "nosql", "sql"
        ],
        "scalability": [
            "throughput", "latency", "scale", "scaling", "horizontal", "vertical", "partitioning",
            "concurrency", "qps", "load", "bottleneck", "benchmark", "high-throughput", "write-through",
            "read replica", "connection pool", "auto-scaling", "rate limiting"
        ],
        "customer_impact": [
            "customer", "user", "retention", "conversion", "churn", "latency", "experience",
            "business", "stakeholder", "revenue", "dau", "mau", "sla", "feedback", "adoption",
            "checkout", "nps", "satisfaction"
        ],
    }

    def extract(
        self,
        question: str,
        answer: str,
        target_competencies: List[str],
        answer_id: str,
        context: Optional[InterviewAIContext] = None,
    ) -> List[EvidenceItem]:
        """Extract concrete candidate statements mapped to target competencies."""
        if not answer or not answer.strip():
            return []

        # Split answer into meaningful sentences/clauses
        sentences = [s.strip() for s in re.split(r"[.!?\n]+", answer) if s.strip()]
        if not sentences:
            sentences = [answer.strip()]

        evidence_items: List[EvidenceItem] = []
        item_counter = 1

        answer_lower = answer.lower()

        for comp in target_competencies:
            comp_lower = comp.lower()
            cues = self.COMPETENCY_CUES.get(comp_lower, [comp_lower.replace("_", " ")])

            matched_sentences = []
            for s in sentences:
                s_lower = s.lower()
                if any(cue in s_lower for cue in cues):
                    matched_sentences.append(s)

            if matched_sentences:
                # Deduplicate and combine matching statements into coherent evidence
                combined_stmt = " ".join(matched_sentences)
                
                # Assess strength based on specificity (numbers, technical specifics, architectural decisions)
                has_metrics_or_specifics = bool(
                    re.search(r"\b(\d+|ms|qps|percent|write-through|read-through|sharding)\b", combined_stmt, re.I)
                )
                strength = EvidenceStrength.STRONG if (len(matched_sentences) >= 1 and has_metrics_or_specifics or len(combined_stmt) > 40) else EvidenceStrength.MODERATE

                evidence_items.append(
                    EvidenceItem(
                        evidence_id=f"EVID-{answer_id}-{item_counter:03d}",
                        answer_id=answer_id,
                        competency_id=comp,
                        statement=combined_stmt,
                        strength=strength,
                        timestamp=datetime.now(timezone.utc).isoformat(),
                    )
                )
                item_counter += 1
            else:
                # If the entire answer as a whole is relevant to the competency
                if any(cue in answer_lower for cue in cues):
                    evidence_items.append(
                        EvidenceItem(
                            evidence_id=f"EVID-{answer_id}-{item_counter:03d}",
                            answer_id=answer_id,
                            competency_id=comp,
                            statement=answer.strip(),
                            strength=EvidenceStrength.MODERATE,
                            timestamp=datetime.now(timezone.utc).isoformat(),
                        )
                    )
                    item_counter += 1

        return evidence_items
