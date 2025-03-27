
import { Message } from '@/types';

const ELEVENLABS_API_KEY = "sk_9b4ce06e9ba7341d1cd7df4d7b1a65a9178f0854c9f45e50";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; //  voice
const MODEL_ID = "eleven_multilingual_v2";

// Central audio control
let currentAudio: HTMLAudioElement | null = null;
let isAiSpeaking = false;

// Event handlers for audio playback
const audioEventHandlers: {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
} = {};

export function registerAudioEventHandlers(handlers: {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}) {
  audioEventHandlers.onPlayStart = handlers.onPlayStart;
  audioEventHandlers.onPlayEnd = handlers.onPlayEnd;
}

export async function convertTextToSpeech(text: string): Promise<string> {
  try {
    console.log("Converting text to speech:", text);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0,
            similarity_boost: 0.75,
            use_speaker_boost: true,
            style: 0.0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Create a blob URL from the audio data
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}

// A function to play an AI message with proper event handling
export async function playAiMessage(message: Message): Promise<void> {
  try {
    // Stop any currently playing audio first
    stopCurrentAudio();
    
    isAiSpeaking = true;
    if (audioEventHandlers.onPlayStart) {
      audioEventHandlers.onPlayStart();
    }
    
    const audioUrl = await convertTextToSpeech(message.content);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    
    // Set up event handlers
    audio.onended = () => {
      isAiSpeaking = false;
      if (audioEventHandlers.onPlayEnd) {
        audioEventHandlers.onPlayEnd();
      }
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      isAiSpeaking = false;
      if (audioEventHandlers.onPlayEnd) {
        audioEventHandlers.onPlayEnd();
      }
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
    
    await audio.play();
  } catch (error) {
    console.error("Error playing AI message:", error);
    isAiSpeaking = false;
    if (audioEventHandlers.onPlayEnd) {
      audioEventHandlers.onPlayEnd();
    }
  }
}

// A function to stop all currently playing audio
export function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    isAiSpeaking = false;
    if (audioEventHandlers.onPlayEnd) {
      audioEventHandlers.onPlayEnd();
    }
  }
}

// Check if AI is currently speaking
export function isAISpeaking(): boolean {
  return isAiSpeaking;
}
