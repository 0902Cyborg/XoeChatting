
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  sentAt: string;
  userId?: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  aiGenderPreference: string;
  relationshipStage: 'new' | 'acquaintance' | 'dating' | 'committed';
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}
