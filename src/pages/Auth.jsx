import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BLOOD_GROUPS } from '../data/mock'
import { authService } from '../services/authService'
import { backendConfigured, googleAuthConfigured } from '../services/supabase'
import { useAuth } from '../auth/AuthContext'
import { BloodGroupSelect, ErrorState, Field, Success } from '../components/ui'

export default function Auth({ mode }) {
  const isRegister = mode === 'register'
  const nav = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', group: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const set = (k) => (e) => setForm((old) => ({ ...old, [k]: e.target.value }))

  const submit = async (ev) => {
    ev.preventDefault()
    const nextErrors = {}
    if (isRegister && !form.name.trim()) nextErrors.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    if (isRegister && !form.group) nextErrors.group = 'Select your blood group.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setBusy(true); setErrorMessage(''); setSuccessMessage('')
    try {
      const result = isRegister
        ? await authService.register(form)
        : await authService.login({ email: form.email, password: form.password })
      if (isRegister && result?.needsEmailConfirmation) {
        setSuccessMessage('Your account was created. Check your email to confirm it, then log in.')
        return
      }
      await refresh()
      nav(location.state?.from || '/', { replace: true })
    } catch (error) {
      setErrorMessage(error?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const signInGoogle = async () => {
    setBusy(true); setErrorMessage(''); setSuccessMessage('')
    try { await authService.loginWithGoogle() }
    catch (error) { setErrorMessage(error?.message || 'Google sign-in is not configured yet.'); setBusy(false) }
  }

  const input = (id, label, props) => (
    <Field id={id} label={label} error={errors[id]}>
      <input id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-error` : undefined} {...props} />
    </Field>
  )

  return (
    <div className="page max-w-md">
      <h1 className="text-2xl font-semibold">{isRegister ? 'Create your account' : 'Log in'}</h1>
      {!backendConfigured && <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Preview mode: accounts and changes stay in this browser. Google sign-in and shared accounts will work after the backend is connected.</p>}
      {backendConfigured && <p className="mt-3 text-sm text-slate-600">{googleAuthConfigured ? 'Use your Google account or your confirmed email address.' : 'Email sign-in is ready. Google sign-in will appear after the Google provider is configured.'}</p>}
      <button type="button" className="btn-secondary mt-5 w-full" onClick={signInGoogle} disabled={busy || !backendConfigured || !googleAuthConfigured}>
        {busy ? 'Please wait…' : 'Continue with Google'}
      </button>
      {!googleAuthConfigured && <p className="mt-2 text-xs text-slate-500">Google sign-in is unavailable until the Google provider is configured and enabled for this deployment.</p>}
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />or use email<span className="h-px flex-1 bg-slate-200" /></div>
      {successMessage && <div className="mb-4"><Success>{successMessage}</Success></div>}
      {errorMessage && <div className="mb-4"><ErrorState message={errorMessage} /></div>}
      <form onSubmit={submit} noValidate className="space-y-5">
        {isRegister && input('name', 'Full name', { autoComplete: 'name' })}
        {input('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {input('password', 'Password', { type: 'password', autoComplete: isRegister ? 'new-password' : 'current-password' })}
        {isRegister && <Field id="group" label="Blood group" error={errors.group}><BloodGroupSelect id="group" value={form.group} onChange={set('group')} groups={BLOOD_GROUPS} /></Field>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        {isRegister ? 'Already have an account?' : 'New to BloodBridge?'}{' '}
        <Link to={isRegister ? '/login' : '/register'} className="font-medium text-brand underline">{isRegister ? 'Log in' : 'Create an account'}</Link>
      </p>
    </div>
  )
}
