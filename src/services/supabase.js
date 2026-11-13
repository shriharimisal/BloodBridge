import { createClient } from '@supabase/supabase-js'

const environment = import.meta.env || {}
const supabaseUrl = environment.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = environment.VITE_SUPABASE_ANON_KEY?.trim()
export const googleAuthConfigured = environment.VITE_GOOGLE_OAUTH_ENABLED === 'true'

export const backendConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = backendConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) throw new Error('The shared backend is not configured yet. Add the Supabase URL and public key to the Vercel project.')
  return supabase
}

export function normalizeError(error) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
