
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { generateGeminiResponse } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

interface ChatContextType {
  currentSession: ChatSession | null;
  messages: Message[];
  sessions: ChatSession[];
  sendMessage: (content: string) => Promise<void>;
  startNewSession: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType>({
  currentSession: null,
  messages: [],
  sessions: [],
  sendMessage: async () => {},
  startNewSession: async () => {},
  selectSession: async () => {},
  isLoading: false,
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Load sessions for the current user
  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      // Check if this is a guest user
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        // For guest users, load sessions from localStorage
        const storedSessions = localStorage.getItem('guestSessions');
        const parsedSessions = storedSessions ? JSON.parse(storedSessions) : [];
        
        setSessions(parsedSessions);
        
        if (parsedSessions.length > 0) {
          // Load first session by default
          await selectSession(parsedSessions[0].id);
        } else {
          // Create a default session if user has none
          await startNewSession();
        }
        return;
      }
      
      // For authenticated users, load from Supabase
      const { data: sessionsData, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false });
      
      if (error) throw error;
      
      setSessions(sessionsData || []);
      
      if (sessionsData && sessionsData.length > 0) {
        // Load first session by default
        await selectSession(sessionsData[0].id);
      } else {
        // Create a default session if user has none
        await startNewSession();
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error loading chat sessions",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
      
      // Fallback to localStorage for any user if database fails
      await startNewSession();
    }
  };

  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Check if this is a guest user
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        // For guest users, load messages from localStorage
        const storedMessages = localStorage.getItem(`messages_${sessionId}`);
        const parsedMessages = storedMessages ? JSON.parse(storedMessages) : [];
        
        setMessages(parsedMessages);
        return;
      }
      
      // For authenticated users, load from Supabase
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('sent_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
      
      // Default to empty messages array on error
      setMessages([]);
    }
  }, [user, toast]);

  const sendMessage = async (content: string) => {
    if (!currentSession || !user) return;

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      sentAt: new Date().toISOString(),
      userId: user.id,
    };

    // Update local state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Check if this is a guest user
    const guestUser = localStorage.getItem('guestUser');
    
    if (guestUser) {
      // For guest users, save to localStorage
      localStorage.setItem(`messages_${currentSession.id}`, JSON.stringify(updatedMessages));
      
      // Update session with last message
      const updatedSession = {
        ...currentSession,
        lastMessage: content,
        lastUpdated: new Date().toISOString()
      };
      
      setCurrentSession(updatedSession);
      
      const updatedSessions = sessions.map(session =>
        session.id === currentSession.id ? updatedSession : session
      );
      
      setSessions(updatedSessions);
      localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));
    } else {
      // For authenticated users, save to Supabase
      try {
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            id: userMessage.id,
            content: userMessage.content,
            role: userMessage.role,
            user_id: user.id,
            session_id: currentSession.id,
            sent_at: userMessage.sentAt
          });
        
        if (insertError) throw insertError;
      } catch (error) {
        console.error('Error saving user message:', error);
        toast({
          title: "Error saving message",
          description: "Your message couldn't be saved",
          variant: "destructive",
        });
      }

      // Update session with last message
      try {
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            last_message: content,
            last_updated: new Date().toISOString()
          })
          .eq('id', currentSession.id);
        
        if (updateError) throw updateError;
        
        // Update local session state
        setCurrentSession({
          ...currentSession,
          lastMessage: content,
          lastUpdated: new Date().toISOString()
        });
        
        setSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === currentSession.id ? {
              ...session,
              lastMessage: content,
              lastUpdated: new Date().toISOString()
            } : session
          )
        );
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }

    // Generate AI response
    setIsLoading(true);
    const tempAiMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'ai',
      sentAt: new Date().toISOString(),
      isLoading: true,
    };
    setMessages([...updatedMessages, tempAiMessage]);

    try {
      // Pass user profile for personalization
      const aiResponse = await generateGeminiResponse(
        updatedMessages, 
        user.name || 'User',
        userProfile
      );
      
      const aiMessage: Message = {
        id: tempAiMessage.id,
        content: aiResponse,
        role: 'ai',
        sentAt: new Date().toISOString(),
      };

      // Update messages array with AI response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempAiMessage.id ? aiMessage : msg
        )
      );

      if (guestUser) {
        // For guest users, save to localStorage
        localStorage.setItem(`messages_${currentSession.id}`, JSON.stringify(
          [...updatedMessages, aiMessage]
        ));
        
        // Update session with last AI message
        const shortResponse = aiResponse.substring(0, 50) + (aiResponse.length > 50 ? '...' : '');
        const updatedSession = {
          ...currentSession,
          lastMessage: shortResponse,
          lastUpdated: new Date().toISOString()
        };
        
        setCurrentSession(updatedSession);
        
        const updatedSessions = sessions.map(session =>
          session.id === currentSession.id ? updatedSession : session
        );
        
        setSessions(updatedSessions);
        localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));
      } else {
        // Save AI message to database
        try {
          const { error: insertAiError } = await supabase
            .from('messages')
            .insert({
              id: aiMessage.id,
              content: aiMessage.content,
              role: aiMessage.role,
              user_id: user.id,
              session_id: currentSession.id,
              sent_at: aiMessage.sentAt
            });
          
          if (insertAiError) throw insertAiError;
        } catch (error) {
          console.error('Error saving AI message:', error);
        }

        // Update session with last AI message
        try {
          const shortResponse = aiResponse.substring(0, 50) + (aiResponse.length > 50 ? '...' : '');
          
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({
              last_message: shortResponse,
              last_updated: new Date().toISOString()
            })
            .eq('id', currentSession.id);
          
          if (updateError) throw updateError;
          
          // Update local session state
          setCurrentSession({
            ...currentSession,
            lastMessage: shortResponse,
            lastUpdated: new Date().toISOString()
          });
          
          setSessions(prevSessions =>
            prevSessions.map(session =>
              session.id === currentSession.id ? {
                ...session,
                lastMessage: shortResponse,
                lastUpdated: new Date().toISOString()
              } : session
            )
          );
        } catch (error) {
          console.error('Error updating session with AI response:', error);
        }
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Update the loading message with an error
      setMessages(messages => 
        messages.map(msg => 
          msg.id === tempAiMessage.id 
            ? {
                ...msg, 
                content: "I'm sorry, I couldn't generate a response. Please try again.",
                isLoading: false
              } 
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    if (!user) return;

    try {
      const newSessionId = uuidv4();
      const newSession: ChatSession = {
        id: newSessionId,
        title: `Conversation with Xoe`,
        lastMessage: 'Start a new conversation',
        lastUpdated: new Date().toISOString(),
        userId: user.id,
      };

      // Check if this is a guest user
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        // For guest users, save to localStorage
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));
        
        setCurrentSession(newSession);
        setMessages([]);
        
        // Add welcome message from Xoe
        const welcomeId = uuidv4();
        const welcomeMessage: Message = {
          id: welcomeId,
          content: `Hi there! I'm Xoe. It's great to meet you! How are you feeling today?`,
          role: 'ai',
          sentAt: new Date().toISOString(),
        };
        
        setMessages([welcomeMessage]);
        localStorage.setItem(`messages_${newSessionId}`, JSON.stringify([welcomeMessage]));
        
        // Update session with welcome message
        const updatedSession = {
          ...newSession,
          lastMessage: welcomeMessage.content.substring(0, 50) + '...',
          lastUpdated: welcomeMessage.sentAt
        };
        
        setCurrentSession(updatedSession);
        
        const finalSessions = updatedSessions.map(session =>
          session.id === newSessionId ? updatedSession : session
        );
        
        setSessions(finalSessions);
        localStorage.setItem('guestSessions', JSON.stringify(finalSessions));
        
        return;
      }

      // For authenticated users, save to Supabase
      // Create new session in database
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: newSessionId,
          title: newSession.title,
          user_id: user.id,
          last_message: newSession.lastMessage,
          last_updated: newSession.lastUpdated
        });
      
      if (error) {
        console.error('Error creating new session:', error);
        throw error;
      }

      // Update local state
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      
      // Add welcome message from Xoe
      const welcomeId = uuidv4();
      const welcomeMessage: Message = {
        id: welcomeId,
        content: `Hi there! I'm Xoe. It's great to meet you! How are you feeling today?`,
        role: 'ai',
        sentAt: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
      
      // Save welcome message to database
      await supabase
        .from('messages')
        .insert({
          id: welcomeId,
          content: welcomeMessage.content,
          role: 'ai',
          user_id: user.id,
          session_id: newSessionId,
          sent_at: welcomeMessage.sentAt
        });
      
      // Update session with welcome message
      await supabase
        .from('chat_sessions')
        .update({
          last_message: welcomeMessage.content.substring(0, 50) + '...',
          last_updated: welcomeMessage.sentAt
        })
        .eq('id', newSessionId);
      
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to localStorage if database fails
      const newSessionId = uuidv4();
      const newSession: ChatSession = {
        id: newSessionId,
        title: `Conversation with Xoe`,
        lastMessage: 'Start a new conversation',
        lastUpdated: new Date().toISOString(),
        userId: user.id,
      };
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));
      
      setCurrentSession(newSession);
      setMessages([]);
      
      // Add welcome message from Xoe
      const welcomeId = uuidv4();
      const welcomeMessage: Message = {
        id: welcomeId,
        content: `Hi there! I'm Xoe. It's great to meet you! How are you feeling today?`,
        role: 'ai',
        sentAt: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
      localStorage.setItem(`messages_${newSessionId}`, JSON.stringify([welcomeMessage]));
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        await fetchMessages(sessionId);
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      console.error('Error selecting session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        messages,
        sessions,
        sendMessage,
        startNewSession,
        selectSession,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
