"""Completion policy evaluating competency coverage and interview termination."""

from typing import Dict, List, Optional
from src.domain.enums import PerformanceRating
from src.domain.models import AnswerAnalysis, InterviewAIContext


class CompletionPolicy:
    """Evaluates whether all required competencies are sufficiently covered."""

    # Ratings considered satisfactory for completion
    SATISFACTORY_RATINGS = {PerformanceRating.STRONG, PerformanceRating.PARTIAL}

    @classmethod
    def evaluate_completion(
        cls,
        context: InterviewAIContext,
        analysis: Optional[AnswerAnalysis],
        required_competencies: List[str],
        is_final_round: bool = False,
    ) -> bool:
        """Determine if interview competency requirements are fully satisfied.

        Args:
            context: The authoritative interview context.
            analysis: The latest answer analysis from the current turn.
            required_competencies: The list of required competency IDs.
            is_final_round: True if this is the final turn/round of the interview.

        Returns:
            True if all required competencies have satisfactory coverage or final round reached.
        """
        if not required_competencies:
            return True

        # Aggregate coverage from accumulated context + current turn
        combined_coverage: Dict[str, PerformanceRating] = dict(context.evaluated_competencies)

        if analysis and analysis.competency_findings:
            for finding in analysis.competency_findings:
                # Update with latest assessment if not already strong or if newly evaluated
                current_rating = combined_coverage.get(finding.competency_id)
                if current_rating != PerformanceRating.STRONG:
                    combined_coverage[finding.competency_id] = finding.assessment

        # Check if every required competency has satisfactory rating
        all_satisfied = True
        for req in required_competencies:
            rating = combined_coverage.get(req, PerformanceRating.NOT_EVALUATED)
            if rating not in cls.SATISFACTORY_RATINGS:
                all_satisfied = False
                break

        if all_satisfied:
            return True

        if is_final_round:
            return True

        return False
