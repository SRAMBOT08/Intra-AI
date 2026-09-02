"""Gap prioritization policy ordering unresolved competencies by interview plan priority."""

from typing import Dict, List, Optional, Tuple
from src.domain.enums import PerformanceRating
from src.domain.models import AnswerAnalysis, InterviewAIContext


class GapPrioritizer:
    """Prioritizes missing or under-evaluated competency gaps deterministically."""

    # Ratings considered resolved
    RESOLVED_RATINGS = {PerformanceRating.STRONG, PerformanceRating.PARTIAL}

    @classmethod
    def prioritize_gaps(
        cls,
        context: InterviewAIContext,
        analysis: Optional[AnswerAnalysis],
        required_competencies: List[str],
    ) -> Tuple[List[str], Optional[str]]:
        """Identify unresolved competency gaps in interview-plan order and select the top gap.

        Args:
            context: The authoritative interview context.
            analysis: Latest answer analysis, if available.
            required_competencies: Ordered list of competencies defined by the interview plan.

        Returns:
            Tuple of (all_unresolved_gaps, selected_top_gap)
        """
        combined_coverage: Dict[str, PerformanceRating] = dict(context.evaluated_competencies)

        # Merge in current turn findings
        if analysis and analysis.competency_findings:
            for finding in analysis.competency_findings:
                current = combined_coverage.get(finding.competency_id)
                if current != PerformanceRating.STRONG:
                    combined_coverage[finding.competency_id] = finding.assessment

        unresolved_gaps: List[str] = []
        for req in required_competencies:
            rating = combined_coverage.get(req, PerformanceRating.NOT_EVALUATED)
            if rating not in cls.RESOLVED_RATINGS:
                unresolved_gaps.append(req)

        selected_gap = unresolved_gaps[0] if unresolved_gaps else None
        return unresolved_gaps, selected_gap
