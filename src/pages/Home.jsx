import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Droplet, HeartPulse, MapPin, Users } from 'lucide-react'
import { BLOOD_GROUPS } from '../data/mock'
import { useAuth } from '../auth/AuthContext'
import { bloodBankService } from '../services/bloodBankService'
import { bloodService } from '../services/bloodService'
import { dashboardStatsService } from '../services/dashboardStatsService'
import { donorService } from '../services/donorService'
import { inventoryService } from '../services/inventoryService'
import { requestService } from '../services/requestService'
import { Empty, ErrorState, Loading, RequestRow, useAsync } from '../components/ui'

const levelColor = { Available: 'bg-emerald-500', Low: 'bg-amber-400', Unavailable: 'bg-slate-300' }

function MetricCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={'rounded-xl p-2 ' + color}><Icon className="h-5 w-5" aria-hidden /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

function Panel({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function AvailabilityChart({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.units))
  return (
    <Panel title="Blood availability" subtitle="Listed units by blood group" action={<Droplet className="h-5 w-5 text-rose-600" aria-hidden />}>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600" aria-label="Availability legend">
        {Object.entries(levelColor).map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5"><span className={'h-2.5 w-2.5 rounded-full ' + color} />{label}</span>)}
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.group} className="grid grid-cols-[2.75rem_minmax(0,1fr)_5.5rem] items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{row.group}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={row.group + ' blood units'} aria-valuemin="0" aria-valuemax={max} aria-valuenow={row.units}>
              <div className={'h-full rounded-full transition-all duration-500 ' + levelColor[row.level]} style={{ width: row.units ? Math.max(3, row.units / max * 100) + '%' : '0%' }} />
            </div>
            <span className="text-right text-xs text-slate-600">{row.units} · {row.level}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-400"><span>0 units</span><span>{max} units · highest group</span></div>
    </Panel>
  )
}

function BarChart({ title, subtitle, rows, valueLabel, color = 'bg-gradient-to-r from-rose-500 to-red-600', action }) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  return (
    <Panel title={title} subtitle={subtitle} action={action}>
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[2.75rem_minmax(0,1fr)_3.5rem] items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{row.label}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={row.label + ' ' + valueLabel} aria-valuemin="0" aria-valuemax={max} aria-valuenow={row.value}>
              <div className={'h-full rounded-full transition-all duration-500 ' + color} style={{ width: row.value ? Math.max(3, row.value / max * 100) + '%' : '0%' }} />
            </div>
            <span className="text-right text-sm tabular-nums text-slate-600">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-400"><span>0 {valueLabel}</span><span>{max} {valueLabel} · highest group</span></div>
      {rows.every((row) => row.value === 0) && <p className="mt-3 text-sm text-slate-500">No {valueLabel} are recorded in this period.</p>}
    </Panel>
  )
}

function ExpiryChart({ summary }) {
  if (!summary.hasTrackedBatches) {
    return (
      <Panel title="Expiry tracking" subtitle="Tracked blood batches by group" action={<AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />}>
        <div className="mt-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-950">No dated inventory batches have been entered yet.</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">{summary.untrackedUnits} listed units have no expiry dates, so they cannot be classified as expiring or expired. They are shown separately from dated inventory.</p>
        </div>
      </Panel>
    )
  }
  const max = Math.max(1, ...summary.groups.map((row) => row.expiringUnits + row.expiredUnits))
  return (
    <Panel title="Expiry tracking" subtitle="Units expiring in 7 days or already expired" action={<AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />}>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Expiring soon</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-600" />Expired</span>
      </div>
      <div className="mt-5 space-y-3">
        {summary.groups.map((row) => (
          <div key={row.group} className="grid grid-cols-[2.75rem_minmax(0,1fr)_5rem] items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{row.group}</span>
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-label={row.group + ': ' + row.expiringUnits + ' expiring soon, ' + row.expiredUnits + ' expired'}>
              <span className="h-full bg-amber-400" style={{ width: row.expiringUnits ? row.expiringUnits / max * 100 + '%' : '0%' }} />
              <span className="h-full bg-rose-600" style={{ width: row.expiredUnits ? row.expiredUnits / max * 100 + '%' : '0%' }} />
            </div>
            <span className="text-right text-xs text-slate-600">{row.expiringUnits + row.expiredUnits} units</span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{summary.untrackedUnits} additional legacy units still have no recorded expiry date.</p>
    </Panel>
  )
}

export default function Home() {
  const { session } = useAuth()
  const inventory = useAsync(bloodService.getAvailability)
  const expiry = useAsync(inventoryService.getExpirySummary)
  const requests = useAsync(() => requestService.list({ status: 'Open' }))
  const banks = useAsync(() => bloodBankService.search())
  const donationStats = useAsync(dashboardStatsService.getDonationStats)
  const profile = useAsync(() => session ? donorService.getProfile() : Promise.resolve(null), [session])

  const inventoryRows = BLOOD_GROUPS.map((group) => inventory.data?.find((row) => row.group === group) || { group, units: 0, level: 'Unavailable' })
  const openRequests = requests.data || []
  const demandRows = BLOOD_GROUPS.map((group) => ({
    label: group,
    value: openRequests.filter((request) => request.group === group).reduce((sum, request) => sum + Number(request.units || 0), 0),
  }))
  const monthlyRows = (donationStats.data?.months || []).map((month) => ({
    label: new Date(month.month + '-01T00:00:00').toLocaleString(undefined, { month: 'short' }),
    value: Number(month.donations || 0),
  }))
  const totalUnits = inventoryRows.reduce((sum, row) => sum + row.units, 0)
  const criticalCount = openRequests.filter((request) => request.urgency === 'Critical').length
  const priorityRequests = [...openRequests].sort((a, b) => ({ Critical: 0, Urgent: 1, Normal: 2 }[a.urgency] - { Critical: 0, Urgent: 1, Normal: 2 }[b.urgency])).slice(0, 3)

  return (
    <div className="page">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 via-red-700 to-rose-600 px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-100">BloodBridge · Community overview</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{profile.data?.name ? 'Welcome back, ' + profile.data.name.split(/\s+/)[0] : 'Every drop can save a life.'}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-50 sm:text-base">Find blood, become a donor, and see current community needs from one simple page.</p>
      </section>

      <section aria-label="BloodBridge overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Droplet} label="Available units" value={inventory.loading ? '…' : totalUnits} detail="Across all listed blood groups" color="bg-rose-50 text-rose-700" />
        <MetricCard icon={MapPin} label="Blood bank locations" value={banks.loading ? '…' : banks.data?.length ?? '—'} detail="Locations in the directory" color="bg-sky-50 text-sky-700" />
        <MetricCard icon={AlertTriangle} label="Critical requests" value={requests.loading ? '…' : criticalCount} detail={requests.data?.length ? 'Of ' + requests.data.length + ' open requests' : 'No open requests'} color="bg-amber-50 text-amber-700" />
        <MetricCard icon={Users} label="Community donations" value={donationStats.loading ? '…' : donationStats.data?.totalDonations ?? '—'} detail={donationStats.data ? donationStats.data.totalUnits + ' units · self-reported' : 'Privacy-safe total'} color="bg-emerald-50 text-emerald-700" />
      </section>

      {session && profile.data && (
        <section className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:flex sm:items-center sm:justify-between" aria-label="Your donor summary">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-2 text-rose-700"><HeartPulse className="h-5 w-5" aria-hidden /></span><div><p className="font-semibold text-slate-900">Your donor summary</p><p className="text-sm text-slate-600">{profile.data.bloodGroup || 'Blood group not set'} · {profile.data.status}</p></div></div>
          <p className="mt-3 text-sm text-slate-700 sm:mt-0"><strong>{profile.data.donationCount}</strong> personal donations · <Link to="/donate" className="font-medium text-brand underline">Manage donor profile</Link></p>
        </section>
      )}

      <section className="mt-7 grid gap-5 lg:grid-cols-2" aria-label="Availability, demand, donations and expiry charts">
        {inventory.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading blood availability…" /></div>}
        {inventory.error && <ErrorState message={inventory.error} onRetry={inventory.reload} />}
        {inventory.data && <AvailabilityChart rows={inventoryRows} />}

        {requests.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading open requests…" /></div>}
        {requests.error && <ErrorState message={requests.error} onRetry={requests.reload} />}
        {requests.data && <BarChart title="Open demand by blood group" subtitle="Units requested in open cases" rows={demandRows} valueLabel="units" color="bg-gradient-to-r from-amber-400 to-orange-500" action={<Activity className="h-5 w-5 text-orange-600" aria-hidden />} />}

        {expiry.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading expiry information…" /></div>}
        {expiry.error && <ErrorState message={expiry.error} onRetry={expiry.reload} />}
        {expiry.data && <ExpiryChart summary={expiry.data} />}

        {donationStats.loading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><Loading label="Loading donation totals…" /></div>}
        {donationStats.error && <ErrorState message={donationStats.error} onRetry={donationStats.reload} />}
        {donationStats.data && <BarChart title="Donations over time" subtitle="Self-reported community donations in the last 6 months" rows={monthlyRows} valueLabel="donations" color="bg-gradient-to-r from-emerald-400 to-teal-600" action={<HeartPulse className="h-5 w-5 text-emerald-700" aria-hidden />} />}
      </section>

      <p className="mt-4 text-xs leading-5 text-slate-500">Blood bank totals may not include expiry dates until batches are recorded. Call a blood bank to confirm current stock before traveling.</p>

      <section className="mt-10" aria-labelledby="priority-requests">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div><h2 id="priority-requests" className="text-xl font-semibold">Priority requests</h2><p className="mt-1 text-sm text-slate-500">Critical and urgent blood requests that need attention.</p></div>
          <Link to="/requests" className="text-sm font-semibold text-brand">View all requests</Link>
        </div>
        {requests.loading && <Loading />}
        {requests.error && <ErrorState message={requests.error} onRetry={requests.reload} />}
        {requests.data && (priorityRequests.length === 0 ? <div className="mt-4"><Empty title="No open requests right now" /></div> : <ul className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">{priorityRequests.map((request) => <RequestRow key={request.id} r={request} />)}</ul>)}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between">
        <div><h2 className="font-semibold text-slate-900">Find a nearby blood bank</h2><p className="mt-1 text-sm text-slate-600">Browse locations and check listed stock by blood group.</p></div>
        <Link to="/blood-banks" className="btn-primary mt-4 sm:mt-0">View blood banks</Link>
      </section>
    </div>
  )
}
