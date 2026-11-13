import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BLOOD_GROUPS } from '../data/mock'
import { bloodBankService } from '../services/bloodBankService'
import { stockLevel } from '../services/bloodService'
import { BloodGroupSelect, Empty, ErrorState, Field, Loading, PageHeader, Tone, useAsync } from '../components/ui'

const initial = { group: '', location: '', radius: '', name: '', availability: '' }

export default function FindBlood() {
  const [form, setForm] = useState(initial)
  const [filters, setFilters] = useState(initial)
  const { data, loading, error, reload } = useAsync(() => bloodBankService.search(filters), [filters])
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="page">
      <PageHeader title="Find Blood">Search blood banks and hospitals by blood group and location.</PageHeader>
      <p className="mb-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Listings and stock figures are examples, not verified live supply. Call a blood bank before travelling.</p>
      <form onSubmit={(e) => { e.preventDefault(); setFilters(form) }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="group" label="Blood group"><BloodGroupSelect id="group" value={form.group} onChange={set('group')} groups={BLOOD_GROUPS} placeholder="Any" /></Field>
        <Field id="location" label="Location"><input id="location" className="input" value={form.location} onChange={set('location')} placeholder="Area or city" /></Field>
        <Field id="radius" label="Radius">
          <select id="radius" className="input" value={form.radius} onChange={set('radius')}>
            <option value="">Any distance</option>
            {[5, 10, 25, 50].map((r) => <option key={r} value={r}>Within {r} km</option>)}
          </select>
        </Field>
        <Field id="name" label="Hospital / blood bank"><input id="name" className="input" value={form.name} onChange={set('name')} placeholder="Name" /></Field>
        <Field id="availability" label="Availability">
          <select id="availability" className="input" value={form.availability} onChange={set('availability')}>
            <option value="">Any</option>
            <option>Available</option>
            <option>Low</option>
          </select>
        </Field>
        <div className="flex items-end gap-3">
          <button className="btn-primary flex-1">Search</button>
          <button type="button" className="btn-secondary" onClick={() => { setForm(initial); setFilters(initial) }}>Reset</button>
        </div>
      </form>

      <section className="mt-10" aria-live="polite">
        {loading && <Loading label="Searching…" />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && !loading && (data.length === 0 ? <Empty title="No results">Try a larger radius or fewer filters.</Empty> : (
          <>
            <p className="mb-2 text-sm text-slate-500">{data.length} result{data.length > 1 ? 's' : ''}</p>
            <ul>
              {data.map((b) => (
                <li key={b.id} className="row grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-slate-900">{b.name}</p>
                    <p className="text-sm text-slate-500">{b.area}, {b.city} · {b.distance} km · {b.hours}</p>
                    {filters.group && <p className="mt-1 text-sm">{filters.group}: <Tone value={stockLevel(b.stock[filters.group])} /> ({b.stock[filters.group]} unit{b.stock[filters.group] === 1 ? '' : 's'})</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/blood-banks/${b.id}`} className="btn-secondary">View Details</Link>
                    <Link to={`/request?bank=${encodeURIComponent(b.name)}${filters.group ? `&group=${encodeURIComponent(filters.group)}` : ''}`} className="btn-primary">Request Blood</Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ))}
      </section>
    </div>
  )
}
