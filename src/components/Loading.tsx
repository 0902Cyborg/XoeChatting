
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export const Loading = ({ size = 'md', className, message }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        <div className={cn("animate-spin rounded-full border-2 border-primary/30 border-t-primary", sizeClasses[size])}></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full animate-ping border border-primary/50 opacity-20"></div>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export const FuturisticLoading = ({ className, message }: { className?: string, message?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative h-20 w-20 mb-6">
        <div className="absolute h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
        </div>
        <div className="absolute inset-0 border border-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-primary/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">{message || 'Loading'}</h3>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
