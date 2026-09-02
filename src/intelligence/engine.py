"""Interview Intelligence Engine composing modular intelligence evaluators."""

import os
from typing import List, Optional

from src.domain.models import AnswerAnalysis, CandidateProfileSummary, InterviewAIContext
from src.intelligence.deterministic_evaluator import DeterministicAnswerEvaluator
from src.intelligence.interfaces import IAnswerEvaluator
from src.intelligence.llm_evaluator import LLMAnswerEvaluator


class InterviewIntelligenceEngine:
    """Core intelligence engine converting candidate answers into structured AnswerAnalysis."""

    def __init__(self, evaluator: Optional[IAnswerEvaluator] = None):
        if evaluator is not None:
            self.evaluator = evaluator
        else:
            eval_type = os.getenv("ECHOSPHERE_EVALUATOR_TYPE", "llm").lower()
            if eval_type == "deterministic":
                self.evaluator = DeterministicAnswerEvaluator()
            else:
                self.evaluator = LLMAnswerEvaluator(enable_fallback=True)

    def analyze(
        self,
        question: str,
        candidate_answer: str,
        target_competencies: List[str],
        interview_context: Optional[InterviewAIContext] = None,
        answer_id: str = "ANS-001",
        candidate_profile_summary: Optional[CandidateProfileSummary] = None,
    ) -> AnswerAnalysis:
        """Analyze a candidate's answer and produce structured AnswerAnalysis."""
        return self.evaluator.evaluate(
            question=question,
            candidate_answer=candidate_answer,
            target_competencies=target_competencies,
            interview_context=interview_context,
            answer_id=answer_id,
            candidate_profile_summary=candidate_profile_summary,
        )


def get_intelligence_engine(evaluator_type: Optional[str] = None) -> InterviewIntelligenceEngine:
    """Factory helper to obtain an engine with a specific evaluator implementation."""
    if evaluator_type == "deterministic":
        return InterviewIntelligenceEngine(evaluator=DeterministicAnswerEvaluator())
    elif evaluator_type == "llm":
        return InterviewIntelligenceEngine(evaluator=LLMAnswerEvaluator(enable_fallback=True))
    return InterviewIntelligenceEngine()


# Default engine instance for the application runtime
DEFAULT_INTELLIGENCE_ENGINE = InterviewIntelligenceEngine()
