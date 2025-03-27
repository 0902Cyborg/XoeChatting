
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SessionsList } from '@/components/SessionsList';
import { ChatSession } from '@/types';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-[80%] max-w-[300px]">
        <div className="h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Conversations</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SessionsList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={(sessionId) => {
              onSessionSelect(sessionId);
              onOpenChange(false);
            }}
            onNewSession={() => {
              onNewSession();
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
