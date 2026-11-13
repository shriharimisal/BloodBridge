import { Link } from 'react-router-dom'
import { Activity, Bell, Droplet, HeartPulse, MapPin, TrendingUp } from 'lucide-react'
import { BLOOD_GROUPS } from '../data/mock'
import { bloodBankService } from '../services/bloodBankService'
import { bloodService } from '../services/bloodService'
import { donorService } from '../services/donorService'
import { requestService } from '../services/requestService'
import { notificationService } from '../services/notificationService'
import { Empty, ErrorState, Loading, RequestRow, useAsync } from '../components/ui'

function MetricCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2 ${color}`}><Icon className="h-5 w-5" aria-hidden /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

function BarChart({ title, subtitle, rows, valueLabel, color = 'bg-gradient-to-r from-rose-500 to-red-600' }) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-xl bg-rose-50 p-2 text-rose-700"><TrendingUp className="h-5 w-5" aria-hidden /></span>
      </div>
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[2.75rem_minmax(0,1fr)_3.5rem] items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{row.label}</span>
            <div
              className="h-3 overflow-hidden rounded-full bg-slate-100"
              role="meter"
              aria-label={row.label + ' ' + valueLabel}
              aria-valuemin="0"
              aria-valuemax={max}
              aria-valuenow={row.value}
            >
              <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: row.value ? Math.max(3, (row.value / max) * 100) + '%' : '0%' }} />
            </div>
            <span className="text-right text-sm tabular-nums text-slate-600">{row.value} <span className="text-xs">{valueLabel}</span></span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>0 {valueLabel}</span><span>{max} {valueLabel} · highest group</span>
      </div>
    </section>
  )
}

export default function Dashboard() {
  const profile = useAsync(donorService.getProfile)
  const requests = useAsync(() => requestService.list({ status: 'Open' }))
  const notifications = useAsync(notificationService.list)
  const inventory = useAsync(bloodService.getAvailability)
  const banks = useAsync(() => bloodBankService.search())

  const openRequests = requests.data || []
  const unread = notifications.data?.filter((item) => !item.read) || []
  const inventoryRows = BLOOD_GROUPS.map((group) => ({
    label: group,
    value: inventory.data?.find((item) => item.group === group)?.units || 0,
  }))
  const demandRows = BLOOD_GROUPS.map((group) => ({
    label: group,
    value: openRequests.filter((request) => request.group === group).reduce((sum, request) => sum + Number(request.units || 0), 0),
  }))
  const totalUnits = inventoryRows.reduce((sum, item) => sum + item.value, 0)
  const firstName = profile.data?.name?.trim().split(/\s+/)[0]

  return (
    <div className="page">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 via-red-700 to-rose-600 px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-100">BloodBridge · Donor dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{firstName ? 'Welcome back, ' + firstName : 'Welcome to your dashboard'}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-rose-50 sm:text-base">See blood availability, current demand, and your donor activity in one place.</p>
          </div>
          <Link to="/blood-banks" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 shadow-sm transition hover:bg-rose-50">
            <MapPin className="h-4 w-4" aria-hidden /> Find a blood bank
          </Link>
        </div>
      </section>

      <section aria-label="BloodBridge overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Droplet} label="Units available" value={inventory.loading ? '…' : totalUnits} detail="Across listed blood groups" color="bg-rose-50 text-rose-700" />
        <MetricCard icon={MapPin} label="Blood bank locations" value={banks.loading ? '…' : banks.data?.length ?? '—'} detail="Locations in the directory" color="bg-sky-50 text-sky-700" />
        <MetricCard icon={Activity} label="Open requests" value={requests.loading ? '…' : openRequests.length} detail="People currently waiting" color="bg-amber-50 text-amber-700" />
        <MetricCard icon={HeartPulse} label="Your donations" value={profile.loading ? '…' : profile.data?.donationCount ?? 0} detail={profile.data?.status ? 'Donor status: ' + profile.data.status : 'Lifetime donation count'} color="bg-emerald-50 text-emerald-700" />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Blood supply and demand charts">
        {inventory.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading blood availability…" /></div>}
        {inventory.error && <ErrorState message={inventory.error} onRetry={inventory.reload} />}
        {inventory.data && <BarChart title="Blood availability" subtitle="Units listed across blood bank locations" rows={inventoryRows} valueLabel="units" />}
        {requests.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading request demand…" /></div>}
        {requests.error && <ErrorState message={requests.error} onRetry={requests.reload} />}
        {requests.data && <BarChart title="Open demand by blood group" subtitle="Units requested in open cases" rows={demandRows} valueLabel="units" color="bg-gradient-to-r from-amber-400 to-orange-500" />}
      </section>

      {(inventory.data || banks.data) && (
        <p className="mt-3 text-xs text-slate-500">Inventory is based on the directory records shown above. Call the blood bank to confirm current stock before traveling.</p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="active-requests">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="active-requests" className="text-lg font-semibold">Active requests</h2>
            <Link to="/requests" className="text-sm font-medium text-brand">View all</Link>
          </div>
          {requests.loading && <Loading />}
          {requests.error && <ErrorState message={requests.error} onRetry={requests.reload} />}
          {requests.data && (openRequests.length === 0 ? <Empty title="No active requests" /> : <ul>{openRequests.slice(0, 3).map((item) => <RequestRow key={item.id} r={item} />)}</ul>)}
        </section>
        <section aria-labelledby="important-notifications">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="important-notifications" className="text-lg font-semibold">Important notifications</h2>
            <Link to="/notifications" className="text-sm font-medium text-brand">View all</Link>
          </div>
          {notifications.loading && <Loading />}
          {notifications.error && <ErrorState message={notifications.error} onRetry={notifications.reload} />}
          {notifications.data && (unread.length === 0 ? <Empty title="You're all caught up" /> : (
            <ul>{unread.slice(0, 4).map((item) => <li key={item.id} className="row"><p className="text-sm text-slate-900">{item.text}</p><p className="text-xs text-slate-500">{item.type} · {item.time}</p></li>)}</ul>
          ))}
        </section>
      </div>

      <nav aria-label="Account" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-sm font-medium text-brand">
        <Link to="/history">Donation history</Link>
        <Link to="/settings">Profile &amp; settings</Link>
      </nav>
    </div>
  )
}
