import { delay } from './delay.js'
import { notifications } from '../data/mock.js'
import { readStorage, writeStorage } from './storage.js'
import { backendConfigured, requireSupabase } from './supabase.js'
import { currentUserId } from './backendHelpers.js'

// TODO(backend): GET /notifications, PATCH /notifications/read
export const notificationService = {
  list: async () => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const { data, error } = await requireSupabase().from('notifications').select('id,type,text,created_at,read').eq('user_id', userId).order('created_at', { ascending: false })
      if (error) throw error
      return data.map((item) => ({ ...item, time: new Date(item.created_at).toLocaleString() }))
    }
    return delay(readStorage('notifications', notifications))
  },
  markAllRead: async () => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const { error } = await requireSupabase().from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
      if (error) throw error
      return { ok: true }
    }
    const next = readStorage('notifications', notifications).map((item) => ({ ...item, read: true }))
    if (!writeStorage('notifications', next)) return Promise.reject(new Error('Could not save notification changes.'))
    return delay({ ok: true }, 150)
  },
}
