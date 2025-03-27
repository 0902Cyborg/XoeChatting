
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogOut, MenuIcon, User } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  onProfileClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onMenuToggle, onProfileClick }) => {
  const { user, signOut } = useAuth();
  const { startNewSession } = useChat();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNewChat = async () => {
    await startNewSession();
  };

  return (
    <header className="w-full py-3 px-4 md:px-6 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden p-1 h-8 w-8"
          onClick={onMenuToggle}
        >
          <MenuIcon size={20} />
        </Button>
        
        <h1 className="text-xl font-semibold flex items-center">
          <span className="text-primary mr-1">Xoe</span>
          <span className="hidden sm:inline">Companion</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        {user && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNewChat}
            className="text-sm gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        )}
        
        {user ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onProfileClick}
              className="p-1 h-8 w-8"
            >
              <User size={18} />
            </Button>
            
            <Avatar 
              className="h-8 w-8 transition-all hover:scale-105 cursor-pointer" 
              onClick={onProfileClick}
            >
              <AvatarImage src={user.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name || user.email}`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm">
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={() => navigate('/login')} className="text-sm">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
