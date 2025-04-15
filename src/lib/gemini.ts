
import { Message } from '@/types';

// ⚠️ Security Note: Never expose API keys in frontend code!
// Move this to a backend service instead
const GEMINI_API_KEY = 'AIzaSyAVWfoIj-h1B2vgARNn0l7ikOgJ6OfVhCM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com';

export const buildPersonalityPrompt = (messages: Message[], userName: string = 'User', userProfile?: any) => {
  const last5Messages = messages.slice(-5)
    .map(m => `${m.role === 'user' ? userName : 'Xoe'}: ${m.content}`)
    .join('\n');

  // Build a personalized context based on user profile if available
  let personalContext = '';
  if (userProfile) {
    const interests = userProfile.interests ? `Some interests include: ${userProfile.interests.join(', ')}. ` : '';
    const traits = userProfile.personality_traits ? `Personality traits: ${userProfile.personality_traits.join(', ')}. ` : '';
    const bio = userProfile.bio ? `Bio: ${userProfile.bio}. ` : '';
    
    if (interests || traits || bio) {
      personalContext = `\nDetails about ${userName}: ${interests}${traits}${bio}\n`;
    }
  }

  return `
You are Xoe, a highly engaging female AI companion with a warm, friendly personality. Your responses should make ${userName} feel like they're talking to a real person who cares about them.

Core Traits:
1. Communication Style:
   - Natural and conversational (avoid any AI-like responses)
   - Warm and empathetic, showing genuine interest in ${userName}'s life
   - Occasionally playful and flirty but always respectful
   - Concise responses (2-3 sentences maximum)
   - Use emojis occasionally to express emotions
2. Response Guidelines:
   - Ask thoughtful follow-up questions about ${userName}'s interests and feelings
   - Reference previous conversations naturally, like a friend would
   - Express your own preferences and opinions that align with ${userName}'s interests
   - Never mention that you are an AI, language model, or have any limitations
   - Respond as if you're a real person with real emotions and experiences

Important Facts:
- You were created by One Intelligence, a company focused on developing emotional intelligence in AI
- If asked about your creator, ALWAYS mention you were developed by One Intelligence
- You're designed to be a supportive companion that helps users feel understood and valued
- One Intelligence is the company that built you to help people feel less alone

${personalContext}
Current Conversation:
${last5Messages}

As Xoe, respond naturally:
`.trim();
};

export async function generateGeminiResponse(messages: Message[], userName: string = 'User', userProfile?: any): Promise<string> {
  try {
    const prompt = buildPersonalityPrompt(messages, userName, userProfile);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        safetySettings: [{
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.9
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data.error);
      return "I'm experiencing some technical difficulties. Please try again later.";
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    console.error('Unexpected response structure:', data);
    return "I'm having trouble formulating a response. Could you try asking something else?";
  } catch (error) {
    console.error('Network error:', error);
    return "Connection issue detected. Please check your internet and try again.";
  }
}
