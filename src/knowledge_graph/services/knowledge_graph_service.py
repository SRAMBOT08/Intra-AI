"""High-level Knowledge Graph service orchestrating extraction, validation, and retrieval."""

import logging
from typing import Any, Dict, List, Optional
from src.domain.models import AnswerAnalysis
from src.knowledge_graph.extraction.cv_extractor import CVKnowledgeExtractor
from src.knowledge_graph.extraction.jd_extractor import JDKnowledgeExtractor
from src.knowledge_graph.extraction.answer_extractor import AnswerGraphExtractor
from src.knowledge_graph.repository.base import BaseKnowledgeGraphRepository
from src.knowledge_graph.repository.factory import get_knowledge_graph_repository
from src.knowledge_graph.types.contracts import (
    GraphUpdate,
    RelevantPersistentContext,
    CrossRoundContext,
    GraphVisualizationData,
)
from src.knowledge_graph.validation.validator import GraphUpdateValidator

logger = logging.getLogger(__name__)


class KnowledgeGraphService:
    """Service facade for all Knowledge Graph interactions in EchoSphere."""

    def __init__(self, repository: Optional[BaseKnowledgeGraphRepository] = None):
        self.repo = repository or get_knowledge_graph_repository()

    async def ingest_cv(
        self,
        candidate_id: str,
        cv_text: str,
        candidate_name: str = "Alex Johnson",
        round_id: str = "ROUND-000",
    ) -> bool:
        """Extract and persist verified candidate profile and facts from CV."""
        try:
            update = CVKnowledgeExtractor.extract_from_cv(
                candidate_id=candidate_id,
                cv_text=cv_text,
                candidate_name=candidate_name,
                round_id=round_id,
            )
            is_valid, errors = GraphUpdateValidator.validate(update)
            if not is_valid:
                logger.error(f"[KnowledgeGraphService] CV validation errors: {errors}")
                return False
            return await self.repo.apply_graph_update(update)
        except Exception as e:
            logger.error(f"[KnowledgeGraphService] Error ingesting CV: {e}")
            return False

    async def ingest_jd(
        self,
        job_id: str,
        job_title: str,
        job_description: str,
        required_competencies: Optional[List[str]] = None,
    ) -> bool:
        """Extract and persist job competency requirements."""
        try:
            update = JDKnowledgeExtractor.extract_from_jd(
                job_id=job_id,
                job_title=job_title,
                job_description=job_description,
                required_competencies=required_competencies,
            )
            return await self.repo.apply_graph_update(update)
        except Exception as e:
            logger.error(f"[KnowledgeGraphService] Error ingesting JD: {e}")
            return False

    async def process_answer_analysis(
        self,
        candidate_id: str,
        round_id: str,
        question_id: str,
        question_text: str,
        answer_id: str,
        candidate_answer: str,
        analysis: AnswerAnalysis,
    ) -> bool:
        """Extract evidence and mutate Knowledge Graph idempotently from AnswerAnalysis."""
        try:
            update = AnswerGraphExtractor.extract_from_analysis(
                candidate_id=candidate_id,
                round_id=round_id,
                question_id=question_id,
                question_text=question_text,
                answer_id=answer_id,
                candidate_answer=candidate_answer,
                analysis=analysis,
            )
            is_valid, errors = GraphUpdateValidator.validate(update)
            if not is_valid:
                logger.warning(f"[KnowledgeGraphService] GraphUpdate validation warnings: {errors}")
                return False
            return await self.repo.apply_graph_update(update)
        except Exception as e:
            logger.error(f"[KnowledgeGraphService] Error processing answer analysis: {e}")
            return False

    async def get_relevant_context(
        self, candidate_id: str, competency_id: Optional[str] = None
    ) -> RelevantPersistentContext:
        """Retrieve compact, targeted candidate knowledge for M1 / LangGraph."""
        try:
            return await self.repo.get_relevant_candidate_knowledge(candidate_id, competency_id)
        except Exception as e:
            logger.error(f"[KnowledgeGraphService] Error retrieving relevant context: {e}")
            return RelevantPersistentContext(
                candidate_id=candidate_id,
                candidate_name="Candidate",
                summary_text="No prior graph context available.",
            )

    async def get_cross_round_context(
        self, candidate_id: str, current_competency: Optional[str] = None
    ) -> CrossRoundContext:
        """Retrieve prior round technical knowledge for Jordan (Product Lead)."""
        try:
            return await self.repo.get_cross_round_context(candidate_id, current_competency)
        except Exception as e:
            logger.error(f"[KnowledgeGraphService] Error retrieving cross round context: {e}")
            return CrossRoundContext(
                candidate_id=candidate_id,
                candidate_name="Alex Johnson",
            )

    async def get_visualization(self, candidate_id: str) -> GraphVisualizationData:
        """Generate read-only visualization data for developer UI."""
        return await self.repo.get_graph_visualization(candidate_id)
