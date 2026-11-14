import { Check, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react'
import { transitDeliveries } from '../data/operations.js'
import { PageHeader } from '../components/ui'

function Timeline({ checkpoints, current, deliveryId }) {
  return <ol className="mt-5 grid grid-cols-4 gap-2" aria-label={`Transit checkpoints for ${deliveryId}`}>
    {checkpoints.map((checkpoint, index) => {
      const complete = index < current
      const active = index === current
      return <li key={checkpoint} className="min-w-0 text-center"><span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${complete ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>{complete ? <Check className="h-4 w-4" aria-hidden /> : <span className="text-xs font-semibold">{index + 1}</span>}</span><span className={`mt-2 block truncate text-[10px] sm:text-xs ${active ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{checkpoint}</span></li>
    })}
  </ol>
}

export default function Transit() {
  const active = transitDeliveries.filter((delivery) => delivery.current < delivery.checkpoints.length).length
  return (
    <div className="page">
      <PageHeader title="Transit tracking">Follow simulated checkpoints from blood-bank preparation through hospital receipt.</PageHeader>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"><Truck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><p>Illustrative transit view · Checkpoints, ETA, and delivery states are not live tracking.</p></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Deliveries listed</p><p className="mt-2 text-2xl font-bold">{transitDeliveries.length}</p></div><div className="rounded-2xl border border-rose-100 bg-rose-50 p-4"><p className="text-sm text-rose-700">On the way</p><p className="mt-2 text-2xl font-bold text-rose-900">{active}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Checkpoints</p><p className="mt-2 text-2xl font-bold">4</p></div></div>
      <section className="space-y-4" aria-label="Blood transit deliveries">
        {transitDeliveries.map((delivery) => {
          const delivered = delivery.current === delivery.checkpoints.length
          const currentStatus = delivered ? 'Received' : delivery.checkpoints[delivery.current] || 'In progress'
          return <article key={delivery.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className={`rounded-xl p-2 ${delivered ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>{delivered ? <PackageCheck className="h-5 w-5" aria-hidden /> : <Truck className="h-5 w-5" aria-hidden />}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{delivery.id}</h2><span className="text-xs text-slate-500">Dispatch {delivery.dispatchId}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${delivered ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{currentStatus}</span></div><p className="mt-1 text-sm text-slate-700">{delivery.units} units · {delivery.group} · {delivery.component}</p></div></div><p className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Clock3 className="h-4 w-4 text-slate-400" aria-hidden />{delivery.eta}</p></div><div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2"><p><span className="text-xs text-slate-500">From</span><span className="mt-0.5 block font-medium">{delivery.from}</span></p><p><span className="text-xs text-slate-500">To</span><span className="mt-0.5 flex items-center gap-1 font-medium"><MapPin className="h-4 w-4 text-rose-600" aria-hidden />{delivery.to}</span></p></div><Timeline checkpoints={delivery.checkpoints} current={delivery.current} deliveryId={delivery.id} /></article>
        })}
      </section>
    </div>
  )
}
