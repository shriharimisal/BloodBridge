import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownWideNarrow, Droplet, PackageCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { BLOOD_GROUPS, bloodBanks } from '../data/mock.js'
import { inventoryLots, inventoryStatus, dateLabel } from '../data/operations.js'
import { Empty, PageHeader } from '../components/ui'

const components = ['Red cells', 'Platelets', 'Plasma']
const toneClass = { rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-800', emerald: 'bg-emerald-50 text-emerald-700' }

function SummaryCard({ label, value, detail, icon: Icon, color }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className={`h-5 w-5 ${color}`} aria-hidden /></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>
}

export default function Inventory() {
  const [searchParams] = useSearchParams()
  const [group, setGroup] = useState(searchParams.get('group') || 'All groups')
  const [hospital, setHospital] = useState('All hospitals')
  const [component, setComponent] = useState(searchParams.get('component') || 'All components')
  const [status, setStatus] = useState('All stock')
  const [visibleCount, setVisibleCount] = useState(18)

  const totalUnits = inventoryLots.reduce((sum, lot) => sum + lot.units, 0)
  const expiringUnits = inventoryLots.filter((lot) => inventoryStatus(lot.expiresOn).label === 'Expiring soon').reduce((sum, lot) => sum + lot.units, 0)
  const expiredUnits = inventoryLots.filter((lot) => inventoryStatus(lot.expiresOn).label === 'Expired').reduce((sum, lot) => sum + lot.units, 0)
  const lowStockRows = bloodBanks.reduce((count, bank) => count + BLOOD_GROUPS.filter((bloodGroup) => Number(bank.stock[bloodGroup] || 0) <= 2).length, 0)

  const hospitals = useMemo(() => [...new Set(inventoryLots.map((lot) => lot.hospital))].sort(), [])
  const filteredLots = inventoryLots.filter((lot) => {
    const expiryStatus = inventoryStatus(lot.expiresOn).label
    return (group === 'All groups' || lot.group === group)
      && (hospital === 'All hospitals' || lot.hospital === hospital)
      && (component === 'All components' || lot.component === component)
      && (status === 'All stock' || expiryStatus === status)
  })

  const groupTotals = BLOOD_GROUPS.map((bloodGroup) => ({
    group: bloodGroup,
    units: inventoryLots.filter((lot) => lot.group === bloodGroup && inventoryStatus(lot.expiresOn).daysLeft >= 0).reduce((sum, lot) => sum + lot.units, 0),
  }))
  const componentTotals = components.map((name) => ({ name, units: inventoryLots.filter((lot) => lot.component === name && inventoryStatus(lot.expiresOn).daysLeft >= 0).reduce((sum, lot) => sum + lot.units, 0) }))
  const shownLots = filteredLots.slice(0, visibleCount)

  const resetFilters = () => { setGroup('All groups'); setHospital('All hospitals'); setComponent('All components'); setStatus('All stock'); setVisibleCount(18) }

  return (
    <div className="page">
      <PageHeader title="Inventory">Blood stock by hospital, group, component, and expiry — earliest expiry first.</PageHeader>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><p>Illustrative inventory view · Use verified blood-bank records for live availability. Expiry priority follows first-expiry, first-out (FEFO).</p></div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory summary">
        <SummaryCard label="Units listed" value={totalUnits} detail="Across 5 blood-bank locations" icon={Droplet} color="text-rose-600" />
        <SummaryCard label="Expiring soon" value={expiringUnits} detail="Within the next 21 days" icon={AlertTriangle} color="text-amber-600" />
        <SummaryCard label="Expired stock" value={expiredUnits} detail="Exclude from dispatch" icon={AlertTriangle} color="text-rose-700" />
        <SummaryCard label="Low-stock groups" value={lowStockRows} detail="Hospital and group pairs with 2 units or fewer" icon={PackageCheck} color="text-sky-700" />
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_1fr]" aria-label="Stock by blood group and component">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Units by blood group</h2><p className="mt-1 text-sm text-slate-500">Available units across the listed locations</p></div><Droplet className="h-5 w-5 text-rose-600" aria-hidden /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{groupTotals.map((row) => <button key={row.group} onClick={() => { setGroup(row.group); setVisibleCount(18) }} className={`rounded-xl border p-3 text-left transition hover:border-rose-300 ${group === row.group ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}><span className="text-sm font-semibold text-slate-700">{row.group}</span><span className="mt-1 block text-xl font-bold text-slate-900">{row.units}</span><span className="text-xs text-slate-500">units</span></button>)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Units by component</h2><p className="mt-1 text-sm text-slate-500">Component quantities across all groups</p><div className="mt-4 space-y-3">{componentTotals.map((row) => <div key={row.name} className="flex items-center justify-between border-t border-slate-100 pt-3 first:border-0 first:pt-0"><span className="text-sm text-slate-700">{row.name}</span><span className="font-semibold tabular-nums">{row.units} units</span></div>)}</div></div>
      </section>

      <section className="mt-8" aria-labelledby="stock-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="stock-list-title" className="text-xl font-semibold">Stock lots</h2><p className="mt-1 text-sm text-slate-500">Sorted by earliest expiry date (FEFO)</p></div><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"><ArrowDownWideNarrow className="h-4 w-4" aria-hidden /> First expiry, first out</span></div>
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter stock lots">
          <label className="text-xs font-medium text-slate-600">Blood group<select className="input mt-1" value={group} onChange={(event) => { setGroup(event.target.value); setVisibleCount(18) }}><option>All groups</option>{BLOOD_GROUPS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Hospital<select className="input mt-1" value={hospital} onChange={(event) => { setHospital(event.target.value); setVisibleCount(18) }}><option>All hospitals</option>{hospitals.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Component<select className="input mt-1" value={component} onChange={(event) => { setComponent(event.target.value); setVisibleCount(18) }}><option>All components</option>{components.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Expiry status<select className="input mt-1" value={status} onChange={(event) => { setStatus(event.target.value); setVisibleCount(18) }}><option>All stock</option><option>Expiring soon</option><option>Expired</option><option>Available</option></select></label>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Group / lot', 'Component', 'Hospital', 'Units', 'Expiry', 'Priority'].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{shownLots.map((lot) => { const expiry = inventoryStatus(lot.expiresOn); return <tr key={lot.id} className="border-t border-slate-100"><td className="px-4 py-3"><span className="font-semibold">{lot.group}</span><span className="mt-0.5 block text-xs text-slate-500">{lot.lotNumber}</span></td><td className="px-4 py-3">{lot.component}</td><td className="px-4 py-3"><span className="block font-medium text-slate-800">{lot.hospital}</span><span className="text-xs text-slate-500">{lot.location}</span></td><td className="px-4 py-3 font-semibold tabular-nums">{lot.units}</td><td className="px-4 py-3">{dateLabel(lot.expiresOn)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass[expiry.tone]}`}>{expiry.label}</span></td></tr> })}</tbody></table></div>
          {shownLots.length === 0 && <div className="p-6"><Empty title="No stock matches those filters" /><button className="btn-secondary mt-3" onClick={resetFilters}>Clear filters</button></div>}
          {shownLots.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500"><span>Showing {shownLots.length} of {filteredLots.length} lots · {filteredLots.reduce((sum, lot) => sum + lot.units, 0)} units</span>{shownLots.length < filteredLots.length && <button className="btn-secondary !py-2" onClick={() => setVisibleCount((count) => count + 18)}>Show more</button>}</div>}
        </div>
      </section>
      <p className="mt-4 text-xs text-slate-500">Blood group and component matching shown here is a preliminary lookup. Confirm compatibility, expiry, and availability with qualified blood-bank staff before use.</p>
    </div>
  )
}
