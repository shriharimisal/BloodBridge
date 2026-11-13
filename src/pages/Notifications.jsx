import { useEffect, useState } from 'react'
import { notificationService } from '../services/notificationService'
import { Empty, ErrorState, Loading, PageHeader, useAsync } from '../components/ui'

export default function Notifications() {
  const { data, loading, error, reload } = useAsync(notificationService.list)
  const [items, setItems] = useState([])
  const [saveError, setSaveError] = useState(false)
  useEffect(() => { if (data) setItems(data) }, [data])
  const markAll = async () => {
    setSaveError(false)
    try { await notificationService.markAllRead(); setItems(items.map((i) => ({ ...i, read: true }))) }
    catch { setSaveError(true) }
  }
  const unread = items.filter((i) => !i.read).length
  return (
    <div className="page max-w-3xl">
      <PageHeader title="Notifications" />
      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (items.length === 0 ? <Empty title="No notifications" /> : (
        <>
          <button className="btn-secondary mb-2" onClick={markAll} disabled={!unread}>Mark all as read</button>
          {saveError && <p role="alert" className="mb-3 text-sm text-red-700">Could not save this change. Please try again.</p>}
          <ul>
            {items.map((i) => (
              <li key={i.id} className="row flex gap-3">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${i.read ? 'bg-transparent' : 'bg-brand'}`} aria-label={i.read ? undefined : 'Unread'} />
                <div><p className="text-sm text-slate-900">{i.text}</p><p className="text-xs text-slate-500">{i.type} · {i.time}</p></div>
              </li>
            ))}
          </ul>
        </>
      ))}
    </div>
  )
}
