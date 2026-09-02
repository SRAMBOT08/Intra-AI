"""Deterministic template-based persona handoff transition builder.

Generates candidate-facing spoken handoff dialogue without external model calls.
"""

from typing import Optional
from src.domain.models import AgentProfile


class TransitionBuilder:
    """Constructs spoken handoff dialogue transitions between interviewer personas."""

    @staticmethod
    def _format_competency_name(competency_id: Optional[str]) -> str:
        """Format a competency ID like 'customer_impact' into 'customer impact'."""
        if not competency_id:
            return "the next area"
        return competency_id.replace("_", " ").strip()

    @classmethod
    def build_transition(
        cls,
        current_agent: Optional[AgentProfile],
        target_agent: Optional[AgentProfile],
        competency_id: Optional[str] = None,
        reason: Optional[str] = None,
    ) -> str:
        """Generate deterministic, natural handoff text for voice synthesis.

        Args:
            current_agent: The active interviewer AgentProfile, or None.
            target_agent: The target interviewer AgentProfile, or None.
            competency_id: The competency to explore next, or None.
            reason: Optional rationale for transition.

        Returns:
            A string containing the spoken handoff sentence.
        """
        competency_display = cls._format_competency_name(competency_id)

        # Fallback if target agent profile is missing or invalid
        if not target_agent:
            if competency_id:
                return f"Thank you for sharing those insights. Let's move on to the next section to explore {competency_display}."
            return "Thank you for sharing those insights. Let's proceed to the next part of our interview."

        target_name = target_agent.display_name
        target_role = target_agent.role.value if hasattr(target_agent.role, "value") else str(target_agent.role)
        current_id = current_agent.agent_id.lower() if current_agent else ""
        target_id = target_agent.agent_id.lower()

        # Specific high-polish template: technical -> product
        if current_id == "technical" and target_id == "product":
            if competency_id and "customer" in competency_id.lower():
                return (
                    f"Thank you for walking through the technical architecture. "
                    f"Now I'd like to hand over to {target_name} to explore the customer impact and business implications."
                )
            return (
                f"Thank you for walking through the technical architecture. "
                f"Now I'd like to hand over to {target_name} to continue our discussion."
            )

        # Specific high-polish template: product -> technical
        if current_id == "product" and target_id == "technical":
            return (
                f"Thank you for highlighting the product perspective. "
                f"I'm now handing over to {target_name} to dive deeper into the technical architecture and implementation details."
            )

        # Generic persona transition template based on AgentProfile fields
        if current_agent:
            return (
                f"Thank you for walking through that. "
                f"I'd now like to hand over to {target_name}, our {target_role}, to explore {competency_display}."
            )
        else:
            return (
                f"Thank you. "
                f"I'm now handing over to {target_name}, our {target_role}, to explore {competency_display}."
            )
