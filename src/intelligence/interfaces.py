"""Abstract interfaces for modular, swappable interview intelligence components."""

from typing import List, Optional, Protocol, Tuple

from src.domain.enums import PerformanceRating
from src.domain.models import CompetencyFinding, EvidenceItem, InterviewAIContext


class IEvidenceExtractor(Protocol):
    """Protocol for extracting grounded evidence items from candidate answers."""

    def extract(
        self,
        question: str,
        answer: str,
        target_competencies: List[str],
        answer_id: str,
        context: Optional[InterviewAIContext] = None,
    ) -> List[EvidenceItem]:
        """Extract concrete candidate statements mapped to competencies."""
        ...


class ICompetencyEvaluator(Protocol):
    """Protocol for evaluating competency findings from extracted evidence."""

    def evaluate(
        self,
        evidence: List[EvidenceItem],
        target_competencies: List[str],
        context: Optional[InterviewAIContext] = None,
    ) -> Tuple[List[CompetencyFinding], PerformanceRating, float, List[str]]:
        """Evaluate evidence into competency findings, overall rating, confidence, and missing info."""
        ...


class IVaguenessDetector(Protocol):
    """Protocol for identifying vague or under-specified responses."""

    def detect_vagueness(
        self,
        question: str,
        answer: str,
        target_competencies: List[str],
    ) -> Tuple[bool, Optional[str]]:
        """Detect if answer lacks concrete depth, returning (is_vague, reason)."""
        ...


class IContradictionDetector(Protocol):
    """Protocol for detecting factual inconsistencies with previous context."""

    def detect_contradictions(
        self,
        answer: str,
        accumulated_evidence: List[EvidenceItem],
        context: Optional[InterviewAIContext] = None,
    ) -> Tuple[bool, Optional[str]]:
        """Detect if answer conflicts with prior evidence, returning (has_contradiction, details)."""
        ...
