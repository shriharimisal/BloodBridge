import { Link } from 'react-router-dom'
import { bloodService } from '../services/bloodService'
import { Empty, ErrorState, Loading, Tone, useAsync } from '../components/ui'

const steps = [
  ['Search or request', 'Find available blood nearby, or post an emergency request.'],
  ['Get matched', 'Donors and blood banks see your request.'],
  ['Confirm details', 'Agree on the hospital, time and contact.'],
  ['Donate or receive', 'Blood reaches the patient who needs it.'],
]

export default function Home() {
  const { data, loading, error, reload } = useAsync(bloodService.getAvailability)
  return (
    <>
      <section className="page !py-14 sm:!py-20">
        <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">Every Drop Can Save a Life.</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">Find blood, become a donor, or request blood in an emergency.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/find-blood" className="btn-primary">Find Blood</Link>
          <Link to="/register" className="btn-secondary">Become a Donor</Link>
          <Link to="/request" className="btn-secondary">Request Blood</Link>
        </div>
      </section>

      <section className="border-t border-slate-200" aria-labelledby="avail">
        <div className="page">
          <h2 id="avail" className="text-xl font-semibold">Blood availability</h2>
          <p className="mt-1 text-sm text-slate-500">Combined stock across listed blood banks.</p>
          {loading && <Loading />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {data && (data.length === 0 ? <Empty title="No availability data" /> : (
            <ul className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
              {data.map((g) => (
                <li key={g.group} className="flex items-baseline justify-between border-t border-slate-200 py-3">
                  <span className="text-xl font-semibold">{g.group}</span>
                  <span className="text-sm"><Tone value={g.level} /></span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200" aria-labelledby="how">
        <div className="page">
          <h2 id="how" className="text-xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title}>
                <p className="text-sm font-semibold text-brand">Step {i + 1}</p>
                <p className="mt-1 font-medium text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
