import { Link } from 'react-router-dom'
import { donorService } from '../services/donorService'
import { requestService } from '../services/requestService'
import { Empty, ErrorState, Loading, PageHeader, RequestRow, useAsync } from '../components/ui'
import { useState } from 'react'

const eligibility = ['Age 18–65 and weight at least 45 kg', 'Hemoglobin of at least 12.5 g/dL', 'At least 3 months since your last whole blood donation', 'Feeling well, with no fever or infection', 'No recent tattoo, surgery or new medication without checking with a doctor']

export default function Donate() {
  const profile = useAsync(donorService.getProfile)
  const nearby = useAsync(() => requestService.list({ status: 'Open' }))
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const current = status || profile.data?.status
  const toggle = async () => {
    const next = current === 'Available' ? 'Unavailable' : 'Available'
    setSaving(true); setSaveError(false)
    try { await donorService.setAvailability(next); setStatus(next) }
    catch { setSaveError(true) }
    finally { setSaving(false) }
  }
  return (
    <div className="page">
      <PageHeader title="Donate Blood">Your profile, eligibility and nearby requests in one place.</PageHeader>
      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="prof">
          <h2 id="prof" className="text-lg font-semibold">Donor profile</h2>
          {profile.loading && <Loading />}
          {profile.error && <ErrorState message={profile.error} onRetry={profile.reload} />}
          {profile.data && (
            <>
              <dl className="mt-3 text-sm">
                {[['Blood group', profile.data.bloodGroup], ['Last donation', profile.data.lastDonation], ['Total donations', profile.data.donationCount]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-t border-slate-200 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <p id="avail-label" className="text-sm font-medium">Available to donate</p>
                <button role="switch" aria-checked={current === 'Available'} aria-labelledby="avail-label" onClick={toggle}
                  disabled={saving} className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${current === 'Available' ? 'bg-brand' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${current === 'Available' ? 'left-[1.375rem]' : 'left-0.5'}`} />
                </button>
              </div>
              {saveError && <p role="alert" className="mt-2 text-sm text-red-700">Could not save your availability. Please try again.</p>}
              <Link to="/history" className="mt-4 inline-block text-sm font-medium text-brand underline">View donation history</Link>
            </>
          )}
        </section>
        <section aria-labelledby="elig">
          <h2 id="elig" className="text-lg font-semibold">Eligibility</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">{eligibility.map((e) => <li key={e}>{e}</li>)}</ul>
          <p className="mt-3 text-xs text-slate-500">General guidance only. The blood bank will confirm your eligibility at donation.</p>
        </section>
      </div>
      <section className="mt-12" aria-labelledby="near">
        <h2 id="near" className="text-lg font-semibold">Nearby requests</h2>
        {nearby.loading && <Loading />}
        {nearby.error && <ErrorState message={nearby.error} onRetry={nearby.reload} />}
        {nearby.data && (nearby.data.length === 0 ? <Empty title="No open requests nearby" /> : <ul className="mt-2">{nearby.data.slice(0, 4).map((r) => <RequestRow key={r.id} r={r} />)}</ul>)}
      </section>
    </div>
  )
}
