"""Graph relationship types and model representations for EchoSphere Knowledge Graph."""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class RelationshipType(str, Enum):
    """Canonical relationship types in the EchoSphere Knowledge Graph."""
    # Candidate connections
    WORKED_ON = "WORKED_ON"
    HAS_SKILL = "HAS_SKILL"
    HAS_EXPERIENCE = "HAS_EXPERIENCE"
    WORKED_ON_PROJECT = "WORKED_ON_PROJECT"
    PROVIDED = "PROVIDED"
    PARTICIPATED_IN = "PARTICIPATED_IN"
    HAS_ASSESSMENT = "HAS_ASSESSMENT"

    # Experience / Project connections
    INVOLVES = "INVOLVES"
    USES = "USES"

    # Question / Answer / Evidence
    ANSWERS = "ANSWERS"
    BELONGS_TO = "BELONGS_TO"
    CONTAINS_EVIDENCE = "CONTAINS_EVIDENCE"

    # Evidence grounding
    SUPPORTS = "SUPPORTS"
    MENTIONS = "MENTIONS"
    DEMONSTRATES = "DEMONSTRATES"

    # Assessment
    FOR_COMPETENCY = "FOR_COMPETENCY"

    # Contradiction
    CONTRADICTS = "CONTRADICTS"

    # Job requirements
    REQUIRES = "REQUIRES"


class GraphRelationship(BaseModel):
    """Explicit directed relationship between two graph nodes with metadata."""
    source_id: str = Field(..., description="Source node unique ID")
    type: RelationshipType = Field(..., description="Relationship type")
    target_id: str = Field(..., description="Target node unique ID")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of evidence grounding this link")
    metadata: Dict[str, str] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
