import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 * 
 * Creates and exports a configured Supabase client for database and auth operations.
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public API key
 * 
 * The anon key is safe to use in client-side code as it only allows
 * operations permitted by Row Level Security (RLS) policies.
 * 
 * Usage:
 * import { supabase } from './utils/supabaseClient'
 * 
 * // Query data
 * const { data, error } = await supabase.from('table').select('*')
 * 
 * // Auth operations
 * await supabase.auth.signIn({ email, password })
 */

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)