
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2 } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';

interface GuestLoginButtonProps {
  email?: string;
}

export const GuestLoginButton: React.FC<GuestLoginButtonProps> = ({ email }) => {
  const { signInAsGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPageLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest(email);
      toast({
        title: "Guest login successful",
        description: "Redirecting to chat...",
      });
      
      // Immediate redirect
      setIsLoading(false);
      setPageLoading(false);
      navigate('/chat');
      
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast({
        title: "Guest login failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
      setPageLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-accent hover:bg-accent/90 shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
      onClick={handleGuestLogin}
      type="button"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Zap className="h-4 w-4 mr-2" />
      )}
      Continue as Guest
    </Button>
  );
};
