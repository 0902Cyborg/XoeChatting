
import React, { useState, KeyboardEvent, useRef, useEffect, useCallback } from 'react';
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
import { Send, Smile, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isAISpeaking } from '@/lib/elevenlabs';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  voiceEnabled, 
  onToggleVoice 
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Start voice recording
  const startVoiceRecording = () => {
    // Don't start recording if AI is currently speaking
    if (isAISpeaking()) {
      return;
    }
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    setIsRecording(true);
    setIsListening(true);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + ' ' + transcript);
      setIsRecording(false);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        title: "Speech Recognition Error",
        description: event.error === 'no-speech'
          ? "No speech was detected"
          : "Error occurred during speech recognition",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Speech recognition failed to start', err);
      toast({
        title: "Speech Recognition Failed",
        description: "Could not start speech recognition",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsListening(false);
    }
  };
  
  // Stop voice recording
  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsListening(false);
  }, []);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="w-full flex items-end gap-2 bg-background/80 backdrop-blur-md p-4 border-t border-border">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleVoice}
              className="h-10 w-10 rounded-full"
              variant="outline"
              size="icon"
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{voiceEnabled ? 'Disable voice output' : 'Enable voice output'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {voiceEnabled && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={cn(
                  "h-10 w-10 rounded-full",
                  isRecording && "bg-red-500 hover:bg-red-600",
                  isListening && "animate-pulse"
                )}
                variant={isRecording ? "default" : "outline"}
                size="icon"
                disabled={isAISpeaking() || isLoading}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? 'Stop recording' : 'Start voice input'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          className={cn(
            "min-h-[60px] pr-12 resize-none transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary",
            isListening && "bg-primary/10"
          )}
          disabled={isLoading || isListening}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="absolute right-2 bottom-2 h-9 w-9 p-0 rounded-full"
          variant="default"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
