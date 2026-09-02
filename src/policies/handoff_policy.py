"""Handoff policy resolving agent competency ownership and handoff transitions."""

from typing import Optional, Tuple
from src.domain.enums import ActionType
from src.domain.models import AgentProfile
from src.policies.agent_registry import DEFAULT_AGENT_REGISTRY, AgentRegistry
from src.policies.transition_builder import TransitionBuilder


class HandoffPolicy:
    """Resolves persona ownership for competency gaps and builds action/handoff text."""

    @classmethod
    def resolve_action_for_gap(
        cls,
        selected_gap: str,
        current_agent_id: str,
        registry: Optional[AgentRegistry] = None,
        directive_override: Optional[str] = None,
    ) -> Tuple[ActionType, str, Optional[str], str, Optional[str], Optional[str]]:
        """Determine whether to ASK_QUESTION or SWITCH_AGENT for the selected gap.

        Args:
            selected_gap: The competency ID to address next.
            current_agent_id: The ID of the currently active agent persona.
            registry: Optional AgentRegistry (defaults to DEFAULT_AGENT_REGISTRY).
            directive_override: Optional explicit directive string.

        Returns:
            Tuple of:
                - ActionType (ASK_QUESTION or SWITCH_AGENT)
                - target_agent_id
                - competency_id
                - reason
                - prompt_directive
                - handoff_transition_text (None if ASK_QUESTION)
        """
        reg = registry or DEFAULT_AGENT_REGISTRY
        current_profile: Optional[AgentProfile] = reg.get(current_agent_id)
        owner_profile: Optional[AgentProfile] = reg.get_owner_for_competency(selected_gap)

        # Fallback if no specific owner is registered for this competency
        if not owner_profile:
            target_id = current_agent_id
            action = ActionType.ASK_QUESTION
            reason = f"Current persona continues interview on unresolved competency: {selected_gap}."
            directive = directive_override or f"Explore candidate competency: {selected_gap}."
            return action, target_id, selected_gap, reason, directive, None

        # If current agent owns the competency gap -> Stay and ask question
        if owner_profile.agent_id.lower() == current_agent_id.lower():
            action = ActionType.ASK_QUESTION
            target_id = current_agent_id
            reason = (
                f"Candidate has unresolved competency '{selected_gap}' "
                f"which belongs to active persona {owner_profile.display_name}."
            )
            directive = directive_override or f"Probe {selected_gap.replace('_', ' ')} with a targeted follow-up question."
            return action, target_id, selected_gap, reason, directive, None

        # Competency belongs to a different persona -> SWITCH_AGENT
        action = ActionType.SWITCH_AGENT
        target_id = owner_profile.agent_id
        reason = (
            f"Candidate has coverage for previous area; "
            f"'{selected_gap}' belongs to {owner_profile.display_name} ({owner_profile.role.value})."
        )
        directive = directive_override or f"Introduce and probe {selected_gap.replace('_', ' ')}."
        transition_text = TransitionBuilder.build_transition(
            current_agent=current_profile,
            target_agent=owner_profile,
            competency_id=selected_gap,
            reason=reason,
        )
        return action, target_id, selected_gap, reason, directive, transition_text
