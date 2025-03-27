
import React, { useEffect, useState, useCallback } from 'react';
import { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playAiMessage, stopCurrentAudio } from '@/lib/elevenlabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageProps {
  message: MessageType;
  voiceEnabled: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, voiceEnabled }) => {
  const { user } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  
  // Handle playback of voice
  const handlePlayVoice = useCallback(async () => {
    if (message.role === 'ai' && !message.isLoading) {
      setIsPlayingVoice(true);
      try {
        await playAiMessage(message);
      } catch (error) {
        console.error('Error playing voice:', error);
      } finally {
        setIsPlayingVoice(false);
      }
    }
  }, [message]);

  // Stop voice playback
  const handleStopVoice = useCallback(() => {
    stopCurrentAudio();
    setIsPlayingVoice(false);
  }, []);
  
  useEffect(() => {
    if (message.role === 'ai' && !message.isLoading) {
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i < message.content.length) {
          setDisplayText(message.content.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          
          // Auto-play voice if enabled and this is the latest AI message
          if (voiceEnabled && message.role === 'ai' && !message.isLoading) {
            handlePlayVoice();
          }
        }
      }, 8); // Slightly faster typing speed
      
      return () => clearInterval(interval);
    } else {
      setDisplayText(message.content);
    }
  }, [message, voiceEnabled, handlePlayVoice]);

  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex w-full mb-6 items-start gap-3 animate-slide-up opacity-0",
        isUser ? "justify-end" : "justify-start",
        { "animate-none opacity-100": isTyping }
      )}
      style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
    >
      {!isUser && (
        <Avatar className={cn("h-10 w-10 mt-1", isPlayingVoice && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
          <AvatarImage src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop" />
          <AvatarFallback className="bg-primary/10 text-primary">XOE</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[75%] md:max-w-[65%] lg:max-w-[55%]",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-xl group relative",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-muted rounded-tl-none",
            message.isLoading && "animate-pulse",
            isPlayingVoice && !isUser && "border border-primary"
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-1 py-1">
              <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '100ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '200ms' }}></div>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{displayText}</div>
              
              {!isUser && !isTyping && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={isPlayingVoice ? handleStopVoice : handlePlayVoice}
                        className={cn(
                          "absolute -right-2 -top-2 h-7 w-7 rounded-full p-0",
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          isPlayingVoice && "opacity-100"
                        )}
                        variant={isPlayingVoice ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {isPlayingVoice ? 
                          <VolumeX className="h-3 w-3" /> : 
                          <Volume2 className="h-3 w-3" />
                        }
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlayingVoice ? "Stop speaking" : "Play message"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>
        <div className="flex items-center mt-1 px-2 text-xs text-muted-foreground">
          <span>{formattedTime}</span>
          {isUser && message.isLoading === false && (
            <span className="ml-1.5">✓</span>
          )}
          {isPlayingVoice && !isUser && (
            <span className="ml-1.5 text-primary animate-pulse">Speaking...</span>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={user?.avatar_url || `https://api.dicebear.com/6.x/personas/svg?seed=${user?.name || 'User'}`} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
