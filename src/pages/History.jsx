import { donorService } from '../services/donorService'
import { Empty, ErrorState, Loading, PageHeader, useAsync } from '../components/ui'

export default function History() {
  const { data, loading, error, reload } = useAsync(donorService.getHistory)
  return (
    <div className="page">
      <PageHeader title="Donation History" />
      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (data.length === 0 ? <Empty title="No donations yet">Your donations will appear here.</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-slate-300 text-slate-500"><tr>{['Date', 'Location', 'Type', 'Units'].map((h) => <th key={h} scope="col" className="py-2 pr-4 font-medium">{h}</th>)}</tr></thead>
            <tbody>{data.map((d) => <tr key={d.id} className="border-b border-slate-200"><td className="py-3 pr-4">{d.date}</td><td className="pr-4">{d.place}</td><td className="pr-4">{d.type}</td><td>{d.units}</td></tr>)}</tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
