
import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSession } from '@/types';
import { cn } from '@/lib/utils';

interface SessionsListProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  return (
    <div className="w-full h-full flex flex-col border-r border-border bg-secondary/30">
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewSession} 
          className="w-full justify-start gap-2 elegant-button"
        >
          <Plus className="h-5 w-5" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg mb-1 transition-all flex items-center gap-2 hover:bg-secondary",
                currentSessionId === session.id ? "bg-secondary" : "bg-transparent"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="truncate">
                <p className="font-medium text-sm truncate">{session.title}</p>
                <p className="text-xs text-muted-foreground truncate">{session.lastMessage}</p>
              </div>
            </button>
          ))}

          {sessions.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
