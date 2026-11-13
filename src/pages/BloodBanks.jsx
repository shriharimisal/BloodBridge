import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bloodBankService } from '../services/bloodBankService'
import { Empty, ErrorState, Loading, PageHeader, useAsync } from '../components/ui'

export default function BloodBanks() {
  const [q, setQ] = useState('')
  const { data, loading, error, reload } = useAsync(() => bloodBankService.search({}))
  const list = data?.filter((b) => `${b.name} ${b.area} ${b.city}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div className="page">
      <PageHeader title="Blood Banks">Find a blood bank near you.</PageHeader>
      <label htmlFor="q" className="label">Search by name or location</label>
      <input id="q" type="search" className="input max-w-md" value={q} onChange={(e) => setQ(e.target.value)} />
      <section className="mt-8" aria-live="polite">
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {list && (list.length === 0 ? <Empty title="No blood banks found" /> : (
          <ul>
            {list.map((b) => (
              <li key={b.id} className="row grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <Link to={`/blood-banks/${b.id}`} className="font-medium text-slate-900 hover:text-brand">{b.name}</Link>
                  <p className="text-sm text-slate-500">{b.area}, {b.city} · {b.distance} km · {b.hours}</p>
                </div>
                <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="text-sm font-medium text-brand">{b.phone}</a>
              </li>
            ))}
          </ul>
        ))}
      </section>
    </div>
  )
}
