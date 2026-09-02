import { NextRequest, NextResponse } from 'next/server';
import { analyzeAnswer, getNextAction } from '@/lib/m1-client';
import {
  applyAnswerAnalysis,
  createSession,
  getSession,
  recordTranscriptTurn,
} from '@/lib/session-store';
import { executeNextAction, ExecutionResult } from '@/lib/action-executor';
import { getPersona, PERSONAS } from '@/lib/personas';
import { AgentProfile, AnswerAnalysis, NextAction } from '@/types/echosphere';

/**
 * Dynamic LLM dialogue generator for Alex (Technical) and Jordan (Product Lead).
 * Synthesizes natural, non-repetitive dialogue based on NextAction prompt_directive.
 */
async function synthesizeInterviewerSpeech(params: {
  persona: AgentProfile;
  nextAction: NextAction;
  execution: ExecutionResult;
  candidateAnswer: string;
  analysis: AnswerAnalysis;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ECHOSPHERE_LLM_API_KEY;
  const baseUrl =
    process.env.ECHOSPHERE_LLM_BASE_URL ||
    (process.env.GEMINI_API_KEY ? 'https://generativelanguage.googleapis.com/v1beta/openai' : 'https://api.openai.com/v1');
  const model =
    process.env.ECHOSPHERE_LLM_MODEL ||
    (process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : 'gpt-4o-mini');

  const prefix = params.execution.spokenPrefix || '';

  if (params.nextAction.action === 'COMPLETE') {
    return `${prefix}Thank you so much for walking through both the technical architecture and product impact today. You've covered all our core competencies thoroughly. That concludes our interview! Our recruiting team will follow up with next steps.`;
  }

  if (apiKey) {
    try {
      const prompt = `You are ${params.persona.display_name}, the ${params.persona.role}.
Interviewer instructions: ${params.persona.instructions}

The candidate just said:
"${params.candidateAnswer}"

Meta-Orchestrator decision directive:
"${params.nextAction.prompt_directive}"
Target competency: ${params.nextAction.competency_id || 'general'}
Difficulty: ${params.nextAction.difficulty || 'MEDIUM'}
${params.analysis.vague ? `Note: The candidate answer was vague regarding: ${params.analysis.vague_reason || 'lack of specifics'}. Probe for concrete details.` : ''}
${params.analysis.contradiction_detected ? `Note: A contradiction was detected: ${params.analysis.contradiction_details}. Ask a polite clarifying probe.` : ''}

Generate your next spoken response to the candidate.
Rules:
- Speak concisely and conversationally (1-2 sentences maximum).
- Acknowledge their point briefly in natural conversational tone, then ask your focused question.
- Do NOT repeat questions already asked.
- Output ONLY the spoken dialogue text.`;

      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 150,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (content) {
          return `${prefix}${content}`;
        }
      }
    } catch (e) {
      console.warn('[CustomLLMAdapter] LLM dialogue synthesis fallback:', e);
    }
  }

  // Safe fallback if LLM synthesis times out
  if (params.nextAction.action === 'SWITCH_AGENT') {
    return `${prefix}Hello, I'm Jordan, Product Lead! Now that we've covered the technical architecture, let's explore the customer impact and business metrics of these decisions.`;
  }
  if (params.analysis.vague) {
    return `Could you be more specific about the concrete implementation details and metrics you used there?`;
  }
  if (params.analysis.contradiction_detected) {
    return `Just to make sure I understand correctly, could you clarify the difference between what you mentioned earlier and this approach?`;
  }
  if (params.nextAction.competency_id === 'scalability') {
    return `Got it. How does your architecture behave as traffic scales to 50,000 requests per second under peak load?`;
  }
  return `Understood. What were the key architectural trade-offs you considered for that approach?`;
}

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

    let responseText = '';
    let isComplete = false;

    if (lastUserMessage.trim()) {
      // 1. Record candidate answer turn
      recordTranscriptTurn(interviewId, {
        speaker: 'candidate',
        text: lastUserMessage,
      });

      // 2. Identify last question asked and target competency
      const lastQuestion =
        session.transcript_history
          .slice()
          .reverse()
          .find((t) => t.speaker === 'interviewer')?.text ||
        'Explain your architecture and design decisions.';

      const targetCompetency = session.ai_context.missing_competencies[0] || 'system_design';

      // 3. Call Member 1 Intelligence (:4005)
      const analysis = await analyzeAnswer({
        question: lastQuestion,
        candidate_answer: lastUserMessage,
        target_competencies: [targetCompetency],
        interview_context: session.ai_context,
        answer_id: `ANS-${Date.now()}`,
      });

      // 4. Update session AI context with Intelligence findings
      applyAnswerAnalysis(interviewId, analysis);

      // 5. Call Member 1 Meta-Orchestrator (:4004)
      const nextAction = await getNextAction({
        interview_context: session.ai_context,
        answer_analysis: analysis,
        required_competencies: session.required_competencies,
        is_final_round: session.ai_context.missing_competencies.length === 0,
        current_competency: targetCompetency,
      });

      // 6. Execute NextAction (ASK_QUESTION, SWITCH_AGENT, COMPLETE)
      const execution = executeNextAction(interviewId, nextAction);
      isComplete = execution.isComplete;

      const activePersonaProfile = getPersona(execution.activePersonaId);

      // 7. Dynamically synthesize spoken response using LLM (Gemini)
      responseText = await synthesizeInterviewerSpeech({
        persona: activePersonaProfile,
        nextAction,
        execution,
        candidateAnswer: lastUserMessage,
        analysis,
      });

      // 8. Record interviewer turn
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
