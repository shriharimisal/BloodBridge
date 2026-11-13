import { delay } from './delay'
import { requests } from '../data/mock'
import { readStorage, writeStorage } from './storage'

const getStore = () => readStorage('requests', requests)

// TODO(backend): GET /requests and POST /requests
export const requestService = {
  list: ({ group = '', urgency = '', status = '' } = {}) =>
    delay(getStore().filter((r) => (!group || r.group === group) && (!urgency || r.urgency === urgency) && (!status || r.status === status))),
  create: (data) => {
    const now = Date.now()
    const created = { id: `r${now}`, status: 'Open', createdAt: new Date(now).toISOString(), ...data }
    const next = [created, ...getStore()]
    if (!writeStorage('requests', next)) return Promise.reject(new Error('Could not save this request in browser storage.'))
    return delay({ ...created, reference: `BB-${String(now).slice(-6)}` }, 250)
  },
}
