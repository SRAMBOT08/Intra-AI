"""External contracts and context payload structures for EchoSphere Knowledge Graph."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from src.knowledge_graph.types.relationships import RelationshipType


class EntityItem(BaseModel):
    """Extracted entity item for validated GraphUpdate payload."""
    entity_id: str = Field(..., description="Unique entity ID, e.g., 'skill:redis'")
    type: str = Field(..., description="Node label/type: CANDIDATE, SKILL, TECHNOLOGY, CONCEPT, EXPERIENCE, PROJECT, COMPETENCY")
    label: str = Field(..., description="Human readable name or label")
    properties: Dict[str, Any] = Field(default_factory=dict)


class RelationshipItem(BaseModel):
    """Extracted relationship item for validated GraphUpdate payload."""
    source_id: str = Field(..., description="Source node ID")
    type: RelationshipType = Field(...)
    target_id: str = Field(..., description="Target node ID")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    evidence_ids: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphUpdate(BaseModel):
    """Structured, validated contract for atomic Knowledge Graph mutations."""
    candidate_id: str = Field(...)
    round_id: str = Field(...)
    answer_id: Optional[str] = Field(default=None)
    question_id: Optional[str] = Field(default=None)
    entities: List[EntityItem] = Field(default_factory=list)
    relationships: List[RelationshipItem] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class RelevantPersistentContext(BaseModel):
    """Compact, targeted candidate context retrieved from Knowledge Graph for M1 / LangGraph."""
    candidate_id: str
    candidate_name: str
    relevant_experiences: List[Dict[str, Any]] = Field(default_factory=list)
    relevant_skills: List[str] = Field(default_factory=list)
    relevant_technologies: List[str] = Field(default_factory=list)
    relevant_concepts: List[str] = Field(default_factory=list)
    prior_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    prior_assessments: Dict[str, str] = Field(default_factory=dict)
    unresolved_contradictions: List[Dict[str, Any]] = Field(default_factory=list)
    summary_text: str = Field(default="", description="Compact human-readable summary for LLM prompt grounding")


class CrossRoundContext(BaseModel):
    """Grounded cross-round context supplied when switching personas (e.g., Alex -> Jordan)."""
    candidate_id: str
    candidate_name: str
    completed_rounds: List[int] = Field(default_factory=list)
    technical_highlights: List[str] = Field(default_factory=list)
    verified_technologies: List[str] = Field(default_factory=list)
    verified_concepts: List[str] = Field(default_factory=list)
    prior_competency_ratings: Dict[str, str] = Field(default_factory=dict)
    grounded_bridge_prompt: str = Field(default="")


class GraphVisualizationData(BaseModel):
    """Read-only node-link graph payload for developer UI visualizer."""
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
