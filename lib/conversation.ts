export function normalizeTranscriptSpacing(text: string): string {
  return text
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    .replace(/,([A-Za-z])/g, ', $1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeTimestampMs(timestamp: number): number {
  return timestamp > 1e12 ? timestamp : timestamp * 1000;
}

export function mapAgentVisualizerState(
  agentState: string | null,
  isAgentConnected: boolean,
  connectionState: string
): 'disconnected' | 'joining' | 'not-joined' | 'listening' | 'analyzing' | 'talking' | 'ambient' {
  if (connectionState === 'DISCONNECTED' || connectionState === 'DISCONNECTING') {
    return 'disconnected';
  }
  if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') {
    return 'joining';
  }
  if (!isAgentConnected) {
    return 'not-joined';
  }

  switch (agentState) {
    case 'listening':
      return 'listening';
    case 'thinking':
    case 'analyzing':
      return 'analyzing';
    case 'speaking':
    case 'talking':
      return 'talking';
    case 'idle':
    case 'silent':
    default:
      return 'ambient';
  }
}
