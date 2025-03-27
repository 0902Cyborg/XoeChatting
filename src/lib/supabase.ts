
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvpewduqhfnnwnvzheez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cGV3ZHVxaGZubndudnpoZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjA4MDQsImV4cCI6MjA1NzM5NjgwNH0._5pCei_AUq00lAkyawyDzS4f-TQbRvfkSHx4e8Lt4ic';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'X-Client-Info': 'xoe-companion-app' }
  }
});
