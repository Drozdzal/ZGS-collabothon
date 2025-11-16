export type AsrResponse = {
  status: 'ok' | 'error';
  transcript: string;
};

export type VoiceCommand = {
  intent:
    | 'transfer'
    | 'show_balance'
    | 'show_mini_statement'
    | 'show_standing_orders'
    | 'exit'
    | 'confirm'
    | 'unknown';
  amount?: number | null;
  recipient_name?: string | null;
};

export type InterpretResponse = {
  status: 'ok' | 'error';
  command: VoiceCommand;
};

const BASE_URL =
  (import.meta as any).env?.VITE_VOICE_API_BASE_URL ?? 'http://localhost:8001';

export async function sendAudioForAsr(audioBlob: Blob): Promise<AsrResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.webm');

  const response = await fetch(`${BASE_URL}/api/voice/asr`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    return {
      status: 'error',
      transcript: '',
    };
  }

  return (await response.json()) as AsrResponse;
}

export async function interpretText(text: string): Promise<InterpretResponse> {
  const response = await fetch(`${BASE_URL}/api/voice/interpret`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    return {
      status: 'error',
      command: { intent: 'unknown' },
    };
  }

  return (await response.json()) as InterpretResponse;
}

export async function speakText(text: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/voice/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  } catch {
    // Swallow errors for now – the ATM can still function without voice.
  }
}


