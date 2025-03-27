
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoading } from '@/context/LoadingContext';

interface SignupFormProps {
  onToggleMode: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPageLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signUp(formData.email, formData.password, formData.name);
      toast({
        title: "Account created",
        description: "Sign in successful! Redirecting...",
      });
      
      // Immediate redirect after signup
      setIsLoading(false);
      setPageLoading(false);
      navigate('/chat');
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Sign up failed');
      setIsLoading(false);
      setPageLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="px-6 pb-2 z-10">
          <Alert variant="destructive" className="bg-destructive/20 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground/90">Name</Label>
          <div className="relative">
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required={true}
              className="futuristic-input pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/90">Email</Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required={true}
              className="futuristic-input pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground/90">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required={true}
              className="futuristic-input pl-10"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button 
          className="w-full group futuristic-button" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
          )}
          {isLoading ? 'Processing...' : 'Create account'}
        </Button>
      </div>

      <div className="mt-4 text-center text-sm">
        <span>
          Already have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-primary"
            onClick={onToggleMode}
          >
            Sign in
          </Button>
        </span>
      </div>
    </form>
  );
};
