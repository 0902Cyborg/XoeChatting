
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Loading, FuturisticLoading } from '@/components/Loading';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LoadingContextType {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  forceResetLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isPageLoading: false,
  setPageLoading: () => null,
  loadingMessage: '',
  setLoadingMessage: () => null,
  forceResetLoading: () => null,
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);
  const loadingTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const resetButtonTimerRef = useRef<number | null>(null);

  // Force clear loading state - useful for recovering from stuck states
  const forceResetLoading = () => {
    console.log('Force resetting loading state');
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (resetButtonTimerRef.current) {
      window.clearTimeout(resetButtonTimerRef.current);
      resetButtonTimerRef.current = null;
    }
    setIsPageLoading(false);
    setLoadingProgress(0);
    setShowResetButton(false);
    setLoadingMessage('');
  };

  // Auto-display reset button after delay
  useEffect(() => {
    if (isPageLoading) {
      // Show reset button after 3 seconds of loading
      if (resetButtonTimerRef.current) {
        window.clearTimeout(resetButtonTimerRef.current);
      }
      
      resetButtonTimerRef.current = window.setTimeout(() => {
        setShowResetButton(true);
      }, 3000);
    } else {
      setShowResetButton(false);
      if (resetButtonTimerRef.current) {
        window.clearTimeout(resetButtonTimerRef.current);
        resetButtonTimerRef.current = null;
      }
    }
    
    return () => {
      if (resetButtonTimerRef.current) {
        window.clearTimeout(resetButtonTimerRef.current);
        resetButtonTimerRef.current = null;
      }
    };
  }, [isPageLoading]);

  // Progress animation
  useEffect(() => {
    if (isPageLoading) {
      // Animate progress from 0 to 95% over 5 seconds
      setLoadingProgress(0);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      
      progressTimerRef.current = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            if (progressTimerRef.current) {
              window.clearInterval(progressTimerRef.current);
              progressTimerRef.current = null;
            }
            return 95; // Cap at 95% until complete
          }
          return prev + (95 - prev) * 0.1;
        });
      }, 300);
    } else {
      // When loading completes, quickly fill to 100% then reset
      setLoadingProgress(100);
      const resetTimer = window.setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
      
      return () => window.clearTimeout(resetTimer);
    }
    
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isPageLoading]);

  // Safety timeout to prevent infinite loading states
  useEffect(() => {
    if (isPageLoading) {
      // Clear any existing timer
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
      
      // Set a new timeout to automatically clear the loading state after 5 seconds
      loadingTimerRef.current = window.setTimeout(() => {
        console.log('Loading timeout reached - automatically clearing loading state');
        setIsPageLoading(false);
      }, 5000); // Reduced from 8s to 5s for faster recovery
    } else {
      // Clear the timer if loading is set to false
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isPageLoading]);

  const setPageLoading = (loading: boolean) => {
    console.log(`Setting page loading state to: ${loading}`);
    setIsPageLoading(loading);
  };

  // When component unmounts, ensure we clean up all timers
  useEffect(() => {
    // Initial cleanup on mount to ensure no stuck states
    forceResetLoading();
    
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      if (resetButtonTimerRef.current) {
        window.clearTimeout(resetButtonTimerRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      isPageLoading, 
      setPageLoading, 
      loadingMessage, 
      setLoadingMessage,
      forceResetLoading
    }}>
      {children}
      {isPageLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4 p-6 glass rounded-xl max-w-md mx-auto">
            <FuturisticLoading message={loadingMessage || 'Loading...'} />
            <div className="w-full mt-6">
              <Progress value={loadingProgress} className="h-2" />
            </div>
            
            {showResetButton && (
              <div className="mt-4 opacity-100 animate-[fade-in_0.3s_ease_forwards]">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={forceResetLoading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Taking too long? Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
