"""Clarification policy detecting vagueness or contradictions requiring follow-up probes."""

from typing import Optional, Tuple
from src.domain.models import AnswerAnalysis, InterviewAIContext


class ClarificationPolicy:
    """Evaluates whether the candidate's latest response requires immediate clarification."""

    @classmethod
    def evaluate_clarification(
        cls,
        context: InterviewAIContext,
        analysis: AnswerAnalysis,
        current_competency: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """Check if clarification is required due to vagueness or contradictions.

        Args:
            context: Current interview context.
            analysis: The latest answer analysis.
            current_competency: The competency under discussion.

        Returns:
            Tuple of (requires_clarification, reason, prompt_directive, target_competency_id)
        """
        # 1. Contradiction takes top priority
        if analysis.contradiction_detected:
            details = analysis.contradiction_details or "Inconsistency detected with previous statements."
            reason = f"Candidate response contradicted previous evidence: {details}"
            directive = (
                f"Politely clarify the apparent discrepancy regarding: {details}. "
                f"Ask the candidate to explain how these statements align."
            )
            competency = current_competency or (
                analysis.competency_findings[0].competency_id if analysis.competency_findings else None
            )
            return True, reason, directive, competency

        # 2. Vagueness requires a clarifying follow-up probe
        if analysis.vague:
            details = analysis.vague_reason or "Answer lacks concrete technical decisions, metrics, or trade-offs."
            reason = f"Candidate response was vague: {details}"
            directive = (
                f"Ask the candidate to provide concrete specifics, architecture details, or metrics. {details}"
            )
            competency = current_competency or (
                analysis.competency_findings[0].competency_id if analysis.competency_findings else None
            )
            return True, reason, directive, competency

        return False, None, None, None
