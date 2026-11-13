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
  const [report, setReport] = useState({ donatedOn: new Date().toLocaleDateString('en-CA'), bloodBankName: '', donationType: 'Whole blood', units: '1' })
  const [reportState, setReportState] = useState('')
  const [reportError, setReportError] = useState('')
  const current = status || profile.data?.status
  const toggle = async () => {
    const next = current === 'Available' ? 'Unavailable' : 'Available'
    setSaving(true); setSaveError(false)
    try { await donorService.setAvailability(next); setStatus(next) }
    catch { setSaveError(true) }
    finally { setSaving(false) }
  }
  const submitDonation = async (event) => {
    event.preventDefault()
    setReportState(''); setReportError('')
    const units = Number(report.units)
    if (!report.bloodBankName.trim()) { setReportError('Enter the blood bank or donation center name.'); return }
    if (!Number.isInteger(units) || units < 1 || units > 10) { setReportError('Enter a whole number of units from 1 to 10.'); return }
    if (!report.donatedOn || report.donatedOn > new Date().toLocaleDateString('en-CA')) { setReportError('Choose today or an earlier donation date.'); return }
    setSaving(true)
    try {
      await donorService.recordDonation({ ...report, bloodBankName: report.bloodBankName.trim(), units })
      setReportState('Donation report saved. Community totals are aggregated; your donation history stays private.')
      setReport({ donatedOn: new Date().toLocaleDateString('en-CA'), bloodBankName: '', donationType: 'Whole blood', units: '1' })
      await profile.reload()
    } catch {
      setReportError('Could not save your donation report. Please try again.')
    } finally { setSaving(false) }
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
      <section className="mt-10 max-w-2xl" aria-labelledby="record-donation">
        <h2 id="record-donation" className="text-lg font-semibold">Report a completed donation</h2>
        <p className="mt-1 text-sm text-slate-600">Record a donation you have already made. These reports update the community total and are self-reported.</p>
        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2" onSubmit={submitDonation}>
          <label className="text-sm font-medium text-slate-700">Donation date<input className="input mt-1 w-full" type="date" max={new Date().toLocaleDateString('en-CA')} value={report.donatedOn} onChange={(event) => setReport({ ...report, donatedOn: event.target.value })} required /></label>
          <label className="text-sm font-medium text-slate-700">Blood bank or center<input className="input mt-1 w-full" value={report.bloodBankName} onChange={(event) => setReport({ ...report, bloodBankName: event.target.value })} maxLength={120} required /></label>
          <label className="text-sm font-medium text-slate-700">Donation type<select className="input mt-1 w-full" value={report.donationType} onChange={(event) => setReport({ ...report, donationType: event.target.value })}><option>Whole blood</option><option>Platelets</option><option>Plasma</option></select></label>
          <label className="text-sm font-medium text-slate-700">Units donated<input className="input mt-1 w-full" type="number" min="1" max="10" step="1" value={report.units} onChange={(event) => setReport({ ...report, units: event.target.value })} required /></label>
          {reportError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{reportError}</p>}
          {reportState && <p role="status" className="text-sm text-emerald-700 sm:col-span-2">{reportState}</p>}
          <div className="sm:col-span-2"><button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save donation report'}</button></div>
        </form>
      </section>
      <section className="mt-12" aria-labelledby="near">
        <h2 id="near" className="text-lg font-semibold">Nearby requests</h2>
        {nearby.loading && <Loading />}
        {nearby.error && <ErrorState message={nearby.error} onRetry={nearby.reload} />}
        {nearby.data && (nearby.data.length === 0 ? <Empty title="No open requests nearby" /> : <ul className="mt-2">{nearby.data.slice(0, 4).map((r) => <RequestRow key={r.id} r={r} />)}</ul>)}
      </section>
    </div>
  )
}
