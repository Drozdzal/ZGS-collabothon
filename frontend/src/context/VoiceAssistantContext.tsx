import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { sendAudioForAsr, interpretText, VoiceCommand, speakText } from '../api/voiceClient';

type VoiceAssistantContextValue = {
  isListening: boolean;
  isProcessing: boolean;
  lastTranscript: string | null;
  lastCommand: VoiceCommand | null;
  error: string | null;
  listenAndInterpret: (onCommand: (cmd: VoiceCommand, transcript: string) => void) => Promise<void>;
  speak: (text: string) => void;
};

const VoiceAssistantContext = createContext<VoiceAssistantContextValue | undefined>(undefined);

interface VoiceAssistantProviderProps {
  children: ReactNode;
}

export function VoiceAssistantProvider({ children }: VoiceAssistantProviderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const speak = useCallback((text: string) => {
    // Delegate TTS to the backend; the ATM server will play audio directly.
    void speakText(text);
  }, []);

  const listenAndInterpret = useCallback(
    async (onCommand: (cmd: VoiceCommand, transcript: string) => void) => {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone is not available in this browser.');
        return;
      }

      // If already listening, ignore new calls.
      if (isListening) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        recorder.onerror = () => {
          setError('Error while recording audio.');
          setIsListening(false);
        };

        recorder.onstop = async () => {
          setIsListening(false);
          setIsProcessing(true);
          try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            chunksRef.current = [];
            const asr = await sendAudioForAsr(blob);
            if (asr.status !== 'ok' || !asr.transcript) {
              setError('Could not understand speech. Please try again.');
              setIsProcessing(false);
              return;
            }

            setLastTranscript(asr.transcript);

            const interpretation = await interpretText(asr.transcript);
            if (interpretation.status !== 'ok') {
              setError('Could not interpret your request.');
              setIsProcessing(false);
              return;
            }

            setLastCommand(interpretation.command);
            setIsProcessing(false);
            onCommand(interpretation.command, asr.transcript);
          } catch (e) {
            setError('Error while processing voice command.');
            setIsProcessing(false);
          }
        };

        setIsListening(true);
        recorder.start();

        // Stop after a fixed duration (e.g., 4 seconds)
        setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }, 4000);
      } catch (e) {
        setError('Unable to access microphone. Check permissions.');
        setIsListening(false);
      }
    },
    [isListening]
  );

  const value: VoiceAssistantContextValue = useMemo(
    () => ({
      isListening,
      isProcessing,
      lastTranscript,
      lastCommand,
      error,
      listenAndInterpret,
      speak,
    }),
    [isListening, isProcessing, lastTranscript, lastCommand, error, listenAndInterpret, speak]
  );

  return (
    <VoiceAssistantContext.Provider value={value}>{children}</VoiceAssistantContext.Provider>
  );
}

export function useVoiceAssistant() {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return ctx;
}


