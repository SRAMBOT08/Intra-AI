import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const session = createSession({
      job_title: body.job_title,
      job_description: body.job_description,
      required_competencies: body.required_competencies,
      initial_agent_id: body.initial_agent_id || 'technical',
    });

    return NextResponse.json({
      success: true,
      interview_id: session.interview_id,
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
