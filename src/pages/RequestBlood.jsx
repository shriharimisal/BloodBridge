import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BLOOD_GROUPS, URGENCY } from '../data/mock'
import { requestService } from '../services/requestService'
import { BloodGroupSelect, ErrorState, Field, PageHeader, Success } from '../components/ui'

const required = { patient: 'Enter the patient name.', group: 'Select a blood group.', units: 'Enter a whole number of units (1–10).', hospital: 'Enter the hospital.', location: 'Enter the location.', requiredBy: 'Select when blood is required.', contact: 'Enter a valid 10-digit phone number.' }

export default function RequestBlood() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({ patient: '', group: params.get('group') || '', units: '', hospital: params.get('bank') || '', location: '', requiredBy: '', urgency: 'Urgent', contact: '', info: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle' })
  const set = (k) => (e) => {
    const value = e.target.value
    setForm((current) => ({ ...current, [k]: value }))
    setErrors((current) => current[k] ? { ...current, [k]: undefined } : current)
  }

  const validate = () => {
    const e = {}
    Object.keys(required).forEach((k) => { if (!String(form[k]).trim()) e[k] = required[k] })
    if (form.units && (!Number.isInteger(Number(form.units)) || form.units < 1 || form.units > 10)) e.units = required.units
    if (form.requiredBy && (!Number.isFinite(new Date(form.requiredBy).getTime()) || new Date(form.requiredBy).getTime() <= Date.now())) e.requiredBy = 'Choose a valid future date and time.'
    if (form.contact && !/^\d{10}$/.test(form.contact.replace(/[\s-]/g, ''))) e.contact = required.contact
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setStatus({ state: 'loading' })
    try {
      const res = await requestService.create({
        patient: form.patient.trim(), group: form.group, units: Number(form.units), hospital: form.hospital.trim(),
        location: form.location.trim(), requiredBy: form.requiredBy, urgency: form.urgency,
        contact: form.contact.replace(/[\s-]/g, ''), info: form.info.trim(),
      })
      setStatus({ state: 'done', res })
    } catch { setStatus({ state: 'error' }) }
  }

  if (status.state === 'done') {
    return (
      <div className="page max-w-2xl">
        <Success>Your request has been submitted.</Success>
        <h1 className="mt-6 text-2xl font-semibold">Request {status.res.reference}</h1>
        <p className="mt-2 text-slate-600">Status: <strong>{status.res.status}</strong>. Donors and blood banks can now see your request.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/requests" className="btn-primary">View requests</Link>
          <Link to="/find-blood" className="btn-secondary">Find blood</Link>
        </div>
      </div>
    )
  }

  const f = (id, label, props = {}) => (
    <Field id={id} label={label} error={errors[id]}>
      <input id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-error` : undefined} {...props} />
    </Field>
  )

  return (
    <div className="page max-w-2xl">
      <PageHeader title="Request Blood">Fill in the details so donors and blood banks can respond quickly.</PageHeader>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">{f('patient', 'Patient name', { autoComplete: 'off' })}</div>
        <Field id="group" label="Blood group" error={errors.group}><BloodGroupSelect id="group" value={form.group} onChange={set('group')} groups={BLOOD_GROUPS} aria-invalid={!!errors.group} /></Field>
        {f('units', 'Units required', { type: 'number', min: 1, max: 10, inputMode: 'numeric' })}
        {f('hospital', 'Hospital')}
        {f('location', 'Location', { placeholder: 'Area, city' })}
        {f('requiredBy', 'Required by', { type: 'datetime-local' })}
        <Field id="urgency" label="Urgency">
          <select id="urgency" className="input" value={form.urgency} onChange={set('urgency')}>{URGENCY.map((u) => <option key={u}>{u}</option>)}</select>
        </Field>
        <div className="sm:col-span-2">{f('contact', 'Contact number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' })}</div>
        <div className="sm:col-span-2">
          <Field id="info" label="Additional information (optional)">
            <textarea id="info" rows={3} className="input" value={form.info} onChange={set('info')} />
          </Field>
        </div>
        {status.state === 'error' && <div className="sm:col-span-2"><ErrorState message="We could not submit your request." /></div>}
        <div className="sm:col-span-2"><button className="btn-primary w-full sm:w-auto" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Submitting…' : 'Submit request'}</button></div>
      </form>
    </div>
  )
}
