
import React from 'react';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/context/LoadingContext';

export const AuthLoadingOverlay: React.FC = () => {
  const { forceResetLoading } = useLoading();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center glass-dark p-8 rounded-2xl cyber-border">
        <Loading size="lg" className="mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-primary">Initializing System</h2>
        <p className="text-muted-foreground">Establishing secure connection...</p>
        
        {/* Recovery button */}
        <div className="mt-6 opacity-0 animate-[fade-in_1s_ease_3s_forwards]">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              forceResetLoading();
              window.location.reload();
            }}
          >
            Connection taking too long? Click to reset
          </Button>
        </div>
      </div>
      <div className="mt-8 text-sm text-muted-foreground/70 max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse"></span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse delay-100"></span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse delay-200"></span>
        </div>
        <p>Xoe AI Companion • Secure Authentication Protocol</p>
      </div>
    </div>
  );
};
