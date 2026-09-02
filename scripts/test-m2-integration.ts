/**
 * Automated Integration Test Suite for EchoSphere Member 2
 * Tests:
 *  1. Session creation & context initialization
 *  2. Context preservation across turns
 *  3. AnswerAnalysis parsing & application
 *  4. NextAction execution (ASK_QUESTION, SWITCH_AGENT, COMPLETE)
 *  5. Unknown agent handling & fallbacks
 *  6. Persona switching (Alex -> Jordan)
 *  7. Recruiter assessment report generation
 */

import { createSession, getSession, applyAnswerAnalysis, applyNextAction, generateAssessmentReport } from '../lib/session-store';
import { executeNextAction } from '../lib/action-executor';
import { PERSONAS, getPersona } from '../lib/personas';
import { AnswerAnalysis, NextAction } from '../types/echosphere';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runM2Tests() {
  console.log('====================================================');
  console.log('RUNNING ECHOSPHERE MEMBER 2 INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Session & Context Initialization
  console.log('--- Test 1: Session & Context Initialization ---');
  const session = createSession({
    interview_id: 'TEST-INT-001',
    candidate_id: 'TEST-CAND-001',
    required_competencies: ['system_design', 'scalability', 'customer_impact'],
    initial_agent_id: 'technical',
  });

  assert(session.interview_id === 'TEST-INT-001', 'Session initialized with correct ID');
  assert(session.current_agent_id === 'technical', 'Initial agent is Alex (technical)');
  assert(session.ai_context.missing_competencies.length === 3, 'All 3 competencies initially missing');
  assert(session.status === 'INTERVIEW_CREATED', 'Initial status is INTERVIEW_CREATED');

  // Test 2: AnswerAnalysis Parsing and Application
  console.log('\n--- Test 2: AnswerAnalysis Application ---');
  const mockAnalysis: AnswerAnalysis = {
    answer_id: 'ANS-001',
    overall_performance: 'STRONG',
    confidence: 0.93,
    vague: false,
    vague_reason: null,
    contradiction_detected: false,
    contradiction_details: null,
    missing_information: ['customer_impact'],
    evidence: [
      {
        evidence_id: 'EVID-001',
        answer_id: 'ANS-001',
        competency_id: 'system_design',
        statement: 'Placed Redis in front of PostgreSQL with write-through caching.',
        strength: 'STRONG',
        timestamp: new Date().toISOString(),
      },
    ],
    competency_findings: [
      {
        competency_id: 'system_design',
        assessment: 'STRONG',
        confidence: 0.93,
        evidence_ids: ['EVID-001'],
      },
    ],
    recommended_follow_up: 'Probe scalability under 50k QPS.',
  };

  const updatedSession = applyAnswerAnalysis('TEST-INT-001', mockAnalysis);
  assert(updatedSession !== null, 'Session updated with analysis');
  assert(
    updatedSession?.ai_context.evaluated_competencies.system_design === 'STRONG',
    'system_design evaluated as STRONG'
  );
  assert(
    updatedSession?.ai_context.accumulated_evidence.length === 1,
    'accumulated_evidence has 1 evidence item'
  );
  assert(
    !updatedSession?.ai_context.missing_competencies.includes('system_design'),
    'system_design removed from missing_competencies'
  );

  // Test 3: NextAction Execution - ASK_QUESTION
  console.log('\n--- Test 3: Action Execution - ASK_QUESTION ---');
  const askAction: NextAction = {
    action: 'ASK_QUESTION',
    target_agent_id: 'technical',
    competency_id: 'scalability',
    difficulty: 'HARD',
    reason: 'System design satisfied, probe scalability next.',
    prompt_directive: 'Ask how architecture handles 50k QPS peak load.',
    handoff_transition_text: null,
  };

  const execAsk = executeNextAction('TEST-INT-001', askAction);
  assert(execAsk.activePersonaId === 'technical', 'Active persona remains technical');
  assert(execAsk.activePersonaName === 'Alex', 'Alex remains speaking');
  assert(!execAsk.isComplete, 'Interview is not complete');
  assert(execAsk.promptDirective.includes('50k QPS'), 'Prompt directive passed correctly');

  // Test 4: NextAction Execution - SWITCH_AGENT (Dynamic Persona Handoff)
  console.log('\n--- Test 4: Action Execution - SWITCH_AGENT ---');
  const switchAction: NextAction = {
    action: 'SWITCH_AGENT',
    target_agent_id: 'product',
    competency_id: 'customer_impact',
    difficulty: null,
    reason: 'Technical competencies complete. customer_impact belongs to Product Lead.',
    prompt_directive: 'Explore customer impact and business latency metrics.',
    handoff_transition_text:
      "Thank you for walking through the technical architecture. Now I'd like to hand over to Jordan to explore customer impact.",
  };

  const execSwitch = executeNextAction('TEST-INT-001', switchAction);
  assert(execSwitch.activePersonaId === 'product', 'Active persona switched to product');
  assert(execSwitch.activePersonaName === 'Jordan', 'Jordan is now active interviewer');
  assert(
    execSwitch.spokenPrefix.includes('hand over to Jordan'),
    'Spoken prefix includes handoff transition text'
  );

  const sessionAfterSwitch = getSession('TEST-INT-001');
  assert(
    sessionAfterSwitch?.current_agent_id === 'product',
    'Session current_agent_id updated to product'
  );
  assert(
    sessionAfterSwitch?.ai_context.current_agent_id === 'product',
    'AIContext current_agent_id preserved as product'
  );

  // Test 5: NextAction Execution - COMPLETE
  console.log('\n--- Test 5: Action Execution - COMPLETE ---');
  const completeAction: NextAction = {
    action: 'COMPLETE',
    target_agent_id: 'product',
    competency_id: null,
    difficulty: null,
    reason: 'All required competencies sufficiently evaluated.',
    prompt_directive: 'Conclude interview politely.',
    handoff_transition_text: null,
  };

  const execComplete = executeNextAction('TEST-INT-001', completeAction);
  assert(execComplete.isComplete === true, 'isComplete flag is true');
  const sessionAfterComplete = getSession('TEST-INT-001');
  assert(
    sessionAfterComplete?.status === 'COMPLETED',
    'Session status set to COMPLETED'
  );

  // Test 6: Unknown Agent Handling & Fallback
  console.log('\n--- Test 6: Unknown Agent Fallback ---');
  const unknownPersona = getPersona('non_existent_agent');
  assert(unknownPersona.agent_id === 'technical', 'Unknown agent safely falls back to technical');

  // Test 7: Recruiter Assessment Report Generation
  console.log('\n--- Test 7: Assessment Report Generation ---');
  const report = generateAssessmentReport('TEST-INT-001');
  assert(report !== null, 'Assessment report generated successfully');
  assert(report?.overall_score !== undefined, 'Report has overall score');
  assert(
    report?.evaluated_competencies.system_design.rating === 'STRONG',
    'Report accurately reflects M1 competency findings'
  );
  assert(
    report?.evaluated_competencies.system_design.evidence.length === 1,
    'Report includes grounded candidate evidence statements'
  );

  console.log('\n====================================================');
  console.log('ALL MEMBER 2 UNIT & INTEGRATION TESTS PASSED (7/7)!');
  console.log('====================================================');
}

runM2Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
