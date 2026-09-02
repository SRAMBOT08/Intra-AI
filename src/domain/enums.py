"""Canonical domain enums for EchoSphere Member 1."""

from enum import Enum


class ActionType(str, Enum):
    """Canonical next action types supported by the meta-orchestrator."""
    ASK_QUESTION = "ASK_QUESTION"
    SWITCH_AGENT = "SWITCH_AGENT"
    COMPLETE = "COMPLETE"


class DifficultyLevel(str, Enum):
    """Interview question difficulty tiers."""
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class PerformanceRating(str, Enum):
    """Evaluation performance rating for competencies and overall answers."""
    STRONG = "STRONG"
    PARTIAL = "PARTIAL"
    WEAK = "WEAK"
    NOT_EVALUATED = "NOT_EVALUATED"


class EvidenceStrength(str, Enum):
    """Strength of extracted grounded candidate statements."""
    STRONG = "STRONG"
    MODERATE = "MODERATE"
    WEAK = "WEAK"


class AgentRole(str, Enum):
    """Interviewer persona functional roles."""
    TECHNICAL_INTERVIEWER = "Technical Interviewer"
    PRODUCT_LEAD = "Product Lead"
    SYSTEM_DESIGNER = "System Designer"
    HIRING_MANAGER = "Hiring Manager"


class CompetencyCategory(str, Enum):
    """Categorization of interview competencies."""
    TECHNICAL = "technical"
    PRODUCT = "product"
    LEADERSHIP = "leadership"
    BEHAVIORAL = "behavioral"


class AIEventType(str, Enum):
    """AI domain event identifiers for telemetry and audit."""
    ANSWER_ANALYZED = "ANSWER_ANALYZED"
    ACTION_DECIDED = "ACTION_DECIDED"
    AGENT_SWITCHED = "AGENT_SWITCHED"
    INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED"
