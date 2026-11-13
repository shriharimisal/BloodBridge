import { Link } from 'react-router-dom'
import { donorService } from '../services/donorService'
import { requestService } from '../services/requestService'
import { notificationService } from '../services/notificationService'
import { Empty, ErrorState, Loading, PageHeader, RequestRow, useAsync } from '../components/ui'

export default function Dashboard() {
  const p = useAsync(donorService.getProfile)
  const r = useAsync(() => requestService.list({ status: 'Open' }))
  const n = useAsync(notificationService.list)
  const unread = n.data?.filter((x) => !x.read) || []
  return (
    <div className="page">
      <PageHeader title="Dashboard" />
      {p.loading && <Loading />}
      {p.error && <ErrorState message={p.error} onRetry={p.reload} />}
      {p.data && (
        <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          {[['Blood group', p.data.bloodGroup], ['Donor status', p.data.status], ['Last donation', p.data.lastDonation], ['Donations', p.data.donationCount]].map(([k, v]) => (
            <div key={k} className="border-t border-slate-200 py-3"><dt className="text-sm text-slate-500">{k}</dt><dd className="mt-1 text-lg font-semibold">{v}</dd></div>
          ))}
        </dl>
      )}
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="ar">
          <div className="flex items-baseline justify-between"><h2 id="ar" className="text-lg font-semibold">Active requests</h2><Link to="/requests" className="text-sm font-medium text-brand">View all</Link></div>
          {r.loading && <Loading />}
          {r.error && <ErrorState message={r.error} onRetry={r.reload} />}
          {r.data && (r.data.length === 0 ? <Empty title="No active requests" /> : <ul>{r.data.slice(0, 3).map((x) => <RequestRow key={x.id} r={x} />)}</ul>)}
        </section>
        <section aria-labelledby="nt">
          <div className="flex items-baseline justify-between"><h2 id="nt" className="text-lg font-semibold">Important notifications</h2><Link to="/notifications" className="text-sm font-medium text-brand">View all</Link></div>
          {n.loading && <Loading />}
          {n.error && <ErrorState message={n.error} onRetry={n.reload} />}
          {n.data && (unread.length === 0 ? <Empty title="You're all caught up" /> : (
            <ul>{unread.map((x) => <li key={x.id} className="row"><p className="text-sm text-slate-900">{x.text}</p><p className="text-xs text-slate-500">{x.type} · {x.time}</p></li>)}</ul>
          ))}
        </section>
      </div>
      <nav aria-label="Account" className="mt-12 flex gap-6 border-t border-slate-200 pt-6 text-sm font-medium text-brand">
        <Link to="/history">Donation history</Link><Link to="/settings">Profile &amp; settings</Link>
      </nav>
    </div>
  )
}
