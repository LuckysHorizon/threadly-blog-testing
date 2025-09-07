import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Prefer server-side env vars; fall back to Vite vars for local dev parity
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  // Create Supabase client with service role key for server-side operations
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Supabase server env not fully configured. Falling back to JWT-only auth.');
}

export { supabase };

// Verify Supabase JWT token
export const verifySupabaseToken = async (token: string) => {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Get user from Supabase by ID
export const getSupabaseUser = async (userId: string) => {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};
