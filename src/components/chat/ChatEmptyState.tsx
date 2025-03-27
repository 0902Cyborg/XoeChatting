
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatEmptyStateProps {
  onNewChat?: () => void;
  isSessionEmpty?: boolean;
  voiceEnabled?: boolean;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ 
  onNewChat, 
  isSessionEmpty = false,
  voiceEnabled = false
}) => {
  if (isSessionEmpty) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-2">
            Select a conversation or start a new one
          </h3>
          <p className="text-muted-foreground mb-6">
            Choose an existing chat or create a new one to start talking with Xoe
          </p>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="elegant-button mx-auto"
            >
              Start New Chat
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col items-center justify-center min-h-[200px]">
      <div className="mb-6">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500&auto=format&fit=crop" />
          <AvatarFallback className="bg-primary/10 text-2xl">XOE</AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center p-8 max-w-md">
        <h3 className="text-xl font-medium mb-2">Hello! I'm Xoe from One Intelligence</h3>
        <p className="text-muted-foreground">
          Send a message to begin our conversation
        </p>
        {voiceEnabled && (
          <p className="mt-2 text-primary">
            Voice mode is enabled. You can speak with me using your microphone.
          </p>
        )}
      </div>
    </div>
  );
};
