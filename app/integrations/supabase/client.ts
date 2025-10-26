import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://xkwkjrsgbnzprwbkdzgt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd2tqcnNnYm56cHJ3Ymtkemd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDc3MjUsImV4cCI6MjA3NzAyMzcyNX0.xfa0bO8XPACGMfzcw8GJrVY7fwSeGj_MmVWPc3EAG7w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
