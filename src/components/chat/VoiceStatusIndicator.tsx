
import React from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceStatusIndicatorProps {
  isEnabled: boolean;
  isSpeaking: boolean;
}

export const VoiceStatusIndicator: React.FC<VoiceStatusIndicatorProps> = ({ 
  isEnabled, 
  isSpeaking 
}) => {
  const { toast } = useToast();
  
  if (!isEnabled) return null;
  
  return (
    <div
      className={`
        flex items-center justify-center py-1.5 px-4
        ${isSpeaking ? "bg-green-500/20" : "bg-blue-500/10"}
        border-b border-border text-sm
      `}
    >
      <Volume2 className="h-3.5 w-3.5 mr-2" />
      <span className="flex-1">
        {isSpeaking 
          ? "Xoe is speaking... please wait" 
          : "Voice conversation mode is enabled"}
      </span>
      <AlertCircle className="h-3.5 w-3.5 ml-2 text-amber-400" />
    </div>
  );
};
