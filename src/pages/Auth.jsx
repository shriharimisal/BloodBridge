import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BLOOD_GROUPS } from '../data/mock'
import { authService } from '../services/authService'
import { BloodGroupSelect, ErrorState, Field } from '../components/ui'

export default function Auth({ mode }) {
  const isRegister = mode === 'register'
  const nav = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', group: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (isRegister && !form.name.trim()) e.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (isRegister && !form.group) e.group = 'Select your blood group.'
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true); setFailed(false)
    try {
      await (isRegister ? authService.register(form) : authService.login({ email: form.email, password: form.password }))
      nav(location.state?.from || '/dashboard', { replace: true })
    } catch { setFailed(true); setBusy(false) }
  }

  const input = (id, label, props) => (
    <Field id={id} label={label} error={errors[id]}>
      <input id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-error` : undefined} {...props} />
    </Field>
  )

  return (
    <div className="page max-w-md">
      <h1 className="text-2xl font-semibold">{isRegister ? 'Create your account' : 'Log in'}</h1>
      <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Demo accounts are stored only in this browser. This sign-in is for preview use and is not secure production authentication.</p>
      <form onSubmit={submit} noValidate className="space-y-5">
        {isRegister && input('name', 'Full name', { autoComplete: 'name' })}
        {input('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {input('password', 'Password', { type: 'password', autoComplete: isRegister ? 'new-password' : 'current-password' })}
        {isRegister && (
          <Field id="group" label="Blood group" error={errors.group}><BloodGroupSelect id="group" value={form.group} onChange={set('group')} groups={BLOOD_GROUPS} /></Field>
        )}
        {failed && <ErrorState message="Something went wrong. Please try again." />}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        {isRegister ? 'Already have an account?' : 'New to BloodBridge?'}{' '}
        <Link to={isRegister ? '/login' : '/register'} className="font-medium text-brand underline">{isRegister ? 'Log in' : 'Create an account'}</Link>
      </p>
    </div>
  )
}
