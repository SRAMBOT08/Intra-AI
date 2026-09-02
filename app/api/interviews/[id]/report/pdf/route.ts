import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentReport, getSession } from '@/lib/session-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = getSession(id);
    if (!session) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
    }

    const report = generateAssessmentReport(id);
    if (!report) {
      return NextResponse.json({ error: 'Failed to generate assessment report' }, { status: 500 });
    }

    // Return clean, printable HTML report designed for PDF export
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EchoSphere Assessment — ${report.candidate_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
    body {
      font-family: 'Sora', sans-serif;
      color: #0c0d1c;
      background: #ffffff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #e1e3f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      background: #f7e659;
      color: #0c0d1c;
    }
    .rec-badge {
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      background: #10b981;
      color: #ffffff;
    }
    .rec-badge.strong { background: #0c0d1c; color: #f7e659; }
    .title { font-size: 24px; font-weight: 600; margin: 8px 0 4px 0; }
    .meta { font-size: 12px; color: #6b7094; }
    .card {
      border: 1px solid #e1e3f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      background: #fafafc;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0c0d1c;
      margin-bottom: 12px;
      border-bottom: 1px solid #e1e3f0;
      padding-bottom: 6px;
    }
    .competency-item {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #e1e3f0;
    }
    .competency-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
    }
    .evidence-quote {
      font-size: 11px;
      font-style: italic;
      color: #3b3f63;
      background: #ffffff;
      border-left: 3px solid #f7e659;
      padding: 6px 10px;
      margin-top: 6px;
      border-radius: 0 8px 8px 0;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    ul { margin: 0; padding-left: 20px; font-size: 12px; color: #3b3f63; }
    li { margin-bottom: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 18px; border-radius: 20px; background: #0c0d1c; color: #fff; font-weight: 600; border: none; cursor: pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <span class="badge">EchoSphere Adaptive Assessment</span>
      <h1 class="title">${report.candidate_name}</h1>
      <div class="meta">${report.job_title} | Session: ${report.interview_id} | Date: ${new Date(report.completed_at).toLocaleDateString()}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 28px; font-weight: 700;">${report.overall_score}%</div>
      <div class="rec-badge strong">${report.overall_recommendation.replace(/_/g, ' ')}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Executive Summary</div>
    <p style="font-size: 12px; margin: 0; color: #3b3f63;">
      Candidate evaluated across ${report.total_turns} conversational turns by AI interviewers Alex (Technical) and Jordan (Product Lead).
      Grounded evidence was extracted directly from transcript statements and cross-referenced with candidate Knowledge Graph facts.
    </p>
  </div>

  <div class="card">
    <div class="card-title">Competency Evaluation & Grounded Evidence</div>
    ${Object.entries(report.evaluated_competencies || {})
      .map(
        ([comp, f]) => `
      <div class="competency-item">
        <div class="competency-header">
          <span>${comp.replace(/_/g, ' ').toUpperCase()}</span>
          <span>Rating: <strong>${f.rating}</strong> (Confidence: ${(f.confidence * 100).toFixed(0)}%)</span>
        </div>
        ${(f.evidence || [])
          .map((ev: { statement: string }) => `<div class="evidence-quote">Evidence: &ldquo;${ev.statement}&rdquo;</div>`)
          .join('')}
      </div>
    `
      )
      .join('')}
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Demonstrated Strengths</div>
      <ul>
        ${report.strengths.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    <div class="card">
      <div class="card-title">Areas for Review</div>
      <ul>
        ${report.weaknesses.map((w) => `<li>${w}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="echosphere-assessment-${id}.html"`,
      },
    });
  } catch (err) {
    console.error('Failed to generate PDF report:', err);
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 });
  }
}
