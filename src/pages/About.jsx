import { Link } from 'react-router-dom'
import { Activity, CircleHelp, ClipboardList, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { PageHeader } from '../components/ui'

const guide = [
  { title: 'Inventory', text: 'Filter by blood group, hospital, component, and expiry status. Lots are ordered by earliest expiry first.', icon: PackageCheck },
  { title: 'Emergency dispatch', text: 'Review urgent requirements, check listed exact-group stock, and follow each case status.', icon: ClipboardList },
  { title: 'Transit', text: 'Follow the example checkpoints from preparation and pickup through hospital receipt.', icon: Truck },
  { title: 'Notifications', text: 'Review expiry warnings, urgent requests, low-stock notices, and transit updates.', icon: Activity },
]

export default function About() {
  return (
    <div className="page max-w-4xl">
      <PageHeader title="About BloodBridge">A simple view of blood availability, urgent needs, and delivery progress.</PageHeader>
      <section className="rounded-2xl bg-gradient-to-br from-rose-800 via-red-700 to-rose-600 p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-100">How to use the operations view</p><h2 className="mt-2 text-2xl font-bold">Find the next useful action quickly.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-rose-50">BloodBridge brings inventory, emergency dispatch, transit checkpoints, and updates together. The listed stock and operations statuses are illustrative and should be verified with the relevant hospital or blood bank.</p></section>
      <section className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Section help">{guide.map(({ title, text, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="inline-flex rounded-xl bg-slate-100 p-2 text-brand"><Icon className="h-5 w-5" aria-hidden /></span><h2 className="mt-3 font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></article>)}</section>
      <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><span className="rounded-xl bg-white p-2 text-amber-700"><ShieldCheck className="h-5 w-5" aria-hidden /></span><div><h2 className="font-semibold text-amber-950">Safety and verification</h2><p className="mt-1 text-sm leading-6 text-amber-900">Stock counts, expiry dates, compatibility prompts, patient cases, and transit states on these pages are examples for the interface. Confirm real stock and component compatibility with qualified blood-bank staff. In an emergency, contact the hospital or local emergency services first.</p></div></div></section>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden /><div><h2 className="font-semibold">Need help?</h2><p className="mt-1 text-sm leading-6 text-slate-600">For a real blood requirement, contact the treating hospital and a licensed blood bank directly. Use the inventory view to understand the filters and prioritization shown in this prototype.</p><div className="mt-4 flex flex-wrap gap-3"><Link to="/inventory" className="btn-secondary !py-2">View inventory</Link><Link to="/dispatch" className="btn-primary !py-2">Open dispatch</Link></div></div></div></section>
    </div>
  )
}
