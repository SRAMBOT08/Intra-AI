import { NextRequest, NextResponse } from 'next/server';
import * as agoraTokenPkg from 'agora-token';

const RtcTokenBuilder =
  (agoraTokenPkg as any).RtcTokenBuilder ||
  (agoraTokenPkg as any).default?.RtcTokenBuilder;
const RtcRole =
  (agoraTokenPkg as any).RtcRole ||
  (agoraTokenPkg as any).default?.RtcRole;

const EXPIRATION_TIME_IN_SECONDS = 3600;

function generateChannelName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `echosphere-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.NEXT_AGORA_APP_CERTIFICATE;

  const { searchParams } = new URL(request.url);
  const uidStr = searchParams.get('uid');
  const parsedUid = uidStr ? parseInt(uidStr, 10) : Number.NaN;
  const uid = Number.isNaN(parsedUid) || parsedUid <= 0
    ? Math.floor(Math.random() * 9_999_000) + 1000
    : parsedUid;
  const channelName = searchParams.get('channel') || generateChannelName();

  // If Agora credentials are not yet set in environment, return a mock token for local testing
  if (!APP_ID || !APP_CERTIFICATE) {
    console.warn('[AgoraToken] Agora credentials not set. Returning demo mock token.');
    return NextResponse.json({
      token: `mock_agora_token_${uid}_${channelName}`,
      uid: uid.toString(),
      channel: channelName,
      is_mock: true,
    });
  }

  const expirationTime = Math.floor(Date.now() / 1000) + EXPIRATION_TIME_IN_SECONDS;

  try {
    const token = RtcTokenBuilder.buildTokenWithRtm(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid.toString(),
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime,
    );

    return NextResponse.json({
      token,
      uid: uid.toString(),
      channel: channelName,
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Agora token',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
