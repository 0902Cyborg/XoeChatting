
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { AuthLoadingOverlay } from '@/components/auth/AuthLoadingOverlay';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { GuestLoginButton } from '@/components/auth/GuestLoginButton';
import { useLoading } from '@/context/LoadingContext';

const Login: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { setPageLoading, forceResetLoading } = useLoading();
  const [isSignUp, setIsSignUp] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Clear loading state when component mounts and unmounts
  useEffect(() => {
    console.log('Login page mounted, cleaning up loading state');
    setPageLoading(false);
    forceResetLoading();
    
    return () => {
      console.log('Login page unmounting, cleaning up loading state');
      setPageLoading(false);
      forceResetLoading();
    };
  }, [setPageLoading, forceResetLoading]);

  // Handle auth state changes
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      console.log('Auth state check on Login page:', { user, authLoading, redirectAttempted });
      
      if (user && !authLoading && !redirectAttempted) {
        setRedirectAttempted(true);
        console.log("Redirecting to chat from Login page - user already authenticated");
        navigate('/chat');
      }
    };
    
    checkAuthAndRedirect();
    
    // Set a timeout as a fallback to prevent getting stuck
    const redirectTimeout = setTimeout(() => {
      if (user && !redirectAttempted) {
        console.log("Fallback redirect triggered");
        navigate('/chat');
      }
    }, 500);
    
    return () => clearTimeout(redirectTimeout);
  }, [user, authLoading, navigate, redirectAttempted]);

  // Show loading only during initial auth check
  if (authLoading) {
    return <AuthLoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-60 h-60 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Grid lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(66,71,112,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(66,71,112,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
      
      <Card className="w-full max-w-md relative backdrop-blur-xl bg-card/30 border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.3)] overflow-hidden futuristic-card">
        <CardHeader className="space-y-1 z-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'Enter your details to create an account'
              : 'Sign in to continue to Xoe AI Companion'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="z-10">
          {isSignUp 
            ? <SignupForm onToggleMode={() => setIsSignUp(false)} />
            : <LoginForm onToggleMode={() => setIsSignUp(true)} />}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 z-10">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 backdrop-blur-sm px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          
          <GuestLoginButton />
        </CardFooter>
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-accent/30 rounded-full blur-xl"></div>
      </Card>
    </div>
  );
};

export default Login;
