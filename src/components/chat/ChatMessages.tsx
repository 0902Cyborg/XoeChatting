
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message as MessageComponent } from '@/components/Message';
import { Message as MessageType } from '@/types';
import { ChatEmptyState } from './ChatEmptyState';

interface ChatMessagesProps {
  messages: MessageType[];
  voiceEnabled: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, voiceEnabled }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 p-4 pb-0">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <ChatEmptyState voiceEnabled={voiceEnabled} />
        ) : (
          messages.map((message) => (
            <MessageComponent 
              key={message.id} 
              message={message} 
              voiceEnabled={voiceEnabled} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* One Intelligence Branding */}
      <div className="text-center text-xs text-muted-foreground mt-4 mb-2">
        Xoe AI Companion by One Intelligence
      </div>
    </ScrollArea>
  );
};
