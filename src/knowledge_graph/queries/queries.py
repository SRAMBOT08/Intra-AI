"""Typed query execution helper functions for EchoSphere Knowledge Graph."""

from typing import Any, Dict, List, Optional
from src.knowledge_graph.repository.base import BaseKnowledgeGraphRepository
from src.knowledge_graph.types.nodes import (
    CandidateNode,
    InterviewRoundNode,
    ExperienceNode,
    SkillNode,
    TechnologyNode,
    EvidenceNode,
    AssessmentNode,
)
from src.knowledge_graph.types.contracts import (
    RelevantPersistentContext,
    CrossRoundContext,
    GraphVisualizationData,
)


class KnowledgeGraphQueries:
    """Provides typed query operations against the Knowledge Graph repository."""

    def __init__(self, repository: BaseKnowledgeGraphRepository):
        self.repo = repository

    async def get_candidate_profile(self, candidate_id: str) -> Optional[CandidateNode]:
        return await self.repo.get_candidate_profile(candidate_id)

    async def get_candidate_skills(self, candidate_id: str) -> List[SkillNode]:
        return await self.repo.get_candidate_skills(candidate_id)

    async def get_candidate_technologies(self, candidate_id: str) -> List[TechnologyNode]:
        return await self.repo.get_candidate_technologies(candidate_id)

    async def get_candidate_experiences(self, candidate_id: str) -> List[ExperienceNode]:
        return await self.repo.get_candidate_experiences(candidate_id)

    async def get_competency_evidence(
        self, candidate_id: str, competency_id: str
    ) -> List[EvidenceNode]:
        return await self.repo.get_competency_evidence(candidate_id, competency_id)

    async def get_competency_assessment_history(
        self, candidate_id: str, competency_id: str
    ) -> List[AssessmentNode]:
        return await self.repo.get_competency_assessment_history(candidate_id, competency_id)

    async def get_candidate_contradictions(self, candidate_id: str) -> List[Dict[str, Any]]:
        return await self.repo.get_candidate_contradictions(candidate_id)

    async def get_round_history(self, candidate_id: str) -> List[InterviewRoundNode]:
        return await self.repo.get_round_history(candidate_id)

    async def get_relevant_candidate_knowledge(
        self, candidate_id: str, competency_id: Optional[str] = None
    ) -> RelevantPersistentContext:
        return await self.repo.get_relevant_candidate_knowledge(candidate_id, competency_id)

    async def get_cross_round_context(
        self, candidate_id: str, current_competency: Optional[str] = None
    ) -> CrossRoundContext:
        return await self.repo.get_cross_round_context(candidate_id, current_competency)

    async def get_graph_visualization(self, candidate_id: str) -> GraphVisualizationData:
        return await self.repo.get_graph_visualization(candidate_id)
