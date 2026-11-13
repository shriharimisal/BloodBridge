import { delay } from './delay'
import { donorProfile } from '../data/mock'
import { readStorage, writeStorage } from './storage'

// Browser-only demo authentication. Replace this service with a secure backend before production use.
const getAccounts = () => readStorage('accounts', [])
const hashPassword = async (password) => {
  const bytes = new TextEncoder().encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const authService = {
  login: async ({ email, password }) => {
    const account = getAccounts().find((item) => item.email === email.trim().toLowerCase())
    if (!account || account.passwordHash !== await hashPassword(password)) throw new Error('Email or password is incorrect.')
    const session = { name: account.name, email: account.email }
    if (!writeStorage('session', session)) throw new Error('Could not save this demo session.')
    return delay(session, 150)
  },
  register: async ({ name, email, password, group }) => {
    const accounts = getAccounts()
    const normalizedEmail = email.trim().toLowerCase()
    if (accounts.some((item) => item.email === normalizedEmail)) throw new Error('An account with this email already exists in this browser.')
    const account = { name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), group }
    if (!writeStorage('accounts', [...accounts, account])) throw new Error('Could not save this demo account.')
    const profile = { ...donorProfile, name: account.name, email: account.email, bloodGroup: group }
    if (!writeStorage('profile', profile) || !writeStorage('session', { name: account.name, email: account.email })) {
      throw new Error('Could not save the demo profile.')
    }
    return delay({ name: account.name, email: account.email }, 150)
  },
  getSession: () => readStorage('session', null),
  logout: () => {
    try { window.localStorage.removeItem('bloodbridge.demo.session') } catch { /* Browser storage may be unavailable. */ }
  },
}
