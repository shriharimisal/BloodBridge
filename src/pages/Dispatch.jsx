import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowRight, ClipboardList, Droplet, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BLOOD_GROUPS } from '../data/mock.js'
import { dispatchCases, getPotentialMatchUnits } from '../data/operations.js'
import { Empty, PageHeader } from '../components/ui'

const steps = ['Received', 'Matching stock', 'Donor confirmed', 'Preparing dispatch', 'In transit', 'Delivered']
const urgencyClass = { Critical: 'bg-rose-100 text-rose-800', Urgent: 'bg-amber-100 text-amber-900', Normal: 'bg-slate-100 text-slate-700' }

export default function Dispatch() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All groups')
  const [urgency, setUrgency] = useState('All priorities')
  const [status, setStatus] = useState('All statuses')
  const priorities = ['All priorities', 'Critical', 'Urgent', 'Normal']
  const statuses = ['All statuses', ...new Set(dispatchCases.map((item) => item.status))]
  const activeCount = dispatchCases.filter((item) => item.step < 5).length
  const criticalCount = dispatchCases.filter((item) => item.urgency === 'Critical' && item.step < 5).length
  const filteredCases = useMemo(() => dispatchCases.filter((item) => {
    const searchable = `${item.id} ${item.patient} ${item.hospital} ${item.location}`.toLowerCase()
    return (!query || searchable.includes(query.toLowerCase()))
      && (group === 'All groups' || item.group === group)
      && (urgency === 'All priorities' || item.urgency === urgency)
      && (status === 'All statuses' || item.status === status)
  }), [query, group, urgency, status])

  return (
    <div className="page">
      <PageHeader title="Emergency dispatch">Urgent blood requirements, exact-group stock checks, and dispatch progress.</PageHeader>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"><Activity className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><p>Illustrative dispatch board · Statuses and patient cases are not connected to a live hospital system.</p></div>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Dispatch summary">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Active cases</p><p className="mt-2 text-2xl font-bold">{activeCount}</p></div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4"><p className="text-sm text-rose-700">Critical requirements</p><p className="mt-2 text-2xl font-bold text-rose-900">{criticalCount}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Cases shown</p><p className="mt-2 text-2xl font-bold">{filteredCases.length}</p></div>
      </section>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Filter emergency cases">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative text-xs font-medium text-slate-600 md:col-span-1"><span className="mb-1 block">Search cases</span><Search className="absolute left-3 top-8 h-4 w-4 text-slate-400" aria-hidden /><input className="input pl-9" placeholder="Case, hospital, location" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="text-xs font-medium text-slate-600">Blood group<select className="input mt-1" value={group} onChange={(event) => setGroup(event.target.value)}><option>All groups</option>{BLOOD_GROUPS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Priority<select className="input mt-1" value={urgency} onChange={(event) => setUrgency(event.target.value)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Status<select className="input mt-1" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </section>

      <section className="mt-5 space-y-4" aria-label="Emergency blood requests">
        {filteredCases.length === 0 && <Empty title="No requests match those filters" />}
        {filteredCases.map((item) => {
          const possibleUnits = getPotentialMatchUnits(item.group, item.component)
          const exactMatch = possibleUnits >= item.units
          return (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3"><span className={`mt-0.5 rounded-xl p-2 ${item.urgency === 'Critical' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}><Droplet className="h-5 w-5" aria-hidden /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{item.patient}</h2><span className="text-xs text-slate-500">{item.id}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyClass[item.urgency]}`}>{item.urgency}</span></div><p className="mt-1 text-sm font-medium text-slate-700">{item.units} units · {item.group} · {item.component}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" aria-hidden />{item.hospital} · {item.location}</p></div></div>
                <div className="text-left sm:text-right"><p className="text-xs text-slate-500">Required by</p><p className="font-semibold text-slate-800">{item.requiredBy}</p><p className="mt-1 text-xs text-slate-500">Status: {item.status}</p></div>
              </div>
              <div className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${exactMatch ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><p>{possibleUnits} exact {item.group} {item.component.toLowerCase()} units listed · {exactMatch ? 'quantity match found' : 'shortage against this request'}. Blood-bank staff must confirm compatibility and stock.</p></div>
              <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label={`Progress for ${item.id}`}>
                {steps.map((step, index) => <li key={step} className={`min-w-0 border-t-2 pt-2 text-[10px] sm:text-xs ${index <= item.step ? 'border-rose-500 font-semibold text-slate-800' : 'border-slate-200 text-slate-400'}`}><span className="block truncate">{step}</span></li>)}
              </ol>
            </article>
          )
        })}
      </section>
      <div className="mt-7 rounded-2xl bg-slate-900 p-5 text-white sm:flex sm:items-center sm:justify-between"><div><h2 className="font-semibold">Find stock for a request</h2><p className="mt-1 text-sm text-slate-300">Search the inventory by group, hospital, component, and expiry.</p></div><Link to="/inventory" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-200 hover:text-white sm:mt-0">Open inventory <ArrowRight className="h-4 w-4" aria-hidden /></Link></div>
    </div>
  )
}
