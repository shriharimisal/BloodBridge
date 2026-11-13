import { delay } from './delay.js'
import { requests } from '../data/mock.js'
import { readStorage, writeStorage } from './storage.js'
import { backendConfigured, requireSupabase } from './supabase.js'
import { currentUserId, mapRequest } from './backendHelpers.js'

const getStore = () => readStorage('requests', requests)

// TODO(backend): GET /requests and POST /requests
export const requestService = {
  list: async ({ group = '', urgency = '', status = '' } = {}) => {
    if (backendConfigured) {
      let query = requireSupabase().from('requests').select('id,blood_group,units,hospital,location,required_by,urgency,status').order('created_at', { ascending: false }).limit(100)
      if (group) query = query.eq('blood_group', group)
      if (urgency) query = query.eq('urgency', urgency)
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (error) throw error
      return data.map(mapRequest)
    }
    return delay(getStore().filter((r) => (!group || r.group === group) && (!urgency || r.urgency === urgency) && (!status || r.status === status)))
  },
  create: async (data) => {
    if (backendConfigured) {
      const client = requireSupabase()
      await currentUserId()
      const { data: row, error } = await client.from('requests').insert({
        patient_name: data.patient,
        blood_group: data.group,
        units: data.units,
        hospital: data.hospital,
        location: data.location,
        required_by: new Date(data.requiredBy).toISOString(),
        urgency: data.urgency,
        contact_number: data.contact,
        additional_info: data.info || null,
      }).select('id,status').single()
      if (error) throw error
      return { id: row.id, status: row.status, reference: `BB-${row.id.slice(-6).toUpperCase()}` }
    }
    const now = Date.now()
    const created = { id: `r${now}`, status: 'Open', createdAt: new Date(now).toISOString(), ...data }
    const next = [created, ...getStore()]
    if (!writeStorage('requests', next)) return Promise.reject(new Error('Could not save this request in browser storage.'))
    return delay({ ...created, reference: `BB-${String(now).slice(-6)}` }, 250)
  },
}
