import { delay } from './delay.js'
import { donorProfile, donations } from '../data/mock.js'
import { readStorage, writeStorage } from './storage.js'
import { backendConfigured, requireSupabase } from './supabase.js'
import { currentUserId, mapProfile } from './backendHelpers.js'

export const donorService = {
  getProfile: async () => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const { data, error } = await requireSupabase().from('profiles').select('id,name,email,phone,city,blood_group,status,last_donation,donation_count').eq('id', userId).single()
      if (error) throw error
      return mapProfile(data)
    }
    return delay(readStorage('profile', donorProfile))
  },
  setAvailability: async (status) => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const { error } = await requireSupabase().from('profiles').update({ status }).eq('id', userId)
      if (error) throw error
      return { status }
    }
    const profile = { ...readStorage('profile', donorProfile), status }
    if (!writeStorage('profile', profile)) return Promise.reject(new Error('Could not save availability.'))
    return delay({ status }, 150)
  },
  getHistory: async () => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const { data, error } = await requireSupabase().from('donations').select('id,donated_on,blood_bank_name,donation_type,units').eq('user_id', userId).order('donated_on', { ascending: false })
      if (error) throw error
      return data.map((item) => ({ id: item.id, date: new Date(`${item.donated_on}T00:00:00`).toLocaleDateString(), place: item.blood_bank_name, type: item.donation_type, units: item.units }))
    }
    return delay(readStorage('donations', donations))
  },
  saveProfile: async (data) => {
    if (backendConfigured) {
      const userId = await currentUserId()
      const values = { name: data.name.trim(), phone: data.phone.replace(/[\s-]/g, ''), city: data.city.trim(), blood_group: data.group || data.bloodGroup }
      const { data: row, error } = await requireSupabase().from('profiles').update(values).eq('id', userId).select('id').single()
      if (error) throw error
      return { ok: true, data: row }
    }
    const profile = { ...readStorage('profile', donorProfile), ...data, bloodGroup: data.group || data.bloodGroup }
    if (!writeStorage('profile', profile)) return Promise.reject(new Error('Could not save profile.'))
    return delay({ ok: true, data: profile }, 200)
  },
}
