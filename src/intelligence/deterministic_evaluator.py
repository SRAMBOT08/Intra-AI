"""Deterministic rule-based AnswerEvaluator implementation."""

from typing import List, Optional

from src.domain.enums import PerformanceRating
from src.domain.models import AnswerAnalysis, CandidateProfileSummary, InterviewAIContext
from src.intelligence.competency_evaluator import CompetencyEvaluator
from src.intelligence.contradiction_detector import ContradictionDetector
from src.intelligence.evidence_extractor import EvidenceExtractor
from src.intelligence.interfaces import (
    IAnswerEvaluator,
    ICompetencyEvaluator,
    IContradictionDetector,
    IEvidenceExtractor,
    IVaguenessDetector,
)
from src.intelligence.vagueness_detector import VaguenessDetector


class DeterministicAnswerEvaluator(IAnswerEvaluator):
    """Deterministic, heuristic-based AnswerEvaluator for testing, baseline, and fallback."""

    def __init__(
        self,
        evidence_extractor: Optional[IEvidenceExtractor] = None,
        competency_evaluator: Optional[ICompetencyEvaluator] = None,
        vagueness_detector: Optional[IVaguenessDetector] = None,
        contradiction_detector: Optional[IContradictionDetector] = None,
    ):
        self.evidence_extractor = evidence_extractor or EvidenceExtractor()
        self.competency_evaluator = competency_evaluator or CompetencyEvaluator()
        self.vagueness_detector = vagueness_detector or VaguenessDetector()
        self.contradiction_detector = contradiction_detector or ContradictionDetector()

    def evaluate(
        self,
        question: str,
        candidate_answer: str,
        target_competencies: List[str],
        interview_context: Optional[InterviewAIContext] = None,
        answer_id: str = "ANS-001",
        candidate_profile_summary: Optional[CandidateProfileSummary] = None,
    ) -> AnswerAnalysis:
        """Evaluate a candidate's answer deterministically into structured AnswerAnalysis."""
        # 1. Vagueness check
        is_vague, vague_reason = self.vagueness_detector.detect_vagueness(
            question=question,
            answer=candidate_answer,
            target_competencies=target_competencies,
        )

        # 2. Contradiction check
        accumulated_evidence = interview_context.accumulated_evidence if interview_context else []
        has_contradiction, contradiction_details = self.contradiction_detector.detect_contradictions(
            answer=candidate_answer,
            accumulated_evidence=accumulated_evidence,
            context=interview_context,
        )

        # 3. Evidence Extraction
        evidence_items = self.evidence_extractor.extract(
            question=question,
            answer=candidate_answer,
            target_competencies=target_competencies,
            answer_id=answer_id,
            context=interview_context,
        )

        # 4. Competency Evaluation
        findings, overall_perf, confidence, missing_info = self.competency_evaluator.evaluate(
            evidence=evidence_items,
            target_competencies=target_competencies,
            context=interview_context,
        )

        # Adjust ratings if vague or contradictory
        if is_vague:
            overall_perf = PerformanceRating.WEAK
            confidence = min(confidence, 0.60)
        elif has_contradiction:
            overall_perf = PerformanceRating.WEAK
            confidence = max(confidence, 0.85)

        # 5. Recommended follow-up
        recommended_follow_up: Optional[str] = None
        if has_contradiction:
            recommended_follow_up = f"Clarify apparent discrepancy: {contradiction_details}"
        elif is_vague:
            recommended_follow_up = f"Probe for concrete details: {vague_reason}"
        elif missing_info:
            missing_disp = ", ".join(m.replace("_", " ") for m in missing_info)
            recommended_follow_up = f"Probe missing competencies: {missing_disp}."
        elif overall_perf == PerformanceRating.STRONG:
            recommended_follow_up = "Probe deeper edge cases or scale trade-offs."

        return AnswerAnalysis(
            answer_id=answer_id,
            overall_performance=overall_perf,
            confidence=confidence,
            vague=is_vague,
            vague_reason=vague_reason,
            contradiction_detected=has_contradiction,
            contradiction_details=contradiction_details,
            missing_information=missing_info,
            evidence=evidence_items,
            competency_findings=findings,
            recommended_follow_up=recommended_follow_up,
        )
