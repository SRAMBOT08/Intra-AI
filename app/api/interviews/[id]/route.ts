import { NextRequest, NextResponse } from 'next/server';
import { getSession, recordTranscriptTurn } from '@/lib/session-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { speaker, text, persona } = body;
    if (text) {
      recordTranscriptTurn(id, {
        speaker: speaker || 'candidate',
        persona: persona,
        text,
      });
    }
    return NextResponse.json({ success: true, session: getSession(id) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record turn' }, { status: 500 });
  }
}
