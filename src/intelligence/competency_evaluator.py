"""Competency finding evaluator and performance scoring implementation."""

from typing import List, Optional, Tuple

from src.domain.enums import EvidenceStrength, PerformanceRating
from src.domain.models import CompetencyFinding, EvidenceItem, InterviewAIContext
from src.intelligence.interfaces import ICompetencyEvaluator


class CompetencyEvaluator(ICompetencyEvaluator):
    """Evaluates competency findings and calculates confidence from grounded evidence."""

    def evaluate(
        self,
        evidence: List[EvidenceItem],
        target_competencies: List[str],
        context: Optional[InterviewAIContext] = None,
    ) -> Tuple[List[CompetencyFinding], PerformanceRating, float, List[str]]:
        """Evaluate evidence into competency findings, overall rating, confidence, and missing info."""
        findings: List[CompetencyFinding] = []
        missing_info: List[str] = []

        evidence_by_comp = {}
        for item in evidence:
            evidence_by_comp.setdefault(item.competency_id, []).append(item)

        confidences: List[float] = []

        for comp in target_competencies:
            items = evidence_by_comp.get(comp, [])
            evidence_ids = [item.evidence_id for item in items]

            if not items:
                findings.append(
                    CompetencyFinding(
                        competency_id=comp,
                        assessment=PerformanceRating.NOT_EVALUATED,
                        confidence=0.0,
                        evidence_ids=[],
                    )
                )
                missing_info.append(comp)
            else:
                has_strong = any(item.strength == EvidenceStrength.STRONG for item in items)
                if has_strong and len(items) >= 1:
                    assessment = PerformanceRating.STRONG
                    conf = 0.91
                else:
                    assessment = PerformanceRating.PARTIAL
                    conf = 0.72

                findings.append(
                    CompetencyFinding(
                        competency_id=comp,
                        assessment=assessment,
                        confidence=conf,
                        evidence_ids=evidence_ids,
                    )
                )
                confidences.append(conf)

        # Calculate overall rating and confidence
        if not findings or all(f.assessment == PerformanceRating.NOT_EVALUATED for f in findings):
            overall_rating = PerformanceRating.NOT_EVALUATED
            overall_conf = 0.1
        elif all(f.assessment == PerformanceRating.STRONG for f in findings if f.assessment != PerformanceRating.NOT_EVALUATED):
            overall_rating = PerformanceRating.STRONG
            overall_conf = sum(confidences) / max(len(confidences), 1)
        elif any(f.assessment in (PerformanceRating.STRONG, PerformanceRating.PARTIAL) for f in findings):
            overall_rating = PerformanceRating.PARTIAL
            overall_conf = sum(confidences) / max(len(confidences), 1)
        else:
            overall_rating = PerformanceRating.WEAK
            overall_conf = sum(confidences) / max(len(confidences), 1) if confidences else 0.5

        return findings, overall_rating, round(overall_conf, 2), missing_info
