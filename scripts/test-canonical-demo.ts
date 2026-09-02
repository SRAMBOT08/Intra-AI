/**
 * Canonical Acceptance Demo Scenario for EchoSphere (Member 1 + Member 2)
 *
 * Sequence:
 *   Alex (technical) evaluates system_design
 *       ↓
 *   Alex (technical) evaluates scalability
 *       ↓
 *   Technical coverage complete → SWITCH_AGENT returned by Meta-Orchestrator
 *       ↓
 *   Spoken handoff transition ("Thank you for walking through the technical architecture...")
 *       ↓
 *   Jordan (product) evaluates customer_impact
 *       ↓
 *   All competencies satisfied → COMPLETE
 *       ↓
 *   Recruiter Assessment Report generated with evidence and score >= 80% (STRONG_HIRE)
 */

import {
  createSession,
  getSession,
  applyAnswerAnalysis,
  generateAssessmentReport,
} from '../lib/session-store';
import { executeNextAction } from '../lib/action-executor';
import { analyzeAnswer, getNextAction } from '../lib/m1-client';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ CANONICAL TEST FAILURE: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runCanonicalDemo() {
  console.log('================================================================');
  console.log('STARTING ECHOSPHERE CANONICAL ACCEPTANCE DEMO SCENARIO');
  console.log('================================================================\n');

  // Step 1: Recruiter creates interview session
  console.log('Step 1: Recruiter creates interview session...');
  const session = createSession({
    interview_id: 'CANONICAL-DEMO-01',
    job_title: 'Senior Distributed Systems Engineer',
    required_competencies: ['system_design', 'scalability', 'customer_impact'],
    initial_agent_id: 'technical',
  });
  assert(session.current_agent_id === 'technical', 'Active persona begins as Alex (Technical Interviewer)');

  // Step 2: Turn 1 - Alex asks system_design question & Candidate answers
  console.log('\nStep 2: Turn 1 (Alex - system_design)...');
  const candAnswer1 =
    'In our database and caching architecture, we deployed a Redis Cluster in front of PostgreSQL Aurora with read replicas in each availability zone. We implemented write-through caching with transactional cache invalidation to maintain consistency and guarantee read latencies under 5ms.';
  console.log(`Candidate: "${candAnswer1}"`);

  console.log('Sending candidate answer to M1 Intelligence (:4005)...');
  const analysis1 = await analyzeAnswer({
    question: 'How do you design your database and caching tier for high-throughput reads?',
    candidate_answer: candAnswer1,
    target_competencies: ['system_design'],
    interview_context: session.ai_context,
    answer_id: 'ANS-001',
  });

  console.log(
    `Intelligence result: Performance = ${analysis1.overall_performance}, Confidence = ${(analysis1.confidence * 100).toFixed(0)}%`
  );
  applyAnswerAnalysis('CANONICAL-DEMO-01', analysis1);

  console.log('Sending context to M1 Meta-Orchestrator (:4004)...');
  const nextAction1 = await getNextAction({
    interview_context: session.ai_context,
    answer_analysis: analysis1,
    required_competencies: session.required_competencies,
    is_final_round: false,
    current_competency: 'system_design',
  });

  console.log(
    `Orchestrator decided: Action = ${nextAction1.action}, Target = ${nextAction1.target_agent_id}, Competency = ${nextAction1.competency_id}`
  );
  const exec1 = executeNextAction('CANONICAL-DEMO-01', nextAction1);
  assert(exec1.activePersonaId === 'technical', 'Turn 1 keeps Alex as active persona');

  // Step 3: Turn 2 - Alex probes scalability
  console.log('\nStep 3: Turn 2 (Alex - scalability)...');
  const candAnswer2 =
    'To scale under peak load of 50,000 QPS, we horizontally autoscaled our ECS tasks across multiple AZs and configured Redis cluster sharding with PgBouncer connection pooling to avoid database connection exhaustion.';
  console.log(`Candidate: "${candAnswer2}"`);

  console.log('Sending Turn 2 answer to M1 Intelligence (:4005)...');
  const analysis2 = await analyzeAnswer({
    question: 'How did you scale this to handle 50,000 requests per second under peak load?',
    candidate_answer: candAnswer2,
    target_competencies: ['scalability'],
    interview_context: session.ai_context,
    answer_id: 'ANS-002',
  });

  applyAnswerAnalysis('CANONICAL-DEMO-01', analysis2);

  console.log('Sending context to M1 Meta-Orchestrator (:4004)...');
  const nextAction2 = await getNextAction({
    interview_context: session.ai_context,
    answer_analysis: analysis2,
    required_competencies: session.required_competencies,
    is_final_round: false,
    current_competency: 'scalability',
  });

  console.log(
    `Orchestrator decided: Action = ${nextAction2.action}, Target = ${nextAction2.target_agent_id}, Competency = ${nextAction2.competency_id}`
  );
  assert(nextAction2.action === 'SWITCH_AGENT', 'Orchestrator correctly returned SWITCH_AGENT');
  assert(nextAction2.target_agent_id === 'product', 'Target agent is product (Jordan)');
  assert(nextAction2.competency_id === 'customer_impact', 'Target competency is customer_impact');

  // Step 4: Persona Handoff Execution
  console.log('\nStep 4: Executing Dynamic Persona Handoff...');
  const exec2 = executeNextAction('CANONICAL-DEMO-01', nextAction2);
  assert(exec2.activePersonaId === 'product', 'Active persona switched to product');
  assert(exec2.activePersonaName === 'Jordan', 'Active persona display name is Jordan');
  console.log(`Spoken Handoff Text: "${nextAction2.handoff_transition_text}"`);
  assert(Boolean(nextAction2.handoff_transition_text), 'Spoken handoff transition text is present');

  // Step 5: Turn 3 - Jordan probes customer_impact
  console.log('\nStep 5: Turn 3 (Jordan - customer_impact)...');
  const candAnswer3 =
    'By reducing checkout latency from 850ms to 180ms, we reduced user checkout drop-off by 18% during high-traffic flash sales, resulting in a measurable $2.4M quarterly revenue lift and positive user feedback.';
  console.log(`Candidate: "${candAnswer3}"`);

  console.log('Sending Turn 3 answer to M1 Intelligence (:4005)...');
  const analysis3 = await analyzeAnswer({
    question: 'How did this low latency improve user conversion and business outcomes?',
    candidate_answer: candAnswer3,
    target_competencies: ['customer_impact'],
    interview_context: session.ai_context,
    answer_id: 'ANS-003',
  });

  applyAnswerAnalysis('CANONICAL-DEMO-01', analysis3);

  console.log('Sending context to M1 Meta-Orchestrator (:4004)...');
  const nextAction3 = await getNextAction({
    interview_context: session.ai_context,
    answer_analysis: analysis3,
    required_competencies: session.required_competencies,
    is_final_round: true,
    current_competency: 'customer_impact',
  });

  console.log(`Orchestrator decided: Action = ${nextAction3.action}, Reason = ${nextAction3.reason}`);
  assert(nextAction3.action === 'COMPLETE', 'Orchestrator correctly returned COMPLETE');

  const exec3 = executeNextAction('CANONICAL-DEMO-01', nextAction3);
  assert(exec3.isComplete === true, 'Execution confirmed interview is complete');

  // Step 6: Recruiter Assessment Report Generation
  console.log('\nStep 6: Generating & Verifying Recruiter Assessment Report...');
  const report = generateAssessmentReport('CANONICAL-DEMO-01');
  assert(report !== null, 'Report generated successfully');
  assert(
    report?.overall_score !== undefined && report.overall_score >= 80,
    `Overall score is ${report?.overall_score}% (>= 80%)`
  );
  assert(
    report?.overall_recommendation === 'STRONG_HIRE',
    'Candidate recommended as STRONG_HIRE'
  );
  assert(
    report?.evaluated_competencies.system_design.rating === 'STRONG',
    'system_design is STRONG'
  );
  assert(
    report?.evaluated_competencies.scalability.rating === 'STRONG',
    'scalability is STRONG'
  );
  assert(
    report?.evaluated_competencies.customer_impact.rating === 'STRONG',
    'customer_impact is STRONG'
  );

  console.log('\n================================================================');
  console.log('CANONICAL DEMO SCENARIO VERIFIED & COMPLETED SUCCESSFULLY! 🎉');
  console.log('================================================================\n');
}

runCanonicalDemo().catch((err) => {
  console.error('Canonical Demo failed:', err);
  process.exit(1);
});
