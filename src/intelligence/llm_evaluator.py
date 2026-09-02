"""LLM-backed AnswerEvaluator converting candidate answers into structured AnswerAnalysis."""

from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional

from pydantic import ValidationError

from src.domain.enums import EvidenceStrength, PerformanceRating
from src.domain.models import (
    AnswerAnalysis,
    CandidateProfileSummary,
    CompetencyFinding,
    EvidenceItem,
    InterviewAIContext,
)
from src.intelligence.deterministic_evaluator import DeterministicAnswerEvaluator
from src.intelligence.interfaces import IAnswerEvaluator, ILLMClient
from src.intelligence.llm_client import HTTPLLMClient, LLMProviderError

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are the AI Interview Intelligence Evaluator for EchoSphere.
Your role is to objectively evaluate a candidate's spoken interview answer against targeted job competencies, extract grounded evidence, assess performance levels, detect vagueness, and flag any factual contradictions with prior context.

CRITICAL INSTRUCTIONS:
1. Grounding: Every evidence statement must be directly extracted or faithfully summarized from the candidate's actual answer. Do NOT invent claims.
2. Competency Findings: For each competency in target_competencies:
   - If candidate demonstrated deep, concrete knowledge: assessment = "STRONG", confidence between 0.85 and 0.98.
   - If candidate demonstrated basic, incomplete, or surface-level knowledge: assessment = "PARTIAL", confidence between 0.65 and 0.80.
   - If candidate demonstrated incorrect or counterproductive knowledge: assessment = "WEAK", confidence between 0.70 and 0.90.
   - If the competency was not addressed in the answer: assessment = "NOT_EVALUATED", confidence = 0.0, evidence_ids = [].
3. Vagueness: If the answer relies on buzzwords, generic fluff (e.g. 'we used microservices and best practices to make it fast'), or lacks concrete architectural decisions/metrics:
   - set vague = true
   - provide a concise vague_reason explaining what concrete specifics are missing.
4. Contradictions: Compare the current answer against the provided 'Prior Accumulated Evidence'. If the candidate makes an assertion materially contradicting earlier statements:
   - set contradiction_detected = true
   - provide detailed contradiction_details citing the discrepancy.
5. Overall Rating: Rate overall_performance as "STRONG", "PARTIAL", "WEAK", or "NOT_EVALUATED".
6. Do NOT decide interview routing, agent switching, or interview completion. You ONLY evaluate what the candidate demonstrated.

You MUST output valid JSON matching this exact structure:
{
  "answer_id": "string",
  "overall_performance": "STRONG | PARTIAL | WEAK | NOT_EVALUATED",
  "confidence": 0.0 to 1.0,
  "vague": false,
  "vague_reason": null or "string",
  "contradiction_detected": false,
  "contradiction_details": null or "string",
  "missing_information": ["competency_or_detail_name"],
  "evidence": [
    {
      "evidence_id": "EVID-ANS-001-001",
      "answer_id": "string",
      "competency_id": "string",
      "statement": "string",
      "strength": "STRONG | MODERATE | WEAK",
      "timestamp": "ISO-8601 string"
    }
  ],
  "competency_findings": [
    {
      "competency_id": "string",
      "assessment": "STRONG | PARTIAL | WEAK | NOT_EVALUATED",
      "confidence": 0.0 to 1.0,
      "evidence_ids": ["EVID-ANS-001-001"]
    }
  ],
  "recommended_follow_up": null or "string"
}
"""


class LLMAnswerEvaluator(IAnswerEvaluator):
    """LLM-backed answer evaluator that produces canonical AnswerAnalysis."""

    def __init__(
        self,
        llm_client: Optional[ILLMClient] = None,
        fallback_evaluator: Optional[IAnswerEvaluator] = None,
        enable_fallback: bool = True,
    ):
        self.llm_client = llm_client or HTTPLLMClient()
        self.fallback_evaluator = fallback_evaluator or DeterministicAnswerEvaluator()
        self.enable_fallback = enable_fallback

    def _build_user_prompt(
        self,
        question: str,
        candidate_answer: str,
        target_competencies: List[str],
        interview_context: Optional[InterviewAIContext] = None,
        answer_id: str = "ANS-001",
        candidate_profile_summary: Optional[CandidateProfileSummary] = None,
    ) -> str:
        """Construct structured user prompt with question, answer, and context."""
        context_data: Dict[str, Any] = {
            "answer_id": answer_id,
            "question": question,
            "candidate_answer": candidate_answer,
            "target_competencies": target_competencies,
        }

        if interview_context:
            context_data["interview_id"] = interview_context.interview_id
            context_data["current_difficulty"] = interview_context.difficulty.value
            context_data["previously_evaluated_competencies"] = {
                k: v.value if hasattr(v, "value") else str(v)
                for k, v in interview_context.evaluated_competencies.items()
            }
            context_data["prior_accumulated_evidence"] = [
                {
                    "competency_id": item.competency_id,
                    "statement": item.statement,
                    "strength": item.strength.value if hasattr(item.strength, "value") else str(item.strength),
                }
                for item in interview_context.accumulated_evidence
            ]
            context_data["historical_contradictions"] = interview_context.detected_contradictions

        if candidate_profile_summary:
            context_data["candidate_profile"] = candidate_profile_summary.model_dump()

        return f"Evaluate the following candidate interview turn:\n\n{json.dumps(context_data, indent=2)}"

    def evaluate(
        self,
        question: str,
        candidate_answer: str,
        target_competencies: List[str],
        interview_context: Optional[InterviewAIContext] = None,
        answer_id: str = "ANS-001",
        candidate_profile_summary: Optional[CandidateProfileSummary] = None,
    ) -> AnswerAnalysis:
        """Evaluate candidate answer using LLM with structured output, validation, and safe fallback."""
        user_prompt = self._build_user_prompt(
            question=question,
            candidate_answer=candidate_answer,
            target_competencies=target_competencies,
            interview_context=interview_context,
            answer_id=answer_id,
            candidate_profile_summary=candidate_profile_summary,
        )

        try:
            raw_response = self.llm_client.generate(
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt,
            )

            # Parse JSON
            data = json.loads(raw_response)
            
            # Ensure answer_id is enforced
            data["answer_id"] = answer_id

            # Ensure evidence items have valid defaults
            if "evidence" in data and isinstance(data["evidence"], list):
                for idx, item in enumerate(data["evidence"], start=1):
                    item["answer_id"] = answer_id
                    if not item.get("evidence_id"):
                        item["evidence_id"] = f"EVID-{answer_id}-{idx:03d}"
                    if not item.get("timestamp"):
                        item["timestamp"] = datetime.now(timezone.utc).isoformat()
                    if not item.get("strength"):
                        item["strength"] = "STRONG"

            analysis = AnswerAnalysis.model_validate(data)
            logger.info(
                "LLM evaluation succeeded for answer_id=%s, overall_performance=%s, evidence_items=%d",
                answer_id,
                analysis.overall_performance.value,
                len(analysis.evidence),
            )
            return analysis

        except Exception as exc:
            logger.warning(
                "LLM evaluation failed or returned invalid schema for answer_id=%s: %s (fallback_enabled=%s)",
                answer_id,
                str(exc),
                self.enable_fallback,
            )
            if self.enable_fallback and self.fallback_evaluator:
                logger.info("Executing deterministic fallback evaluator for answer_id=%s", answer_id)
                return self.fallback_evaluator.evaluate(
                    question=question,
                    candidate_answer=candidate_answer,
                    target_competencies=target_competencies,
                    interview_context=interview_context,
                    answer_id=answer_id,
                    candidate_profile_summary=candidate_profile_summary,
                )
            raise LLMProviderError(f"LLMAnswerEvaluator failed without fallback: {str(exc)}") from exc
