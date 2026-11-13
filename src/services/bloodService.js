import { delay } from './delay.js'
import { bloodBanks, BLOOD_GROUPS } from '../data/mock.js'
import { backendConfigured, requireSupabase } from './supabase.js'

export const stockLevel = (units) => (units === 0 ? 'Unavailable' : units < 5 ? 'Low' : 'Available')

// TODO(backend): GET /blood/availability
export const bloodService = {
  getAvailability: async () => {
    if (backendConfigured) {
      const { data, error } = await requireSupabase().from('blood_banks').select('stock')
      if (error) throw error
      return BLOOD_GROUPS.map((group) => {
        const units = data.reduce((sum, bank) => sum + Number(bank.stock?.[group] || 0), 0)
        return { group, units, level: stockLevel(units) }
      })
    }
    return delay(
      BLOOD_GROUPS.map((group) => {
        const units = bloodBanks.reduce((sum, b) => sum + b.stock[group], 0)
        return { group, units, level: stockLevel(units) }
      })
    )
  },
}
