"""Agent persona registry for EchoSphere."""

from typing import Dict, List, Optional

from src.domain.enums import ActionType, AgentRole, DifficultyLevel
from src.domain.models import AgentProfile


class AgentRegistry:
    """Registry maintaining active and configured interviewer personas."""

    def __init__(self, populate_defaults: bool = True):
        self._agents: Dict[str, AgentProfile] = {}
        if populate_defaults:
            self._register_default_personas()

    def _register_default_personas(self) -> None:
        # Technical Interviewer: Alex
        self.register(
            AgentProfile(
                agent_id="technical",
                role=AgentRole.TECHNICAL_INTERVIEWER,
                display_name="Alex",
                description="Technical interviewer assessing system architecture, distributed systems, and scalability.",
                focal_competencies=["system_design", "scalability"],
                questioning_style="deep technical probe",
                instructions="Evaluate engineering depth, architectural decisions, and trade-off analysis.",
                min_difficulty=DifficultyLevel.EASY,
                max_difficulty=DifficultyLevel.HARD,
                allowed_actions=[ActionType.ASK_QUESTION, ActionType.SWITCH_AGENT, ActionType.COMPLETE],
            )
        )

        # Product Lead: Jordan
        self.register(
            AgentProfile(
                agent_id="product",
                role=AgentRole.PRODUCT_LEAD,
                display_name="Jordan",
                description="Product lead assessing business impact, customer empathy, and product trade-offs.",
                focal_competencies=["customer_impact"],
                questioning_style="business and customer value exploration",
                instructions="Evaluate user experience focus, cross-functional alignment, and product metrics.",
                min_difficulty=DifficultyLevel.EASY,
                max_difficulty=DifficultyLevel.HARD,
                allowed_actions=[ActionType.ASK_QUESTION, ActionType.SWITCH_AGENT, ActionType.COMPLETE],
            )
        )

    def register(self, profile: AgentProfile) -> None:
        """Register or update an agent profile."""
        self._agents[profile.agent_id.lower()] = profile

    def get(self, agent_id: str) -> Optional[AgentProfile]:
        """Get an agent profile by agent_id."""
        if not agent_id:
            return None
        return self._agents.get(agent_id.lower())

    def get_owner_for_competency(self, competency_id: str) -> Optional[AgentProfile]:
        """Find the agent profile whose focal_competencies includes competency_id."""
        if not competency_id:
            return None
        comp_norm = competency_id.lower()
        for agent in self._agents.values():
            if any(focal.lower() == comp_norm for focal in agent.focal_competencies):
                return agent
        return None

    def list_agents(self) -> List[AgentProfile]:
        """Return all registered agent profiles."""
        return list(self._agents.values())


# Global default registry instance
DEFAULT_AGENT_REGISTRY = AgentRegistry(populate_defaults=True)
