"""Contradiction detector implementation comparing current answer with prior context."""

from typing import List, Optional, Tuple
import re

from src.domain.models import EvidenceItem, InterviewAIContext
from src.intelligence.interfaces import IContradictionDetector


class ContradictionDetector(IContradictionDetector):
    """Detects material inconsistencies between the current answer and accumulated evidence."""

    CONTRADICTION_PAIRS = [
        (r"\bsingle[- ]node\b", r"\b(sharded|distributed cluster|multi[- ]node)\b"),
        (r"\bno caching\b", r"\b(redis cache|memcached|write-through cache)\b"),
        (r"\bpurely synchronous\b", r"\b(event-driven|async message queue|kafka)\b"),
        (r"\bmonolith(ic)?\b", r"\b(microservices architecture|serverless microservices)\b"),
        (r"\bno database\b", r"\b(postgresql|mysql|dynamodb|mongodb)\b"),
    ]

    def detect_contradictions(
        self,
        answer: str,
        accumulated_evidence: List[EvidenceItem],
        context: Optional[InterviewAIContext] = None,
    ) -> Tuple[bool, Optional[str]]:
        """Detect if the current answer contradicts previous evidence statements."""
        if not answer or not accumulated_evidence:
            return False, None

        answer_lower = answer.lower()

        # Combine past evidence statements
        past_statements = [item.statement.lower() for item in accumulated_evidence]
        combined_past = " ".join(past_statements)

        for pat1, pat2 in self.CONTRADICTION_PAIRS:
            # Pattern 1 in past, Pattern 2 in current
            if re.search(pat1, combined_past) and re.search(pat2, answer_lower):
                match1 = re.search(pat1, combined_past).group(0)
                match2 = re.search(pat2, answer_lower).group(0)
                return True, f"Earlier statement claimed '{match1}', but current answer states '{match2}'."

            # Pattern 2 in past, Pattern 1 in current
            if re.search(pat2, combined_past) and re.search(pat1, answer_lower):
                match1 = re.search(pat1, answer_lower).group(0)
                match2 = re.search(pat2, combined_past).group(0)
                return True, f"Earlier statement claimed '{match2}', but current answer states '{match1}'."

        return False, None
