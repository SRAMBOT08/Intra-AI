"""Abstract base repository interface for EchoSphere Knowledge Graph."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from src.knowledge_graph.types.nodes import (
    CandidateNode,
    InterviewRoundNode,
    ExperienceNode,
    ProjectNode,
    SkillNode,
    TechnologyNode,
    ConceptNode,
    CompetencyNode,
    QuestionNode,
    AnswerNode,
    EvidenceNode,
    AssessmentNode,
)
from src.knowledge_graph.types.relationships import GraphRelationship, RelationshipType
from src.knowledge_graph.types.contracts import (
    GraphUpdate,
    RelevantPersistentContext,
    CrossRoundContext,
    GraphVisualizationData,
)


class BaseKnowledgeGraphRepository(ABC):
    """Abstract interface defining all Knowledge Graph operations."""

    @abstractmethod
    async def initialize_schema(self) -> bool:
        """Initialize uniqueness constraints and indexes."""
        pass

    @abstractmethod
    async def apply_graph_update(self, update: GraphUpdate) -> bool:
        """Atomically apply a validated GraphUpdate with idempotent MERGE semantics."""
        pass

    @abstractmethod
    async def get_candidate_profile(self, candidate_id: str) -> Optional[CandidateNode]:
        """Fetch candidate profile node by candidate ID."""
        pass

    @abstractmethod
    async def get_candidate_skills(self, candidate_id: str) -> List[SkillNode]:
        """Fetch all verified skills associated with candidate."""
        pass

    @abstractmethod
    async def get_candidate_technologies(self, candidate_id: str) -> List[TechnologyNode]:
        """Fetch all verified technologies associated with candidate."""
        pass

    @abstractmethod
    async def get_candidate_experiences(self, candidate_id: str) -> List[ExperienceNode]:
        """Fetch all experiences and projects associated with candidate."""
        pass

    @abstractmethod
    async def get_competency_evidence(
        self, candidate_id: str, competency_id: str
    ) -> List[EvidenceNode]:
        """Fetch all evidence items supporting a specific candidate competency."""
        pass

    @abstractmethod
    async def get_competency_assessment_history(
        self, candidate_id: str, competency_id: str
    ) -> List[AssessmentNode]:
        """Fetch full historical assessment progression for a competency."""
        pass

    @abstractmethod
    async def get_candidate_contradictions(self, candidate_id: str) -> List[Dict[str, Any]]:
        """Fetch all detected contradiction relationships and grounded evidence pairs."""
        pass

    @abstractmethod
    async def get_round_history(self, candidate_id: str) -> List[InterviewRoundNode]:
        """Fetch all rounds completed by the candidate."""
        pass

    @abstractmethod
    async def get_relevant_candidate_knowledge(
        self, candidate_id: str, competency_id: Optional[str] = None
    ) -> RelevantPersistentContext:
        """Retrieve compact, relevant persistent context for M1 evaluation / prompt grounding."""
        pass

    @abstractmethod
    async def get_cross_round_context(
        self, candidate_id: str, current_competency: Optional[str] = None
    ) -> CrossRoundContext:
        """Retrieve grounded prior technical context for persona handoffs (e.g. Alex -> Jordan)."""
        pass

    @abstractmethod
    async def get_graph_visualization(self, candidate_id: str) -> GraphVisualizationData:
        """Generate read-only visualization data (nodes + links) for developer UI."""
        pass

    @abstractmethod
    async def clear(self) -> None:
        """Clear graph data (for testing)."""
        pass
