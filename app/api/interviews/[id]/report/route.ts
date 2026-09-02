import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentReport, getSession } from '@/lib/session-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
  }

  const report = generateAssessmentReport(id);
  return NextResponse.json({ ...report, session });
}
