import { NextAction } from '@/types/echosphere';
import { getPersona, PERSONAS } from '@/lib/personas';
import { applyNextAction, updateSessionStatus } from '@/lib/session-store';

export interface ExecutionResult {
  activePersonaId: string;
  activePersonaName: string;
  spokenPrefix: string;
  systemPrompt: string;
  promptDirective: string;
  isComplete: boolean;
}

/**
 * Executes a canonical NextAction produced by Member 1 Meta-Orchestrator.
 * Follows the strict non-negotiable rule: Member 1 decides WHAT to do;
 * Member 2 decides HOW to execute that action in the Agora conversational experience.
 */
export function executeNextAction(
  sessionIdOrChannel: string,
  nextAction: NextAction
): ExecutionResult {
  // Update state in session store
  applyNextAction(sessionIdOrChannel, nextAction);

  switch (nextAction.action) {
    case 'SWITCH_AGENT': {
      const targetId = (nextAction.target_agent_id || 'product').toLowerCase();
      const targetPersona = getPersona(targetId);

      const transitionText =
        nextAction.handoff_transition_text ||
        `Thank you for walking through the technical architecture. Now I would like to hand over to ${targetPersona.display_name}, our ${targetPersona.role}, to explore the next competency.`;

      const promptDirective =
        nextAction.prompt_directive ||
        `Introduce yourself briefly as ${targetPersona.display_name}, the ${targetPersona.role}. Then ask your first probing question evaluating ${nextAction.competency_id || 'customer impact'}.`;

      return {
        activePersonaId: targetPersona.agent_id,
        activePersonaName: targetPersona.display_name,
        spokenPrefix: `${transitionText}\n\n`,
        systemPrompt: targetPersona.instructions,
        promptDirective,
        isComplete: false,
      };
    }

    case 'COMPLETE': {
      updateSessionStatus(sessionIdOrChannel, 'COMPLETED');
      const currentPersona = getPersona(nextAction.target_agent_id);

      return {
        activePersonaId: currentPersona.agent_id,
        activePersonaName: currentPersona.display_name,
        spokenPrefix: '',
        systemPrompt: currentPersona.instructions,
        promptDirective:
          'The interview is now complete. Graciously thank the candidate for their time, explain that all required areas have been evaluated, and let them know the recruiting team will follow up soon. Say goodbye pleasantly.',
        isComplete: true,
      };
    }

    case 'ASK_QUESTION':
    default: {
      const currentPersona = getPersona(nextAction.target_agent_id);
      const competency = nextAction.competency_id || 'system_design';
      const difficulty = nextAction.difficulty ? ` (${nextAction.difficulty} difficulty)` : '';

      const promptDirective =
        nextAction.prompt_directive ||
        `Probe deeper into ${competency}${difficulty}. Inquire into specific architectural decisions, trade-offs, and metrics. Keep your question concise and focused.`;

      return {
        activePersonaId: currentPersona.agent_id,
        activePersonaName: currentPersona.display_name,
        spokenPrefix: '',
        systemPrompt: currentPersona.instructions,
        promptDirective,
        isComplete: false,
      };
    }
  }
}
