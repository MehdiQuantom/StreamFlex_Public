
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings
const SUPABASE_URL = 'https://xkwkjrsgbnzprwbkdzgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd2tqcnNnYm56cHJ3Ymtkemd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDc3MjUsImV4cCI6MjA3NzAyMzcyNX0.xfa0bO8XPACGMfzcw8GJrVY7fwSeGj_MmVWPc3EAG7w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  season?: number;
  episode?: number;
  progress: number;
  last_watched: string;
  created_at: string;
}
