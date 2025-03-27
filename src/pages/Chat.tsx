
import React, { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatInput } from '@/components/ChatInput';
import { SessionsList } from '@/components/SessionsList';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { stopCurrentAudio, registerAudioEventHandlers } from '@/lib/elevenlabs';
import { useToast } from '@/components/ui/use-toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { VoiceStatusIndicator } from '@/components/chat/VoiceStatusIndicator';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { MobileSidebar } from '@/components/chat/MobileSidebar';
import { UserProfile } from '@/components/UserProfile';

const Chat: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    messages, 
    sendMessage, 
    sessions, 
    currentSession, 
    selectSession, 
    startNewSession,
    isLoading 
  } = useChat();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    // Load voice preference from localStorage, default to true
    const saved = localStorage.getItem('voiceEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);

  // Toggle voice functionality
  const handleToggleVoice = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    localStorage.setItem('voiceEnabled', String(newValue));
    
    // Stop any playing audio when disabling voice
    if (!newValue) {
      stopCurrentAudio();
    }
    
    toast({
      title: newValue ? "Voice mode enabled" : "Voice mode disabled",
      description: newValue 
        ? "You can now have a voice conversation with Xoe" 
        : "Voice conversation has been disabled",
      duration: 3000,
    });
  };

  // Register handlers for audio events
  useEffect(() => {
    registerAudioEventHandlers({
      onPlayStart: () => setAiIsSpeaking(true),
      onPlayEnd: () => setAiIsSpeaking(false),
    });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Stop audio playback when switching sessions
  useEffect(() => {
    stopCurrentAudio();
  }, [currentSession]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ChatHeader 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        onProfileClick={() => setProfileOpen(true)} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sessions Sidebar for Desktop */}
        <div className="w-80 h-full hidden md:block">
          <SessionsList
            sessions={sessions}
            currentSessionId={currentSession?.id}
            onSessionSelect={selectSession}
            onNewSession={startNewSession}
          />
        </div>
        
        {/* Mobile Sessions Sidebar */}
        <MobileSidebar
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSessionSelect={selectSession}
          onNewSession={startNewSession}
        />
        
        {/* Profile Sheet */}
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <UserProfile onClose={() => setProfileOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {currentSession ? (
            <>
              <VoiceStatusIndicator 
                isEnabled={voiceEnabled} 
                isSpeaking={aiIsSpeaking} 
              />
              
              <ChatMessages messages={messages} voiceEnabled={voiceEnabled} />
              
              {/* Input Area */}
              <div className="mt-auto">
                <ChatInput 
                  onSendMessage={sendMessage} 
                  isLoading={isLoading}
                  voiceEnabled={voiceEnabled}
                  onToggleVoice={handleToggleVoice}
                />
              </div>
            </>
          ) : (
            <ChatEmptyState 
              isSessionEmpty={true} 
              onNewChat={startNewSession} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
