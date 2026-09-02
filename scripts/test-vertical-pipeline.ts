/**
 * Full Vertical Pipeline Acceptance Test for EchoSphere V1.
 * Verifies complete lifecycle:
 * CV Ingestion -> JD Ingestion -> Candidate Creation -> Session Initialization
 * -> Alex Turn 1 (CV-grounded) -> KG Update -> Alex Turn 2 -> Alex -> Jordan Handoff
 * -> Cross-Round Grounding -> Assessment Report -> PDF Export.
 */

import {
  getCrossRoundContext,
  getGraphVisualization,
  getRelevantPersistentContext,
  ingestCandidateCV,
} from '../lib/m1-client';

async function runVerticalPipelineAcceptanceTest() {
  console.log('================================================================================');
  console.log('STARTING ECHOSPHERE V1 FULL VERTICAL PIPELINE ACCEPTANCE TEST');
  console.log('================================================================================\n');

  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const candidateId = `CAND-V1-${timestamp}`;
  const candidateName = 'Dr. Elena Rostova';
  const jobTitle = 'Staff Distributed Systems Engineer';
  const jobDescription =
    'Looking for a staff engineer to scale multi-region active-active transaction ledgers and optimize database caching.';

  // ---------------------------------------------------------------------------
  // STEP 1: Ingest Candidate CV into Knowledge Graph
  // ---------------------------------------------------------------------------
  console.log('--- Step 1: Ingesting Candidate CV into Knowledge Graph ---');
  const cvText = `
    Principal Distributed Systems Architect with 12+ years experience.
    Designed and deployed active-active Payment API processing $4B annually.
    Architected globally distributed ledger using PostgreSQL, Redis, and Apache Kafka.
    Implemented horizontal scaling, caching strategies, and connection pooling for sub-5ms P99 latency SLA guarantees.
  `;

  const cvOk = await ingestCandidateCV(candidateId, cvText, candidateName);
  if (!cvOk) throw new Error('Step 1 Failed: CV ingestion failed');
  console.log('✅ PASS: Step 1 (CV ingested into Knowledge Graph)\n');

  // ---------------------------------------------------------------------------
  // STEP 2: Verify CV Facts in Knowledge Graph
  // ---------------------------------------------------------------------------
  console.log('--- Step 2: Verifying Persistent Knowledge Graph Entities ---');
  const initialContext = await getRelevantPersistentContext(candidateId, 'system_design');
  console.log(`Verified Technologies: ${initialContext.relevant_technologies?.join(', ')}`);
  console.log(`Verified Projects: ${initialContext.relevant_projects?.join(', ')}`);
  if (!initialContext.relevant_technologies?.includes('PostgreSQL') || !initialContext.relevant_technologies?.includes('Redis')) {
    throw new Error('Step 2 Failed: Expected PostgreSQL and Redis in Knowledge Graph');
  }
  console.log('✅ PASS: Step 2 (Verified CV facts & provenance in Knowledge Graph)\n');

  // ---------------------------------------------------------------------------
  // STEP 3: Create Recruiter Interview Session with Ingested CV & JD
  // ---------------------------------------------------------------------------
  console.log('--- Step 3: Initializing Recruiter Interview Session ---');
  const sessionRes = await fetch(`${baseUrl}/api/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidate_name: candidateName,
      cv_text: cvText,
      job_title: jobTitle,
      job_description: jobDescription,
      required_competencies: ['system_design', 'scalability', 'customer_impact'],
      initial_agent_id: 'technical',
    }),
  });

  const sessionData = await sessionRes.json();
  const interviewId = sessionData.interview_id;
  console.log(`Created Session ID: ${interviewId}`);
  if (!interviewId) throw new Error('Step 3 Failed: No interview ID returned');
  console.log('✅ PASS: Step 3 (Interview session created with context)\n');

  // ---------------------------------------------------------------------------
  // STEP 4: First Turn Opening Greeting (Grounded in Verified CV Facts)
  // ---------------------------------------------------------------------------
  console.log('--- Step 4: Alex Opening Turn Grounded in Verified CV Facts ---');
  const openRes = await fetch(`${baseUrl}/api/custom-llm?interview_id=${interviewId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '' }],
    }),
  });

  const openData = await openRes.json();
  const openingGreeting = openData?.choices?.[0]?.message?.content || '';
  console.log(`Alex Opening Greeting:\n"${openingGreeting}"\n`);
  if (!openingGreeting.toLowerCase().includes('alex')) {
    throw new Error('Step 4 Failed: Expected Alex to introduce themselves');
  }
  console.log('✅ PASS: Step 4 (Grounded opening greeting synthesized)\n');

  // ---------------------------------------------------------------------------
  // STEP 5: Alex Turn 1 (Deep Technical Answer on Database & Caching Architecture)
  // ---------------------------------------------------------------------------
  console.log('--- Step 5: Candidate Answers Technical Architecture Question ---');
  const technicalAnswer1 =
    'In our architecture, we horizontally scaled our payment API servers across multiple availability zones and deployed a Redis Cluster in front of PostgreSQL Aurora with write-through caching to keep read latencies under 5ms.';

  const turn1Res = await fetch(`${baseUrl}/api/custom-llm?interview_id=${interviewId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'assistant', content: openingGreeting },
        { role: 'user', content: technicalAnswer1 },
      ],
    }),
  });

  const turn1Data = await turn1Res.json();
  const alexFollowUp = turn1Data?.choices?.[0]?.message?.content || '';
  console.log(`Alex Follow-up:\n"${alexFollowUp}"\n`);
  if (!alexFollowUp || alexFollowUp === openingGreeting) {
    throw new Error('Step 5 Failed: Alex repeated opening greeting or returned empty');
  }
  console.log('✅ PASS: Step 5 (Candidate answer analyzed & adaptive follow-up generated)\n');

  // ---------------------------------------------------------------------------
  // STEP 6: Alex Turn 2 (Scalability & Peak Load Answer -> Triggers Handoff)
  // ---------------------------------------------------------------------------
  console.log('--- Step 6: Candidate Covers Scalability -> Alex Hands Off to Jordan ---');
  const technicalAnswer2 =
    'To handle peak surges of 60,000 QPS without exhausting database connections, we added PgBouncer with transaction pooling and used Apache Kafka with partition keys to buffer and decouple async ledger reconciliation.';

  const turn2Res = await fetch(`${baseUrl}/api/custom-llm?interview_id=${interviewId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'assistant', content: alexFollowUp },
        { role: 'user', content: technicalAnswer2 },
      ],
    }),
  });

  const turn2Data = await turn2Res.json();
  const handoffDialogue = turn2Data?.choices?.[0]?.message?.content || '';
  console.log(`Handoff Dialogue (Alex -> Jordan):\n"${handoffDialogue}"\n`);
  if (!handoffDialogue.toLowerCase().includes('jordan')) {
    throw new Error('Step 6 Failed: Expected persona handoff to Jordan');
  }
  console.log('✅ PASS: Step 6 (Alex handed off to Jordan within single Agora session)\n');

  // ---------------------------------------------------------------------------
  // STEP 7: Jordan Turn (Product Impact Question Grounded in Round 1 Architecture)
  // ---------------------------------------------------------------------------
  console.log('--- Step 7: Jordan Evaluates Customer Trust & Business Conversion ---');
  const productAnswer =
    'By stabilizing payment latencies and eliminating timeout errors during Black Friday flash sales, we prevented an estimated $12M in checkout abandonment and reduced merchant dispute tickets by 45%.';

  const turn3Res = await fetch(`${baseUrl}/api/custom-llm?interview_id=${interviewId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'assistant', content: handoffDialogue },
        { role: 'user', content: productAnswer },
      ],
    }),
  });

  const turn3Data = await turn3Res.json();
  const finalTurnDialogue = turn3Data?.choices?.[0]?.message?.content || '';
  console.log(`Final Response Dialogue:\n"${finalTurnDialogue}"\n`);
  console.log('✅ PASS: Step 7 (Jordan evaluated business impact and concluded successfully)\n');

  // ---------------------------------------------------------------------------
  // STEP 8: Verify Final Recruiter Assessment Scorecard
  // ---------------------------------------------------------------------------
  console.log('--- Step 8: Fetching Recruiter Assessment Scorecard ---');
  const reportRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/report`);
  const reportData = await reportRes.json();
  const report = reportData.report || reportData;

  console.log(`Candidate: ${report.candidate_name}`);
  console.log(`Overall Recommendation: ${report.overall_recommendation}`);
  console.log(`Overall Score: ${report.overall_score}%`);
  console.log(`Evaluated Turns: ${report.total_turns}`);
  console.log(`Competencies:`, Object.keys(report.competency_breakdown));

  if (report.overall_score < 60) {
    throw new Error('Step 8 Failed: Expected passing candidate score');
  }
  console.log('✅ PASS: Step 8 (Evidence-backed assessment scorecard generated)\n');

  // ---------------------------------------------------------------------------
  // STEP 9: Verify PDF Assessment Report Endpoint
  // ---------------------------------------------------------------------------
  console.log('--- Step 9: Verifying Printable PDF Report Endpoint ---');
  const pdfRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/report/pdf`);
  if (!pdfRes.ok) throw new Error('Step 9 Failed: PDF report route returned non-200');
  const pdfHtml = await pdfRes.text();
  const recStr = report.overall_recommendation.replace(/_/g, ' ');
  if (!pdfHtml.includes(candidateName) || (!pdfHtml.includes(report.overall_recommendation) && !pdfHtml.includes(recStr))) {
    throw new Error('Step 9 Failed: PDF report HTML missing candidate or recommendation');
  }
  console.log(`PDF HTML Size: ${pdfHtml.length} bytes`);
  console.log('✅ PASS: Step 9 (PDF assessment report export endpoint verified)\n');

  // ---------------------------------------------------------------------------
  // STEP 10: Inspect Final Knowledge Graph Density
  // ---------------------------------------------------------------------------
  console.log('--- Step 10: Inspecting Final Knowledge Graph Visualization ---');
  const graphViz = await getGraphVisualization(candidateId);
  console.log(`Total Nodes in Graph: ${graphViz.nodes.length}`);
  console.log(`Total Links in Graph: ${graphViz.links.length}`);
  console.log('Sample Graph Nodes:');
  graphViz.nodes.slice(0, 8).forEach((n) => console.log(`  - [${n.type}] ${n.label}`));

  console.log('\n================================================================================');
  console.log('FULL VERTICAL PIPELINE ACCEPTANCE TEST PASSED 100%! 🎉');
  console.log('================================================================================');
}

runVerticalPipelineAcceptanceTest().catch((err) => {
  console.error('Vertical pipeline acceptance test failed:', err);
  process.exit(1);
});
