import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { backendConfigured, supabase } from '../services/supabase'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => backendConfigured ? null : authService.getSession())
  const [loading, setLoading] = useState(backendConfigured)

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: sessionData, error }) => {
      if (!active) return
      setSession(error ? null : sessionData.session)
      setLoading(false)
    }).catch(() => {
      if (active) { setSession(null); setLoading(false) }
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    loading,
    refresh: async () => {
      if (!supabase) { setSession(authService.getSession()); return }
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    },
    signOut: async () => {
      await authService.logout()
      setSession(null)
    },
  }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider.')
  return value
}
