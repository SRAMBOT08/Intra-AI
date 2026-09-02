"""Vagueness and ambiguity detector implementation."""

from typing import List, Optional, Tuple
import re

from src.intelligence.interfaces import IVaguenessDetector


class VaguenessDetector(IVaguenessDetector):
    """Detects vague, unsubstantiated, or overly generic candidate answers."""

    VAGUE_PHRASES = [
        "we used best practices",
        "standard approach",
        "it worked well",
        "we just scaled it",
        "handled everything",
        "normal way",
        "good architecture",
        "nice and clean",
        "did some stuff",
        "typical setup",
        "we used microservices",
        "we made it fast",
    ]

    def detect_vagueness(
        self,
        question: str,
        answer: str,
        target_competencies: List[str],
    ) -> Tuple[bool, Optional[str]]:
        """Detect if the answer lacks concrete technical/factual depth."""
        if not answer or not answer.strip():
            return True, "Candidate provided an empty or near-empty response."

        cleaned = answer.strip()
        words = cleaned.split()

        # Extremely brief answers (under 8 words)
        if len(words) < 8:
            return True, f"Answer is too brief ({len(words)} words) and lacks concrete detail."

        cleaned_lower = cleaned.lower()

        # Check for presence of known generic non-specific phrases without concrete detail
        for phrase in self.VAGUE_PHRASES:
            if phrase in cleaned_lower and len(words) < 25:
                return True, f"Answer relied on generic claim '{phrase}' without concrete architectural decisions or metrics."

        # If answer has no concrete technical entities or actionable specifics
        has_specifics = bool(
            re.search(
                r"\b(redis|postgres|postgresql|kafka|aws|cache|caching|latency|ms|qps|sql|nosql|sharded|replica|api|database|http|grpc|user|customer|metric)\b",
                cleaned_lower,
            )
        )
        if not has_specifics and len(words) < 20:
            return True, "Answer lacks concrete technical mechanisms, tools, metrics, or trade-offs."

        return False, None
