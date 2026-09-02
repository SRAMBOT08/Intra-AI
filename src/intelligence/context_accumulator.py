"""Pure state accumulator merging turn AnswerAnalysis into authoritative InterviewAIContext.

Maintains the logical evidence/competency knowledge state without making orchestration decisions.
Guarantees idempotency and prevents duplicate evidence accumulation on retries.
"""

from typing import Dict, List, Optional, Set, Tuple

from src.domain.enums import PerformanceRating
from src.domain.models import (
    AnswerAnalysis,
    EvidenceItem,
    InterviewAIContext,
)


class ContextAccumulator:
    """Pure state-management utility to merge AnswerAnalysis findings into InterviewAIContext."""

    @classmethod
    def accumulate(
        cls,
        current_context: InterviewAIContext,
        analysis: AnswerAnalysis,
        required_competencies: Optional[List[str]] = None,
    ) -> InterviewAIContext:
        """Merge the latest turn's AnswerAnalysis into InterviewAIContext idempotently.

        Args:
            current_context: The existing authoritative domain context.
            analysis: The latest AnswerAnalysis from the intelligence service.
            required_competencies: Optional list of all planned competencies to recompute missing ones.

        Returns:
            An updated InterviewAIContext instance with merged evidence and competency states.
        """
        # 1. Accumulate Evidence (Idempotent: deduplicate by evidence_id AND content signature)
        existing_evidence_ids: Set[str] = {e.evidence_id for e in current_context.accumulated_evidence}
        existing_content_signatures: Set[Tuple[str, str, str]] = {
            (e.answer_id, e.competency_id, e.statement.strip().lower())
            for e in current_context.accumulated_evidence
        }

        new_evidence: List[EvidenceItem] = list(current_context.accumulated_evidence)
        for item in analysis.evidence:
            content_sig = (item.answer_id, item.competency_id, item.statement.strip().lower())
            if item.evidence_id not in existing_evidence_ids and content_sig not in existing_content_signatures:
                new_evidence.append(item)
                existing_evidence_ids.add(item.evidence_id)
                existing_content_signatures.add(content_sig)

        # 2. Update Evaluated Competencies
        # Preserve existing STRONG ratings unless a new STRONG rating is found; update newly evaluated ones.
        updated_evaluated: Dict[str, PerformanceRating] = dict(current_context.evaluated_competencies)
        for finding in analysis.competency_findings:
            comp_id = finding.competency_id
            current_rating = updated_evaluated.get(comp_id)
            if finding.assessment != PerformanceRating.NOT_EVALUATED:
                # If previously unassessed or if upgrading rating, record new finding
                if current_rating != PerformanceRating.STRONG:
                    updated_evaluated[comp_id] = finding.assessment

        # 3. Accumulate Detected Contradictions (Idempotent case-insensitive check)
        existing_contra_lower = {c.strip().lower() for c in current_context.detected_contradictions}
        updated_contradictions: List[str] = list(current_context.detected_contradictions)
        if analysis.contradiction_detected and analysis.contradiction_details:
            details_cleaned = analysis.contradiction_details.strip()
            if details_cleaned.lower() not in existing_contra_lower:
                updated_contradictions.append(details_cleaned)
                existing_contra_lower.add(details_cleaned.lower())

        # 4. Recompute Missing Competencies
        resolved_ratings = {PerformanceRating.STRONG, PerformanceRating.PARTIAL}
        if required_competencies:
            updated_missing = [
                req for req in required_competencies
                if updated_evaluated.get(req, PerformanceRating.NOT_EVALUATED) not in resolved_ratings
            ]
        else:
            updated_missing = [
                m for m in current_context.missing_competencies
                if updated_evaluated.get(m, PerformanceRating.NOT_EVALUATED) not in resolved_ratings
            ]

        # 5. Return updated InterviewAIContext preserving all routing/orchestration fields
        return InterviewAIContext(
            interview_id=current_context.interview_id,
            candidate_id=current_context.candidate_id,
            current_round_id=current_context.current_round_id,
            current_agent_id=current_context.current_agent_id,
            difficulty=current_context.difficulty,
            evaluated_competencies=updated_evaluated,
            accumulated_evidence=new_evidence,
            open_questions=list(current_context.open_questions),
            missing_competencies=updated_missing,
            detected_contradictions=updated_contradictions,
        )
