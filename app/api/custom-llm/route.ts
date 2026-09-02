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
 * Dynamic contextual fallback engine when LLM rate limits (429) or network timeouts occur.
 * NEVER endlessly repeats the opening question. Intelligently redirects and probes.
 */
function generateAdaptiveDialogueFallback(params: {
  persona: AgentProfile;
  nextAction: NextAction;
  execution: ExecutionResult;
  candidateAnswer: string;
  lastQuestion: string;
  analysis: AnswerAnalysis;
  recentTurns: Array<{ speaker: string; persona?: string; text: string }>;
}): string {
  const prefix = params.execution.spokenPrefix || '';
  const answer = params.candidateAnswer.trim();
  const lower = answer.toLowerCase();

  // 1. Off-topic / Unrelated / Meta-comment handling (Redirection)
  if (lower.includes('movie') || lower.includes('interstellar') || lower.includes('space')) {
    return `That's a classic movie, but let's refocus on our system design. Regarding your API architecture, what specific caching strategies would you apply to keep read latencies under 10ms?`;
  }
  if (lower.includes('barcelona') || lower.includes('football') || lower.includes('sports')) {
    return `That doesn't address the system scaling question. Let's stay with the API design: what would you change if your database became the primary bottleneck?`;
  }
  if (lower.includes('nervous') || lower.includes('stuck') || lower.includes('first interview') || lower.includes("don't know")) {
    return `No worries at all, take your time. Let's break it down simply: if a sudden spike of 10,000 requests hits your database, what is the first component you would scale or protect?`;
  }

  // 2. Dynamic Persona Handoff
  if (params.nextAction.action === 'SWITCH_AGENT' || params.execution.activePersonaId === 'product') {
    return `${prefix}Hello, I'm Jordan, Product Lead! Now that we understand the technical design, could you discuss the customer impact and business metrics of this architecture?`;
  }

  // 3. Interview Complete
  if (params.nextAction.action === 'COMPLETE') {
    return `${prefix}Thank you so much for walking through both the technical architecture and product impact today. You've covered all our core competencies thoroughly. That concludes our interview!`;
  }

  // 4. Contradiction Handling
  if (params.analysis.contradiction_detected) {
    return `Just to make sure I understand correctly, could you clarify the difference between the approach you mentioned earlier and this one?`;
  }

  // 5. Vague Answer Handling
  if (params.analysis.vague || lower.includes('some servers') || lower.includes('just used a cache') || (answer.split(' ').length < 12 && params.analysis.overall_performance !== 'STRONG')) {
    if (lower.includes('cache') || lower.includes('redis')) {
      return `You mentioned caching, but could you specify your cache invalidation strategy and eviction policies to prevent stale data?`;
    }
    if (lower.includes('scale') || lower.includes('server')) {
      return `You mentioned scaling servers, but how would you handle database connection pooling and failover under load?`;
    }
    return `Could you expand on the concrete technical implementation details and trade-offs for that approach?`;
  }

  // 6. Meta-Orchestrator Competency Probes
  if (params.nextAction.competency_id === 'scalability') {
    return `Got it. How does your caching and database tier behave as traffic scales to 50,000 requests per second under peak load?`;
  }
  if (params.nextAction.competency_id === 'customer_impact') {
    return `Understood. How did these architectural choices impact customer reliability metrics and business revenue?`;
  }

  return `Understood. What were the key architectural trade-offs and latency considerations in that design?`;
}

/**
 * Dynamic LLM dialogue generator for Alex (Technical) and Jordan (Product Lead).
 * Synthesizes natural, highly adaptive dialogue based on NextAction.
 */
async function synthesizeInterviewerSpeech(params: {
  persona: AgentProfile;
  nextAction: NextAction;
  execution: ExecutionResult;
  candidateAnswer: string;
  lastQuestion: string;
  analysis: AnswerAnalysis;
  recentTurns: Array<{ speaker: string; persona?: string; text: string }>;
}): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ECHOSPHERE_LLM_API_KEY;
  const baseUrl =
    process.env.ECHOSPHERE_LLM_BASE_URL ||
    (process.env.GEMINI_API_KEY
      ? 'https://generativelanguage.googleapis.com/v1beta/openai'
      : 'https://api.openai.com/v1');

  const modelsToTry = [
    process.env.ECHOSPHERE_LLM_MODEL || 'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  const prefix = params.execution.spokenPrefix || '';

  if (params.nextAction.action === 'COMPLETE') {
    return `${prefix}Thank you so much for walking through both the technical architecture and product impact today. You've covered all our core competencies thoroughly. That concludes our interview! Our recruiting team will follow up with next steps.`;
  }

  if (apiKey) {
    const historyContext = params.recentTurns
      .slice(-4)
      .map(
        (t) =>
          `${t.speaker === 'candidate' ? 'Candidate' : t.persona || 'Interviewer'}: "${t.text}"`
      )
      .join('\n');

    const prompt = `You are ${params.persona.display_name}, the ${params.persona.role} at EchoSphere conducting a live voice interview.
Interviewer instructions: ${params.persona.instructions}

CONVERSATION HISTORY:
${historyContext || 'No prior turns.'}

PREVIOUS QUESTION ASKED:
"${params.lastQuestion}"

CANDIDATE'S LATEST ANSWER:
"${params.candidateAnswer}"

INTELLIGENCE EVALUATION:
- Competency Evaluated: ${params.nextAction.competency_id || 'general'}
- Performance Rating: ${params.analysis.overall_performance} (Confidence: ${(params.analysis.confidence * 100).toFixed(0)}%)
- Vague Answer Flag: ${params.analysis.vague ? `YES (${params.analysis.vague_reason || 'lack of concrete details'})` : 'NO'}
- Contradiction Flag: ${params.analysis.contradiction_detected ? `YES (${params.analysis.contradiction_details})` : 'NO'}
- Recommended Follow-up: ${params.analysis.recommended_follow_up || 'None'}

ORCHESTRATOR DECISION:
- Action: ${params.nextAction.action}
- Target Competency: ${params.nextAction.competency_id || 'general'}
- Directive: "${params.nextAction.prompt_directive}"
${params.nextAction.action === 'SWITCH_AGENT' ? `- Handoff Transition: "${params.execution.spokenPrefix}"` : ''}

INSTRUCTIONS FOR GENERATING YOUR SPOKEN RESPONSE:
1. ALWAYS respond contextually to what the candidate JUST said:
   - If the candidate's answer was unrelated, off-topic, or out-of-context (e.g., sports, movies, chit-chat, nervousness), acknowledge it politely and redirect back to the technical/product question.
   - If the answer was vague or incomplete, ask a focused probing question about specific tools, metrics, or trade-offs.
   - If a contradiction was detected, ask a polite clarifying probe.
   - If the answer was strong, acknowledge the point concisely and advance to the next challenge as directed by the orchestrator.
2. DO NOT repeat the previous question verbatim unless explicitly asked.
3. Keep your spoken response natural, conversational, and concise (1-2 sentences maximum).
4. Output ONLY the plain dialogue text to be spoken.`;

    for (const model of modelsToTry) {
      try {
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
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content?.trim();
          if (content) {
            return `${prefix}${content}`;
          }
        }
      } catch (e) {
        // Try next model if timeout or error
      }
    }
  }

  // Use dynamic adaptive fallback if LLM synthesis is rate-limited or times out
  return generateAdaptiveDialogueFallback(params);
}

export async function POST(req: NextRequest) {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    // Extract interview ID or channel name from query param, header, body, or active session
    const requestedId =
      searchParams.get('interview_id') ||
      req.headers.get('x-interview-id') ||
      body.interview_id;

    let session = getSession(requestedId);
    if (!session) {
      session = createSession({ interview_id: requestedId || `INT-${Date.now()}` });
    }

    const interviewId = session.interview_id;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    // Extract latest candidate answer
    const lastUserMessage =
      messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'user')?.content || '';

    // Extract previous interviewer question from message history or session transcript
    const lastAssistantMessage =
      messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'assistant')?.content ||
      session.transcript_history
        .slice()
        .reverse()
        .find((t) => t.speaker === 'interviewer')?.text ||
      'Explain your architecture and design decisions.';

    let responseText = '';
    let isComplete = false;

    // Structured logging for live debugging
    console.log(`[CustomLLMAdapter] [${requestId}] Turn start:`, {
      interview_id: interviewId,
      current_agent_id: session.current_agent_id,
      missing_competencies: session.ai_context.missing_competencies,
      has_user_message: Boolean(lastUserMessage.trim()),
      user_message_snippet: lastUserMessage.slice(0, 60),
      last_question_snippet: lastAssistantMessage.slice(0, 60),
    });

    if (lastUserMessage.trim()) {
      // 1. Record candidate answer turn
      recordTranscriptTurn(interviewId, {
        speaker: 'candidate',
        text: lastUserMessage,
      });

      // 2. Identify target competency from missing competencies list
      const targetCompetency =
        session.ai_context.missing_competencies[0] ||
        (session.current_agent_id === 'product' ? 'customer_impact' : 'system_design');

      // 3. Call Member 1 Intelligence (:4005)
      const analysis = await analyzeAnswer({
        question: lastAssistantMessage,
        candidate_answer: lastUserMessage,
        target_competencies: [targetCompetency],
        interview_context: session.ai_context,
        answer_id: `ANS-${Date.now()}`,
      });

      console.log(`[CustomLLMAdapter] [${requestId}] M1 Analysis:`, {
        rating: analysis.overall_performance,
        confidence: analysis.confidence,
        vague: analysis.vague,
        contradiction: analysis.contradiction_detected,
        extracted_evidence: analysis.evidence?.length || 0,
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

      console.log(`[CustomLLMAdapter] [${requestId}] Meta-Orchestrator Decision:`, {
        action: nextAction.action,
        target_agent_id: nextAction.target_agent_id,
        competency_id: nextAction.competency_id,
        directive: nextAction.prompt_directive,
      });

      // 6. Execute NextAction (ASK_QUESTION, SWITCH_AGENT, COMPLETE)
      const execution = executeNextAction(interviewId, nextAction);
      isComplete = execution.isComplete;

      const activePersonaProfile = getPersona(execution.activePersonaId);

      // 7. Dynamically synthesize spoken response using LLM or dynamic adaptive engine
      responseText = await synthesizeInterviewerSpeech({
        persona: activePersonaProfile,
        nextAction,
        execution,
        candidateAnswer: lastUserMessage,
        lastQuestion: lastAssistantMessage,
        analysis,
        recentTurns: session.transcript_history.slice(-6),
      });

      console.log(`[CustomLLMAdapter] [${requestId}] Final Spoken Response:`, {
        persona: execution.activePersonaName,
        response_snippet: responseText.slice(0, 80),
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

    // Check if client requested streaming (Agora Conversational AI standard)
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
    console.error(`[CustomLLMAdapter] [${requestId}] Error processing turn:`, error);
    return NextResponse.json(
      {
        error: 'Failed to process turn',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
