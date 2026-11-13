import { delay } from './delay.js'
import { donorProfile } from '../data/mock.js'
import { readStorage, writeStorage } from './storage.js'
import { backendConfigured, googleAuthConfigured, requireSupabase } from './supabase.js'

const getAccounts = () => readStorage('accounts', [])
const hashPassword = async (password) => {
  const bytes = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const authService = {
  loginWithGoogle: async () => {
    if (!googleAuthConfigured) throw new Error('Google sign-in is not enabled yet. Configure the Google provider in Supabase first.')
    const client = requireSupabase()
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      // Keep the Supabase OAuth code on the URL query string. HashRouter owns the
      // fragment, so redirecting to /#/dashboard can hide the callback code.
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } },
    })
    if (error) throw error
  },
  login: async ({ email, password }) => {
    if (backendConfigured) {
      const { data, error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      return data.user
    }
    const account = getAccounts().find((item) => item.email === email.trim().toLowerCase())
    if (!account || account.passwordHash !== await hashPassword(password)) throw new Error('Email or password is incorrect.')
    const session = { name: account.name, email: account.email }
    if (!writeStorage('session', session)) throw new Error('Could not save this demo session.')
    return delay(session, 150)
  },
  register: async ({ name, email, password, group }) => {
    if (backendConfigured) {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name.trim(), blood_group: group } },
      })
      if (error) throw error
      return { user: data.user, needsEmailConfirmation: !data.session }
    }
    const accounts = getAccounts()
    const normalizedEmail = email.trim().toLowerCase()
    if (accounts.some((item) => item.email === normalizedEmail)) throw new Error('An account with this email already exists in this browser.')
    const account = { name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), group }
    if (!writeStorage('accounts', [...accounts, account])) throw new Error('Could not save this demo account.')
    const profile = { ...donorProfile, name: account.name, email: account.email, bloodGroup: group }
    if (!writeStorage('profile', profile) || !writeStorage('session', { name: account.name, email: account.email })) throw new Error('Could not save the demo profile.')
    return delay({ name: account.name, email: account.email }, 150)
  },
  getSession: () => readStorage('session', null),
  logout: async () => {
    if (backendConfigured) {
      const { error } = await requireSupabase().auth.signOut()
      if (error) throw error
      return
    }
    try { window.localStorage.removeItem('bloodbridge.demo.session') } catch { /* Browser storage may be unavailable. */ }
  },
}
