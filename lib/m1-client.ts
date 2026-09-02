import {
  AnswerAnalysis,
  CandidateProfileSummary,
  InterviewAIContext,
  NextAction,
} from '@/types/echosphere';

const getIntelUrl = () => process.env.M1_INTELLIGENCE_URL || 'http://localhost:4005';
const getOrchUrl = () => process.env.M1_ORCHESTRATOR_URL || 'http://localhost:4004';

export interface AnalyzePayload {
  question: string;
  candidate_answer: string;
  target_competencies: string[];
  interview_context?: InterviewAIContext | null;
  answer_id?: string;
  candidate_profile_summary?: CandidateProfileSummary | null;
}

export interface NextActionPayload {
  interview_context: InterviewAIContext;
  answer_analysis?: AnswerAnalysis | null;
  required_competencies?: string[];
  is_final_round?: boolean;
  current_competency?: string | null;
}

/**
 * Call Member 1 Interview Intelligence service on :4005.
 * Analyzes candidate utterance against target competencies.
 */
export async function analyzeAnswer(payload: AnalyzePayload): Promise<AnswerAnalysis> {
  const answerId = payload.answer_id || `ANS-${Date.now()}`;
  try {
    const res = await fetch(`${getIntelUrl()}/v1/interview-intelligence/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        answer_id: answerId,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.warn(`[M1Client] Intelligence returned ${res.status}: ${errorText}`);
      return createFallbackAnalysis(payload, answerId);
    }

    const data: AnswerAnalysis = await res.json();
    return data;
  } catch (err) {
    console.error('[M1Client] Failed to call Intelligence API, using safe fallback:', err);
    return createFallbackAnalysis(payload, answerId);
  }
}

/**
 * Call Member 1 Meta-Orchestrator service on :4004.
 * Evaluates context and analysis to produce NextAction.
 */
export async function getNextAction(payload: NextActionPayload): Promise<NextAction> {
  try {
    const res = await fetch(`${getOrchUrl()}/v1/meta-orchestrator/next-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.warn(`[M1Client] Meta-Orchestrator returned ${res.status}: ${errorText}`);
      return createFallbackNextAction(payload);
    }

    const data: NextAction = await res.json();
    return data;
  } catch (err) {
    console.error('[M1Client] Failed to call Meta-Orchestrator API, using safe fallback:', err);
    return createFallbackNextAction(payload);
  }
}

// Aliases for backward compatibility
export const callM1Analyze = analyzeAnswer;
export const callM1NextAction = getNextAction;

/**
 * Retrieve compact, relevant persistent context for candidate from Knowledge Graph.
 */
export async function getRelevantPersistentContext(
  candidateId: string,
  competencyId?: string
): Promise<any> {
  try {
    const url = new URL(`${getIntelUrl()}/v1/knowledge-graph/candidates/${candidateId}/context`);
    if (competencyId) url.searchParams.set('competency_id', competencyId);
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[M1Client] Persistent context query warning:', e);
  }
  return {
    candidate_id: candidateId,
    candidate_name: 'Alex Johnson',
    summary_text: '',
  };
}

/**
 * Retrieve prior round technical context for persona handoffs (e.g., Alex -> Jordan).
 */
export async function getCrossRoundContext(
  candidateId: string,
  currentCompetency?: string
): Promise<any> {
  try {
    const url = new URL(`${getIntelUrl()}/v1/knowledge-graph/candidates/${candidateId}/cross-round`);
    if (currentCompetency) url.searchParams.set('current_competency', currentCompetency);
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[M1Client] Cross round context query warning:', e);
  }
  return {
    candidate_id: candidateId,
    candidate_name: 'Alex Johnson',
    grounded_bridge_prompt: '',
  };
}

/**
 * Ingest candidate CV into Knowledge Graph.
 */
export async function ingestCandidateCV(
  candidateId: string,
  cvText: string,
  candidateName: string = 'Alex Johnson'
): Promise<boolean> {
  try {
    const res = await fetch(`${getIntelUrl()}/v1/knowledge-graph/cv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        cv_text: cvText,
        candidate_name: candidateName,
      }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch (e) {
    console.warn('[M1Client] CV ingest warning:', e);
    return false;
  }
}

/**
 * Get read-only visualization data for developer UI.
 */
export async function getGraphVisualization(candidateId: string): Promise<any> {
  try {
    const res = await fetch(
      `${getIntelUrl()}/v1/knowledge-graph/candidates/${candidateId}/visualization`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[M1Client] Graph visualization warning:', e);
  }
  return { nodes: [], links: [] };
}

/**
 * Safe fallback for Intelligence failure (preserves conversational flow without inventing high confidence).
 */
function createFallbackAnalysis(payload: AnalyzePayload, answerId: string): AnswerAnalysis {
  const comp = payload.target_competencies[0] || 'system_design';
  return {
    answer_id: answerId,
    overall_performance: 'PARTIAL',
    confidence: 0.5,
    vague: false,
    vague_reason: null,
    contradiction_detected: false,
    contradiction_details: null,
    missing_information: [],
    evidence: [
      {
        evidence_id: `EVID-${answerId}-FALLBACK`,
        answer_id: answerId,
        competency_id: comp,
        statement: payload.candidate_answer.slice(0, 120),
        strength: 'MODERATE',
        timestamp: new Date().toISOString(),
      },
    ],
    competency_findings: [
      {
        competency_id: comp,
        assessment: 'PARTIAL',
        confidence: 0.5,
        evidence_ids: [`EVID-${answerId}-FALLBACK`],
      },
    ],
    recommended_follow_up: 'Continue with the interview plan.',
  };
}

/**
 * Safe fallback for Orchestrator failure.
 */
function createFallbackNextAction(payload: NextActionPayload): NextAction {
  const currentAgent = payload.interview_context.current_agent_id || 'technical';
  const currentComp = payload.current_competency || payload.required_competencies?.[0] || 'system_design';
  return {
    action: 'ASK_QUESTION',
    target_agent_id: currentAgent,
    competency_id: currentComp,
    difficulty: payload.interview_context.difficulty || 'MEDIUM',
    reason: 'Safe fallback: Meta-Orchestrator temporarily unavailable; continuing planned competency probe.',
    prompt_directive: `Probe further into ${currentComp}. Ask for specific architectural trade-offs and decisions.`,
    handoff_transition_text: null,
  };
}
