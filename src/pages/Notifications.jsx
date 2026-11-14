import { useState } from 'react'
import { AlertTriangle, Bell, CheckCheck, Clock3, Droplet, PackageCheck, Truck } from 'lucide-react'
import { dateLabel, inventoryLots } from '../data/operations.js'
import { PageHeader } from '../components/ui'

const earliestOminus = inventoryLots.find((lot) => lot.group === 'O-' && lot.component === 'Red cells')
const initialUpdates = [
  { id: 'u1', type: 'Expiry warning', title: 'O- red cells approaching expiry', detail: `${earliestOminus?.units || 0} units · ${earliestOminus?.hospital || 'Blood bank'} · Expires ${earliestOminus ? dateLabel(earliestOminus.expiresOn) : 'date unavailable'}.`, time: 'Today · 9:12 am', icon: AlertTriangle, tone: 'amber', read: false },
  { id: 'u2', type: 'Critical request', title: 'Urgent O- requirement', detail: '3 units requested at Sahyadri Hospital, Deccan.', time: 'Today · 8:45 am', icon: Droplet, tone: 'rose', read: false },
  { id: 'u3', type: 'Transit update', title: 'Dispatch DSP-208 is in transit', detail: '2 O+ red-cell units · City Central Blood Bank to City Care Hospital.', time: 'Today · 8:30 am', icon: Truck, tone: 'sky', read: false },
  { id: 'u4', type: 'Stock warning', title: 'No B- units listed at Ruby Care', detail: 'Review nearby locations and check current stock with the blood bank.', time: 'Yesterday · 5:20 pm', icon: PackageCheck, tone: 'amber', read: true },
  { id: 'u5', type: 'Inventory update', title: 'FIFO order refreshed', detail: 'Stock lots are displayed from earliest expiry to latest.', time: 'Yesterday · 2:05 pm', icon: Clock3, tone: 'slate', read: true },
]

const iconTone = { amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700', sky: 'bg-sky-50 text-sky-700', slate: 'bg-slate-100 text-slate-600' }

export default function Notifications() {
  const [items, setItems] = useState(initialUpdates)
  const unreadCount = items.filter((item) => !item.read).length
  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, read: true })))
  return (
    <div className="page max-w-4xl">
      <PageHeader title="Notifications">Stock warnings, emergency requests, and transit updates in one place.</PageHeader>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-rose-50 p-2 text-rose-700"><Bell className="h-5 w-5" aria-hidden /></span><div><p className="font-semibold">{unreadCount} unread updates</p><p className="text-sm text-slate-500">Updates are shown in this page only.</p></div></div><button type="button" className="btn-secondary !py-2" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4" aria-hidden /> Mark all read</button></div>
      <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{items.map((item) => { const Icon = item.icon; return <li key={item.id} className={`flex gap-3 border-t border-slate-100 p-4 first:border-0 sm:p-5 ${item.read ? '' : 'bg-rose-50/40'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone[item.tone]}`}><Icon className="h-5 w-5" aria-hidden /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{item.title}</p>{!item.read && <span className="h-2 w-2 rounded-full bg-rose-600" aria-label="Unread" />}</div><p className="mt-1 text-sm leading-5 text-slate-600">{item.detail}</p><p className="mt-2 text-xs text-slate-500">{item.type} · {item.time}</p></div></li> })}</ul>
      <p className="mt-4 text-xs text-slate-500">Illustrative operations updates. Mark-as-read changes stay in this page and are not saved to an account.</p>
    </div>
  )
}
