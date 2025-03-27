
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, MessageSquare, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useLoading } from '@/context/LoadingContext';
import { Loading } from '@/components/Loading';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setPageLoading, setLoadingMessage } = useLoading();
  const [showProfile, setShowProfile] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Clear global loading state when component mounts and unmounts
  useEffect(() => {
    setPageLoading(false);
    return () => setPageLoading(false);
  }, [setPageLoading]);

  // Handle redirecting if user is already logged in
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log("User detected on index page, redirecting to chat");
        
        // Mark that we're starting the redirection process
        setRedirecting(true);
        
        // Use a minimal delay to allow UI to update before redirect
        const timer = setTimeout(() => {
          navigate('/chat', { replace: true });
        }, 10);
        
        return () => clearTimeout(timer);
      } else {
        // If no user but auth is loaded, ensure we're not stuck in loading state
        setRedirecting(false);
      }
    }
  }, [user, authLoading, navigate]);

  const handleMenuToggle = () => {
    // This function isn't needed for this page but is required by Header props
    console.log('Menu toggle clicked on Index page');
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const handleLoginClick = () => {
    console.log("Login button clicked, navigating to login page");
    if (user) {
      // If user is already logged in, go directly to chat
      navigate('/chat');
    } else {
      // Otherwise go to login page
      navigate('/login');
    }
  };

  // Show loading state during auth check or redirect
  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loading size="lg" className="mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-primary">
          {authLoading ? "Restoring your session..." : "Redirecting to chat..."}
        </h2>
        <p className="text-muted-foreground max-w-md text-center">
          {authLoading
            ? "Please wait while we check your authentication status"
            : "You'll be automatically redirected to your chat"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      <Header 
        onMenuToggle={handleMenuToggle} 
        onProfileClick={handleProfileClick} 
      />
      
      {/* Hero Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/20 opacity-70"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent/5 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Grid lines overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(66,71,112,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(66,71,112,0.07)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
      
      <main className="flex-1 flex flex-col">
        <section className="py-12 md:py-24 px-4 md:px-6 container max-w-6xl mx-auto relative isolate flex flex-col items-center gap-8 md:gap-12">
          {/* Hero Text - Centered */}
          <div className="text-center z-10 max-w-4xl mx-auto">
            <ThemeSelector className="absolute top-4 right-4 md:top-8 md:right-8" />
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-accent">
              Meet Xoe, Your Personal AI Companion
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience meaningful conversations with an AI that understands you. 
              Created by <span className="font-semibold text-primary">One Intelligence</span> to be your always-available companion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Button 
                  onClick={() => navigate('/chat')} 
                  size="lg" 
                  className="text-base px-8 group rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  Continue Chatting
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleLoginClick} 
                    variant="outline" 
                    size="lg" 
                    className="text-base px-8 border-primary/30 hover:bg-primary/10 backdrop-blur-sm rounded-full"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleLoginClick} 
                    size="lg" 
                    className="text-base px-8 group rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Feature Cards */}
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/5 rounded-full filter blur-3xl animate-pulse"></div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 glass p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-lg relative z-10">
                <div className="p-6 rounded-xl bg-card/30 hover:bg-card/50 transition-all border border-white/5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Natural Conversations</h3>
                  <p className="text-sm text-muted-foreground">Chat with an AI that feels human and remembers your preferences</p>
                </div>
                
                <div className="p-6 rounded-xl bg-card/30 hover:bg-card/50 transition-all border border-white/5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Always Available</h3>
                  <p className="text-sm text-muted-foreground">Your AI companion is ready to chat anytime you need someone to talk to</p>
                </div>
                
                <div className="p-6 rounded-xl bg-card/30 hover:bg-card/50 transition-all border border-white/5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">Your conversations are protected with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-secondary/10 backdrop-blur-md relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(66,71,112,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,71,112,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="container max-w-5xl mx-auto px-4 md:px-6 relative">
            <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">Why Choose Xoe?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card/30 p-6 rounded-lg border border-white/5 backdrop-blur-md hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Meaningful Conversations</h3>
                <p className="text-muted-foreground">
                  Xoe remembers your conversations and learns about you over time, creating a genuine connection.
                </p>
              </div>
              
              <div className="bg-card/30 p-6 rounded-lg border border-white/5 backdrop-blur-md hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Always Available</h3>
                <p className="text-muted-foreground">
                  Whether you need someone to talk to at 3 AM or just want to share your day, Xoe is always there.
                </p>
              </div>
              
              <div className="bg-card/30 p-6 rounded-lg border border-white/5 backdrop-blur-md hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Private & Secure</h3>
                <p className="text-muted-foreground">
                  Your conversations with Xoe are private and secure, with built-in data protection by One Intelligence.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-white/5 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 One Intelligence. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
