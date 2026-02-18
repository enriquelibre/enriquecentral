import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Ignorar errores de tipos de import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkxhndzbpapcyttwjltt.supabase.co';
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreGhuZHpicGFwY3l0dHdqbHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjYwOTUsImV4cCI6MjA4Njk0MjA5NX0.hRb3nf7Zz1Kn9jj9ka-i1WfQcN-hoT8VpdUl9NadQw4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type SupabaseClient = typeof supabase;
