import { NextRequest, NextResponse } from 'next/server';
import { callM1Analyze, callM1NextAction } from '@/lib/m1-client';
import {
  applyAnswerAnalysis,
  createSession,
  getSession,
  recordTranscriptTurn,
} from '@/lib/session-store';
import { executeNextAction } from '@/lib/action-executor';
import { getPersona, PERSONAS } from '@/lib/personas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    // Extract interview ID or channel name from query param or header
    const interviewId =
      searchParams.get('interview_id') ||
      req.headers.get('x-interview-id') ||
      body.interview_id ||
      'DEMO-SESSION';

    let session = getSession(interviewId);
    if (!session) {
      session = createSession({ interview_id: interviewId });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === 'user')?.content || '';

    // If there is a candidate answer, process through Member 1 loop
    let responseText = '';
    let isComplete = false;

    if (lastUserMessage.trim()) {
      // 1. Record candidate answer turn
      recordTranscriptTurn(interviewId, {
        speaker: 'candidate',
        text: lastUserMessage,
      });

      // 2. Call Member 1 Intelligence (:4005)
      const currentPersona = getPersona(session.current_agent_id);
      const targetCompetency = session.ai_context.missing_competencies[0] || 'system_design';

      const analysis = await callM1Analyze({
        question: 'Explain your architecture and design decisions.',
        candidate_answer: lastUserMessage,
        target_competencies: [targetCompetency],
        interview_context: session.ai_context,
        answer_id: `ANS-${Date.now()}`,
      });

      // 3. Update session AI context with Intelligence findings
      applyAnswerAnalysis(interviewId, analysis);

      // 4. Call Member 1 Meta-Orchestrator (:4004)
      const nextAction = await callM1NextAction({
        interview_context: session.ai_context,
        answer_analysis: analysis,
        required_competencies: session.required_competencies,
        is_final_round: session.ai_context.missing_competencies.length === 0,
        current_competency: targetCompetency,
      });

      // 5. Execute NextAction (ASK_QUESTION, SWITCH_AGENT, COMPLETE)
      const execution = executeNextAction(interviewId, nextAction);
      isComplete = execution.isComplete;

      // 6. Synthesize response based on execution result
      if (execution.activePersonaId === 'product' && nextAction.action === 'SWITCH_AGENT') {
        responseText = `${execution.spokenPrefix}Thanks Alex! Hello, I'm Jordan, Product Lead. Now that we understand the technical design, could you discuss the customer impact and business metrics of this architecture?`;
      } else if (execution.isComplete) {
        responseText = `Thank you so much for walking through both the technical and product aspects of your work. That concludes our interview today. Our recruiting team will be in touch with the next steps!`;
      } else if (nextAction.competency_id === 'scalability') {
        responseText = `Got it. How does your caching and database tier behave as traffic scales to 50,000 requests per second under peak load? What bottlenecks did you address?`;
      } else {
        responseText = `Understood. Could you elaborate on the key trade-offs and latency considerations in that design?`;
      }

      // Record interviewer turn
      recordTranscriptTurn(interviewId, {
        speaker: 'interviewer',
        persona: execution.activePersonaName,
        text: responseText,
      });
    } else {
      // First turn greeting from Alex
      responseText = `Hello! I'm Alex, your technical interviewer today. We will evaluate system design, scalability, and customer impact. To start, could you walk me through how you design your database and caching tier for high-throughput reads?`;
      recordTranscriptTurn(interviewId, {
        speaker: 'interviewer',
        persona: 'Alex',
        text: responseText,
      });
    }

    // Check if client requested streaming or OpenAI format
    const isStream = Boolean(body.stream);
    if (isStream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        start(controller) {
          // Send OpenAI SSE chunks
          const chunkData = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'gpt-4o-mini',
            choices: [
              {
                index: 0,
                delta: { content: responseText },
                finish_reason: null,
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));

          const endData = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'gpt-4o-mini',
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: 'stop',
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(endData)}\n\ndata: [DONE]\n\n`));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Return standard OpenAI completion format
    return NextResponse.json({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4o-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseText,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80,
      },
      echosphere_meta: {
        active_persona: session.current_agent_id,
        is_complete: isComplete,
        latest_action: session.latest_action,
      },
    });
  } catch (error) {
    console.error('[CustomLLMAdapter] Error processing conversational turn:', error);
    return NextResponse.json(
      {
        error: 'Failed to process turn',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
