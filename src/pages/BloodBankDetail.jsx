import { Link, useParams } from 'react-router-dom'
import { bloodBankService } from '../services/bloodBankService'
import { stockLevel } from '../services/bloodService'
import { Empty, ErrorState, Loading, Tone, useAsync } from '../components/ui'

export default function BloodBankDetail() {
  const { id } = useParams()
  const { data: b, loading, error, reload } = useAsync(() => bloodBankService.getById(id), [id])
  return (
    <div className="page">
      <Link to="/blood-banks" className="text-sm text-slate-500 hover:text-brand">← All blood banks</Link>
      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && !b && <div className="mt-6"><Empty title="Blood bank not found" /></div>}
      {b && (
        <>
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Example listing. Contact details and stock are not verified; call the blood bank to confirm.</p>
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{b.name}</h1>
          <dl className="mt-4 grid gap-x-8 text-sm sm:grid-cols-2">
            {[['Address', b.address], ['Distance', `${b.distance} km`], ['Hours', b.hours], ['Phone', b.phone]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-slate-200 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{k === 'Phone' ? <a className="text-brand" href={`tel:${v.replace(/\s/g, '')}`}>{v}</a> : v}</dd></div>
            ))}
          </dl>
          <h2 className="mt-10 text-lg font-semibold">Blood availability</h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
            {Object.entries(b.stock).map(([g, n]) => (
              <li key={g} className="border-t border-slate-200 py-3">
                <p className="text-xl font-semibold">{g}</p>
                <p className="text-sm"><Tone value={stockLevel(n)} /> <span className="text-slate-500">· {n} unit{n === 1 ? '' : 's'}</span></p>
              </li>
            ))}
          </ul>
          <Link to={`/request?bank=${encodeURIComponent(b.name)}`} className="btn-primary mt-8">Request Blood</Link>
        </>
      )}
    </div>
  )
}
