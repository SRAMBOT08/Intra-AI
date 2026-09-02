export type ActionType = 'ASK_QUESTION' | 'SWITCH_AGENT' | 'COMPLETE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type PerformanceRating = 'STRONG' | 'PARTIAL' | 'WEAK' | 'NOT_EVALUATED';
export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK';
export type AgentRole =
  | 'Technical Interviewer'
  | 'Product Lead'
  | 'System Designer'
  | 'Hiring Manager';

export interface EvidenceItem {
  evidence_id: string;
  answer_id: string;
  competency_id: string;
  statement: string;
  strength: EvidenceStrength;
  timestamp: string;
}

export interface CompetencyFinding {
  competency_id: string;
  assessment: PerformanceRating;
  confidence: number;
  evidence_ids: string[];
}

export interface AnswerAnalysis {
  answer_id: string;
  overall_performance: PerformanceRating;
  confidence: number;
  vague: boolean;
  vague_reason: string | null;
  contradiction_detected: boolean;
  contradiction_details: string | null;
  missing_information: string[];
  evidence: EvidenceItem[];
  competency_findings: CompetencyFinding[];
  recommended_follow_up: string | null;
}

export interface NextAction {
  action: ActionType;
  target_agent_id?: string | null;
  competency_id?: string | null;
  difficulty?: DifficultyLevel | null;
  reason: string;
  prompt_directive?: string | null;
  handoff_transition_text?: string | null;
}

export interface InterviewAIContext {
  interview_id: string;
  candidate_id: string;
  current_round_id: string;
  current_agent_id: string;
  difficulty: DifficultyLevel;
  evaluated_competencies: Record<string, PerformanceRating>;
  accumulated_evidence: EvidenceItem[];
  open_questions: string[];
  missing_competencies: string[];
  detected_contradictions: string[];
}

export interface CandidateProfileSummary {
  candidate_id: string;
  full_name?: string | null;
  years_of_experience?: number | null;
  key_skills: string[];
  summary_text?: string | null;
}

export interface AgentProfile {
  agent_id: string;
  role: AgentRole;
  display_name: string;
  description: string;
  focal_competencies: string[];
  questioning_style: string;
  instructions: string;
  min_difficulty: DifficultyLevel;
  max_difficulty: DifficultyLevel;
  allowed_actions: ActionType[];
}

export type InterviewStatus =
  | 'INTERVIEW_CREATED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'ANALYZING'
  | 'DECIDING'
  | 'EXECUTING_ACTION'
  | 'COMPLETED'
  | 'FAILED';

export interface InterviewSession {
  interview_id: string;
  candidate_id: string;
  job_id: string;
  job_title: string;
  job_description: string;
  required_competencies: string[];
  status: InterviewStatus;
  current_agent_id: string;
  channel_name: string;
  agora_agent_id?: string | null;
  ai_context: InterviewAIContext;
  created_at: string;
  updated_at: string;
  transcript_history: Array<{
    turn_id: string;
    speaker: 'candidate' | 'interviewer';
    persona?: string;
    text: string;
    timestamp: string;
  }>;
  latest_analysis?: AnswerAnalysis | null;
  latest_action?: NextAction | null;
}

export interface AssessmentReport {
  interview_id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  overall_recommendation: 'STRONG_HIRE' | 'HIRE' | 'POTENTIAL_FIT' | 'NO_HIRE';
  overall_score: number;
  evaluated_competencies: Record<
    string,
    {
      rating: PerformanceRating;
      confidence: number;
      evidence: EvidenceItem[];
    }
  >;
  strengths: string[];
  weaknesses: string[];
  unresolved_concerns: string[];
  total_turns: number;
  completed_at: string;
}

export interface RelevantPersistentContext {
  candidate_id: string;
  candidate_name: string;
  relevant_experiences: Array<{
    title: string;
    organization?: string | null;
    description?: string | null;
  }>;
  relevant_skills: string[];
  relevant_technologies: string[];
  relevant_concepts: string[];
  prior_evidence: Array<{
    id: string;
    statement: string;
    strength: string;
  }>;
  prior_assessments: Record<string, string>;
  unresolved_contradictions: Array<{
    source_evidence_id: string;
    source_statement: string;
    contradicted_evidence_id: string;
    contradicted_statement: string;
    confidence: number;
    details: string;
  }>;
  summary_text: string;
}

export interface CrossRoundContext {
  candidate_id: string;
  candidate_name: string;
  completed_rounds: number[];
  technical_highlights: string[];
  verified_technologies: string[];
  verified_concepts: string[];
  prior_competency_ratings: Record<string, string>;
  grounded_bridge_prompt: string;
}

export interface GraphVisualizationData {
  nodes: Array<{ id: string; label: string; type: string }>;
  links: Array<{ source: string; target: string; type: string; confidence: number }>;
}
