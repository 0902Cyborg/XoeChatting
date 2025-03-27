
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

export const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar_url: user?.avatar_url || '',
    bio: '',
    interests: '',
    personality_traits: ''
  });

  useEffect(() => {
    const fetchExtendedProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfileData({
            name: data.name || user.name || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            interests: data.interests ? data.interests.join(', ') : '',
            personality_traits: data.personality_traits ? data.personality_traits.join(', ') : ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchExtendedProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Format arrays
      const formattedInterests = profileData.interests
        ? profileData.interests.split(',').map(item => item.trim()).filter(Boolean)
        : [];
        
      const formattedTraits = profileData.personality_traits
        ? profileData.personality_traits.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      // Update basic profile
      await updateProfile({
        name: profileData.name,
        avatar_url: profileData.avatar_url
      });
      
      // Update extended profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: profileData.bio,
          interests: formattedInterests,
          personality_traits: formattedTraits
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Update your personal information to enhance your experience with Xoe
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${profileData.name}`} />
              <AvatarFallback>{profileData.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="avatar_url" className="text-sm font-medium">Profile Picture URL</label>
            <Input
              id="avatar_url"
              name="avatar_url"
              value={profileData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/your-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Enter a URL to an image for your profile</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Display Name</label>
            <Input
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
            <Textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell Xoe a bit about yourself"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="interests" className="text-sm font-medium">Interests</label>
            <Input
              id="interests"
              name="interests"
              value={profileData.interests}
              onChange={handleChange}
              placeholder="Travel, Music, Sports, etc. (comma separated)"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="personality_traits" className="text-sm font-medium">Personality Traits</label>
            <Input
              id="personality_traits"
              name="personality_traits"
              value={profileData.personality_traits}
              onChange={handleChange}
              placeholder="Funny, Adventurous, Creative, etc. (comma separated)"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
