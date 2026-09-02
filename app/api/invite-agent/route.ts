import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';
import { ClientStartRequest, AgentResponse } from '@/types/conversation';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
import { PERSONAS, INITIAL_GREETINGS } from '@/lib/personas';
import { getSession, updateSessionStatus } from '@/lib/session-store';

const agentUid = String(DEFAULT_AGENT_UID);

export async function POST(request: NextRequest) {
  try {
    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name, interview_id, initial_agent_id } = body;

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;

    const personaKey = initial_agent_id || 'technical';
    const persona = PERSONAS[personaKey] || PERSONAS.technical;
    const greeting = INITIAL_GREETINGS[personaKey] || INITIAL_GREETINGS.technical;

    if (interview_id) {
      updateSessionStatus(interview_id, 'IN_PROGRESS');
    }

    // If Agora credentials are not yet configured, return mock agent session for offline testing
    if (!appId || !appCertificate) {
      console.warn('[InviteAgent] Missing Agora credentials; returning mock running agent.');
      return NextResponse.json({
        agent_id: `mock-agent-${Date.now()}`,
        create_ts: Math.floor(Date.now() / 1000),
        state: 'RUNNING',
      } as AgentResponse);
    }

    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    const customLlmUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/custom-llm`
      : undefined;

    const agent = new Agent({
      client,
      instructions: persona.instructions,
      greeting,
      failureMessage: 'Please give me just a moment.',
      maxHistory: 30,
      turnDetection: {
        config: {
          speech_threshold: 0.5,
          start_of_speech: {
            mode: 'vad',
            vad_config: {
              interrupt_duration_ms: 180,
              prefix_padding_ms: 300,
            },
          },
          end_of_speech: {
            mode: 'vad',
            vad_config: {
              silence_duration_ms: 500,
            },
          },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: false },
      parameters: {
        audio_scenario: 'chorus',
        data_channel: 'rtm',
        enable_error_message: true,
        enable_metrics: true,
      },
    })
      .withStt(
        new DeepgramSTT({
          model: 'nova-3',
          language: 'en',
        })
      )
      .withLlm(
        customLlmUrl && (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ECHOSPHERE_LLM_API_KEY)
          ? new OpenAI({
              apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ECHOSPHERE_LLM_API_KEY || 'echosphere-key',
              url: customLlmUrl,
              model: 'gpt-4o-mini',
              greetingMessage: greeting,
              failureMessage: 'Let me pause for a moment.',
              maxHistory: 15,
            })
          : new OpenAI({
              model: 'gpt-4o-mini',
              greetingMessage: greeting,
              failureMessage: 'Let me pause for a moment.',
              maxHistory: 15,
              params: {
                max_tokens: 512,
                temperature: 0.7,
                top_p: 0.95,
              },
            })
      )
      .withTts(
        new MiniMaxTTS({
          model: 'speech_2_6_turbo',
          voiceId: 'English_captivating_female1',
        })
      );

    const session = agent.createSession({
      channel: channel_name,
      agentUid,
      remoteUids: [requester_id],
      idleTimeout: 30,
      expiresIn: ExpiresIn.hours(1),
      debug: false,
    });

    const agentId = await session.start();

    return NextResponse.json({
      agent_id: agentId,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } as AgentResponse);
  } catch (error) {
    console.error('Error starting conversation agent:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to start conversation agent',
      },
      { status: 500 }
    );
  }
}
