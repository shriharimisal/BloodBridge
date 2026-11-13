import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestId = useRef(0)
  useEffect(() => () => { requestId.current += 1 }, [])
  const run = useCallback(() => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve()
      .then(fn)
      .then((data) => { if (id === requestId.current) setState({ data, loading: false, error: null }) })
      .catch(() => { if (id === requestId.current) setState({ data: null, loading: false, error: 'Something went wrong. Please try again.' }) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(run, [run])
  return { ...state, reload: run }
}

export const Loading = ({ label = 'Loading…' }) => (
  <p role="status" className="flex items-center gap-2 py-10 text-sm text-slate-500">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {label}
  </p>
)

export const Empty = ({ title, children }) => (
  <div className="rounded-md border border-dashed border-slate-300 px-4 py-10 text-center">
    <p className="font-medium text-slate-900">{title}</p>
    {children && <p className="mt-1 text-sm text-slate-500">{children}</p>}
  </div>
)

export const ErrorState = ({ message, onRetry }) => (
  <div role="alert" className="rounded-md border border-red-200 bg-brand-soft px-4 py-4 text-sm text-red-900">
    {message} {onRetry && <button onClick={onRetry} className="ml-1 font-medium underline">Retry</button>}
  </div>
)

export const Success = ({ children }) => (
  <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{children}</p>
)

export const Field = ({ id, label, error, hint, children }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
  </div>
)

export const PageHeader = ({ title, children }) => (
  <header className="mb-8">
    <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
    {children && <p className="mt-2 max-w-2xl text-slate-600">{children}</p>}
  </header>
)

export const BloodGroupSelect = ({ id, value, onChange, groups, placeholder = 'Select', ...rest }) => (
  <select id={id} className="input" value={value} onChange={onChange} {...rest}>
    <option value="">{placeholder}</option>
    {groups.map((g) => <option key={g}>{g}</option>)}
  </select>
)

const tone = { Critical: 'text-red-700', Urgent: 'text-amber-700', Normal: 'text-slate-600', Available: 'text-emerald-700', Low: 'text-amber-700', Unavailable: 'text-slate-400' }
export const Tone = ({ value }) => <span className={`font-medium ${tone[value] || ''}`}>{value}</span>

export function RequestRow({ r }) {
  return (
    <li className="row grid gap-1 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-4">
      <p className="text-xl font-semibold text-brand">{r.group}</p>
      <div>
        <p className="font-medium text-slate-900">{r.units} unit{r.units > 1 ? 's' : ''} · {r.hospital}</p>
        <p className="text-sm text-slate-500">{r.location} · Needed by {r.requiredBy}</p>
      </div>
      <p className="text-sm"><Tone value={r.urgency} /> <span className="text-slate-400">·</span> <span className="text-slate-600">{r.status}</span></p>
    </li>
  )
}
