
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signInAsGuest: (email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  signInAsGuest: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for guest user in localStorage on initialization
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First check if there's a Supabase session
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          // Handle authenticated Supabase user
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileData) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: profileData.name || '',
              avatar_url: profileData.avatar_url,
            });
          } else {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: '',
              avatar_url: '',
            });
          }
        } else {
          // Check for guest user in localStorage
          const guestUser = localStorage.getItem('guestUser');
          if (guestUser) {
            setUser(JSON.parse(guestUser));
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profileData.name || '',
            avatar_url: profileData.avatar_url,
          });
        } else {
          // Create a profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: session.user.id, 
                name: session.user.user_metadata?.name || '',
                email: session.user.email,
              }
            ]);

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            avatar_url: '',
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Also clear guest user on sign out
        localStorage.removeItem('guestUser');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInAsGuest = async (email?: string) => {
    try {
      // Create a guest user with a random ID
      const guestUser: User = {
        id: uuidv4(),
        email: email || `guest-${Math.floor(Math.random() * 10000)}@example.com`,
        name: email ? email.split('@')[0] : `Guest-${Math.floor(Math.random() * 10000)}`,
        avatar_url: '',
      };

      // Save to localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      // Update state
      setUser(guestUser);
      
      toast({
        title: "Welcome!",
        description: "You are now using the app as a guest.",
      });
    } catch (error: any) {
      toast({
        title: "Guest login failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      // First, check if this is a guest user
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        // For guest users, just remove from localStorage
        localStorage.removeItem('guestUser');
        setUser(null);
      } else {
        // For Supabase authenticated users
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
      }
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      // Check if this is a guest user
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        // For guest users, update localStorage
        const updatedUser = { ...user, ...data };
        localStorage.setItem('guestUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        // For Supabase authenticated users
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: data.name,
            avatar_url: data.avatar_url,
          })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        setUser({ ...user, ...data });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
