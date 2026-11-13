import { delay } from './delay'
import { notifications } from '../data/mock'
import { readStorage, writeStorage } from './storage'

// TODO(backend): GET /notifications, PATCH /notifications/read
export const notificationService = {
  list: () => delay(readStorage('notifications', notifications)),
  markAllRead: () => {
    const next = readStorage('notifications', notifications).map((item) => ({ ...item, read: true }))
    if (!writeStorage('notifications', next)) return Promise.reject(new Error('Could not save notification changes.'))
    return delay({ ok: true }, 150)
  },
}
