import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BLOOD_GROUPS, URGENCY } from '../data/mock'
import { requestService } from '../services/requestService'
import { BloodGroupSelect, Empty, ErrorState, Field, Loading, PageHeader, RequestRow, useAsync } from '../components/ui'

export default function Requests() {
  const [f, setF] = useState({ group: '', urgency: '', status: '' })
  const { data, loading, error, reload } = useAsync(() => requestService.list(f), [f])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <div className="page">
      <PageHeader title="Emergency Requests">People currently looking for blood.</PageHeader>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field id="fg" label="Blood group"><BloodGroupSelect id="fg" value={f.group} onChange={set('group')} groups={BLOOD_GROUPS} placeholder="All" /></Field>
        <Field id="fu" label="Urgency"><BloodGroupSelect id="fu" value={f.urgency} onChange={set('urgency')} groups={URGENCY} placeholder="All" /></Field>
        <Field id="fs" label="Status"><BloodGroupSelect id="fs" value={f.status} onChange={set('status')} groups={['Open', 'In progress', 'Fulfilled']} placeholder="All" /></Field>
        <div className="flex items-end"><Link to="/request" className="btn-primary w-full">New request</Link></div>
      </div>
      <section className="mt-8" aria-live="polite">
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {data && !loading && (data.length === 0 ? <Empty title="No requests found">Try changing the filters.</Empty> : <ul>{data.map((r) => <RequestRow key={r.id} r={r} />)}</ul>)}
      </section>
    </div>
  )
}
