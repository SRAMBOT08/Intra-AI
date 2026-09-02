import {
  AnswerAnalysis,
  AssessmentReport,
  EvidenceItem,
  InterviewAIContext,
  InterviewSession,
  InterviewStatus,
  NextAction,
  PerformanceRating,
} from '@/types/echosphere';

// Global in-memory store for Hackathon sessions
declare global {
  var __echosphere_sessions__: Map<string, InterviewSession> | undefined;
}

if (!global.__echosphere_sessions__) {
  global.__echosphere_sessions__ = new Map<string, InterviewSession>();
}

const sessions = global.__echosphere_sessions__;

export function createSession(params: {
  interview_id?: string;
  candidate_id?: string;
  job_id?: string;
  job_title?: string;
  job_description?: string;
  required_competencies?: string[];
  initial_agent_id?: 'technical' | 'product';
}): InterviewSession {
  const interview_id = params.interview_id || `INT-${Date.now()}`;
  const candidate_id = params.candidate_id || `CAND-${Math.floor(Math.random() * 900) + 100}`;
  const required_competencies = params.required_competencies || [
    'system_design',
    'scalability',
    'customer_impact',
  ];
  const current_agent_id = params.initial_agent_id || 'technical';
  const channel_name = `echosphere-${interview_id.toLowerCase()}`;

  const ai_context: InterviewAIContext = {
    interview_id,
    candidate_id,
    current_round_id: 'ROUND-001',
    current_agent_id,
    difficulty: 'MEDIUM',
    evaluated_competencies: {},
    accumulated_evidence: [],
    open_questions: [],
    missing_competencies: [...required_competencies],
    detected_contradictions: [],
  };

  const session: InterviewSession = {
    interview_id,
    candidate_id,
    job_id: params.job_id || 'JOB-01',
    job_title: params.job_title || 'Senior Distributed Systems Engineer',
    job_description:
      params.job_description ||
      'Looking for a senior engineer to design high-throughput backend services and lead cross-functional architecture.',
    required_competencies,
    status: 'INTERVIEW_CREATED',
    current_agent_id,
    channel_name,
    ai_context,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    transcript_history: [],
    latest_analysis: null,
    latest_action: null,
  };

  sessions.set(interview_id, session);
  sessions.set(channel_name, session);
  return session;
}

export function getSession(idOrChannel?: string): InterviewSession | null {
  if (idOrChannel) {
    return sessions.get(idOrChannel) || null;
  }
  // Only if id is not specified, find the most recently active session
  const allSessions = Array.from(sessions.values());
  if (allSessions.length > 0) {
    const active = allSessions
      .filter((s) => s.status !== 'COMPLETED')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    if (active.length > 0) return active[0];
    return allSessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  }
  return null;
}

export function updateSessionStatus(idOrChannel: string, status: InterviewStatus): InterviewSession | null {
  const session = getSession(idOrChannel);
  if (!session) return null;
  session.status = status;
  session.updated_at = new Date().toISOString();
  return session;
}

export function recordTranscriptTurn(
  idOrChannel: string,
  turn: {
    speaker: 'candidate' | 'interviewer';
    persona?: string;
    text: string;
  }
): InterviewSession | null {
  const session = getSession(idOrChannel);
  if (!session) return null;

  session.transcript_history.push({
    turn_id: `TURN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speaker: turn.speaker,
    persona: turn.persona,
    text: turn.text,
    timestamp: new Date().toISOString(),
  });
  session.updated_at = new Date().toISOString();
  return session;
}

/**
 * Apply AnswerAnalysis from Member 1 Intelligence to the session context.
 */
export function applyAnswerAnalysis(
  idOrChannel: string,
  analysis: AnswerAnalysis
): InterviewSession | null {
  const session = getSession(idOrChannel);
  if (!session) return null;

  session.latest_analysis = analysis;
  const ctx = session.ai_context;

  // Merge extracted evidence
  if (analysis.evidence && analysis.evidence.length > 0) {
    ctx.accumulated_evidence.push(...analysis.evidence);
  }

  // Update evaluated competencies findings
  if (analysis.competency_findings && analysis.competency_findings.length > 0) {
    for (const finding of analysis.competency_findings) {
      ctx.evaluated_competencies[finding.competency_id] = finding.assessment;
      // Remove from missing competencies if evaluated as STRONG or PARTIAL
      if (finding.assessment === 'STRONG' || finding.assessment === 'PARTIAL') {
        ctx.missing_competencies = ctx.missing_competencies.filter(
          (c) => c.toLowerCase() !== finding.competency_id.toLowerCase()
        );
      }
    }
  }

  // Record contradictions
  if (analysis.contradiction_detected && analysis.contradiction_details) {
    ctx.detected_contradictions.push(analysis.contradiction_details);
  }

  session.updated_at = new Date().toISOString();
  return session;
}

/**
 * Apply NextAction from Member 1 Meta-Orchestrator to the session context.
 */
export function applyNextAction(
  idOrChannel: string,
  nextAction: NextAction
): InterviewSession | null {
  const session = getSession(idOrChannel);
  if (!session) return null;

  session.latest_action = nextAction;
  const ctx = session.ai_context;

  if (nextAction.action === 'SWITCH_AGENT' && nextAction.target_agent_id) {
    session.current_agent_id = nextAction.target_agent_id;
    ctx.current_agent_id = nextAction.target_agent_id;
  }

  if (nextAction.difficulty) {
    ctx.difficulty = nextAction.difficulty;
  }

  if (nextAction.action === 'COMPLETE') {
    session.status = 'COMPLETED';
  }

  session.updated_at = new Date().toISOString();
  return session;
}

/**
 * Generate final assessment report for recruiter based on M1 findings.
 */
export function generateAssessmentReport(idOrChannel: string): AssessmentReport | null {
  const session = getSession(idOrChannel);
  if (!session) return null;

  const ctx = session.ai_context;
  const evaluatedMap: AssessmentReport['evaluated_competencies'] = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  let strongCount = 0;
  let totalEvaluated = 0;

  for (const comp of session.required_competencies) {
    const rating: PerformanceRating = ctx.evaluated_competencies[comp] || 'PARTIAL';
    const compEvidence = ctx.accumulated_evidence.filter(
      (e) => e.competency_id.toLowerCase() === comp.toLowerCase()
    );

    evaluatedMap[comp] = {
      rating,
      confidence: rating === 'STRONG' ? 0.92 : 0.65,
      evidence: compEvidence,
    };

    totalEvaluated++;
    if (rating === 'STRONG') {
      strongCount++;
      strengths.push(`Demonstrated deep proficiency in ${comp.replace(/_/g, ' ')} with concrete examples.`);
    } else if (rating === 'WEAK') {
      weaknesses.push(`Requires further evaluation in ${comp.replace(/_/g, ' ')}.`);
    }
  }

  const scorePct = totalEvaluated > 0 ? (strongCount / totalEvaluated) * 100 : 75;
  let overallRec: AssessmentReport['overall_recommendation'] = 'POTENTIAL_FIT';
  if (scorePct >= 80) overallRec = 'STRONG_HIRE';
  else if (scorePct >= 60) overallRec = 'HIRE';
  else if (scorePct < 40) overallRec = 'NO_HIRE';

  return {
    interview_id: session.interview_id,
    candidate_id: session.candidate_id,
    candidate_name: 'Alex Johnson',
    job_title: session.job_title,
    overall_recommendation: overallRec,
    overall_score: Math.round(scorePct),
    evaluated_competencies: evaluatedMap,
    strengths: strengths.length > 0 ? strengths : ['Clear architectural communication and technical clarity.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Could provide more edge-case trade-off analysis.'],
    unresolved_concerns: ctx.detected_contradictions,
    total_turns: session.transcript_history.length,
    completed_at: new Date().toISOString(),
  };
}
