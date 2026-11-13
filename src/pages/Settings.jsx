import { useEffect, useState } from 'react'
import { BLOOD_GROUPS } from '../data/mock'
import { donorService } from '../services/donorService'
import { BloodGroupSelect, ErrorState, Field, PageHeader, Success } from '../components/ui'

export default function Settings() {
  const [form, setForm] = useState({ name: '', phone: '', city: '', group: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setStatus('idle') }

  useEffect(() => {
    donorService.getProfile()
      .then((profile) => setForm({ name: profile.name || '', phone: profile.phone || '', city: profile.city || '', group: profile.group || profile.bloodGroup || '' }))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  const submit = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!form.name.trim()) e.name = 'Enter your name.'
    if (!/^\d{10}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid 10-digit phone number.'
    if (!form.city.trim()) e.city = 'Enter your city.'
    if (!form.group) e.group = 'Select your blood group.'
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus('saving')
    try { await donorService.saveProfile(form); setStatus('saved') } catch { setStatus('error') }
  }

  const input = (id, label, props) => (
    <Field id={id} label={label} error={errors[id]}>
      <input id={id} className="input" value={form[id]} onChange={set(id)} disabled={loading || status === 'saving'} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-error` : undefined} {...props} />
    </Field>
  )
  return (
    <div className="page max-w-xl">
      <PageHeader title="Profile & Settings" />
      {loading && <p role="status" className="mb-4 text-sm text-slate-500">Loading your profile…</p>}
      {loadError && <ErrorState message="Could not load your profile." />}
      <form onSubmit={submit} noValidate className="space-y-5">
        {input('name', 'Full name', { autoComplete: 'name' })}
        {input('phone', 'Phone', { type: 'tel', autoComplete: 'tel' })}
        {input('city', 'City', { autoComplete: 'address-level2' })}
        <Field id="group" label="Blood group" error={errors.group}><BloodGroupSelect id="group" value={form.group} onChange={set('group')} groups={BLOOD_GROUPS} disabled={loading || status === 'saving'} /></Field>
        {status === 'saved' && <Success>Your profile has been saved.</Success>}
        {status === 'error' && <ErrorState message="We could not save your profile." />}
        <button className="btn-primary" disabled={status === 'saving' || loading}>{status === 'saving' ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}
