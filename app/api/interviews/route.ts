import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';
import { ingestCandidateCV } from '@/lib/m1-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const session = createSession({
      candidate_name: body.candidate_name,
      cv_text: body.cv_text,
      job_title: body.job_title,
      job_description: body.job_description,
      required_competencies: body.required_competencies,
      initial_agent_id: body.initial_agent_id || 'technical',
    });

    // Ingest CV into Knowledge Graph if provided
    if (body.cv_text) {
      ingestCandidateCV(session.candidate_id, body.cv_text, session.candidate_name).catch((err) => {
        console.warn(`[InterviewsAPI] Background CV ingestion error:`, err);
      });
    }

    // Ingest Job Description into Knowledge Graph
    const m1Url = process.env.M1_INTELLIGENCE_URL || 'http://localhost:4005';
    fetch(`${m1Url}/v1/knowledge-graph/jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: session.job_id,
        job_title: session.job_title,
        job_description: session.job_description,
        required_competencies: session.required_competencies,
      }),
    }).catch((err) => {
      console.warn(`[InterviewsAPI] Background JD ingestion error:`, err);
    });

    return NextResponse.json({
      success: true,
      interview_id: session.interview_id,
      candidate_id: session.candidate_id,
      session,
    });
  } catch (err) {
    console.error('Failed to create interview session:', err);
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
}
