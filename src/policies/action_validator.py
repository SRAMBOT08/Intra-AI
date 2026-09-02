"""Action validator ensuring NextAction meets safety and domain constraints."""

from typing import Optional
from src.domain.enums import ActionType
from src.domain.models import NextAction
from src.policies.agent_registry import DEFAULT_AGENT_REGISTRY, AgentRegistry


class ActionValidator:
    """Validates NextAction objects to prevent illegal transitions or incomplete directives."""

    @classmethod
    def validate(cls, action: NextAction, registry: Optional[AgentRegistry] = None) -> NextAction:
        """Validate and return the NextAction, raising ValueError if invariants are violated.

        Args:
            action: The candidate NextAction to validate.
            registry: Optional AgentRegistry for verifying target_agent_id.

        Returns:
            The validated NextAction.

        Raises:
            ValueError: If action is invalid or missing required invariants.
        """
        reg = registry or DEFAULT_AGENT_REGISTRY

        if not action.reason or not action.reason.strip():
            raise ValueError("NextAction must contain a non-empty reason.")

        if action.action == ActionType.SWITCH_AGENT:
            if not action.target_agent_id:
                raise ValueError("SWITCH_AGENT action requires target_agent_id.")
            if not reg.get(action.target_agent_id):
                raise ValueError(f"SWITCH_AGENT target '{action.target_agent_id}' is not a registered agent.")
            if not action.handoff_transition_text or not action.handoff_transition_text.strip():
                raise ValueError("SWITCH_AGENT action requires non-empty handoff_transition_text.")

        elif action.action == ActionType.ASK_QUESTION:
            if not action.target_agent_id:
                raise ValueError("ASK_QUESTION action requires target_agent_id.")
            if not action.prompt_directive or not action.prompt_directive.strip():
                raise ValueError("ASK_QUESTION action requires prompt_directive.")

        elif action.action == ActionType.COMPLETE:
            # Complete may clear handoff text and keep prompt directive clean
            pass

        else:
            raise ValueError(f"Unsupported action type: {action.action}")

        return action
