import { delay } from './delay.js'
import { bloodBanks } from '../data/mock.js'
import { stockLevel } from './bloodService.js'
import { backendConfigured, requireSupabase } from './supabase.js'
import { withTrackedStock } from './inventoryService.js'

export const bloodBankService = {
  search: ({ group = '', location = '', radius = '', name = '', availability = '' } = {}) => {
    if (backendConfigured) return (async () => {
      const { data, error } = await requireSupabase().from('blood_banks').select('id,name,area,city,distance_km,phone,hours,address,stock,is_sample').order('distance_km')
      if (error) throw error
      const { data: batches, error: batchError } = await requireSupabase().from('blood_inventory_batches').select('blood_bank_id,blood_group,units_remaining,expires_on')
      if (batchError) throw batchError
      const list = withTrackedStock(data.map((row) => ({ ...row, distance: Number(row.distance_km) })), batches || [])
      const q = (value) => value.trim().toLowerCase()
      return list.filter((bank) => {
        if (location && !`${bank.area} ${bank.city}`.toLowerCase().includes(q(location))) return false
        if (radius && bank.distance > Number(radius)) return false
        if (name && !bank.name.toLowerCase().includes(q(name))) return false
        if (group && !(bank.stock[group] > 0)) return false
        if (availability) {
          const levels = group ? [stockLevel(bank.stock[group])] : Object.values(bank.stock).map(stockLevel)
          if (!levels.includes(availability)) return false
        }
        return true
      })
    })()
    const q = (s) => s.trim().toLowerCase()
    const list = bloodBanks.filter((b) => {
      if (location && !`${b.area} ${b.city}`.toLowerCase().includes(q(location))) return false
      if (radius && b.distance > Number(radius)) return false
      if (name && !b.name.toLowerCase().includes(q(name))) return false
      if (group && !(b.stock[group] > 0)) return false
      if (availability) {
        const levels = group ? [stockLevel(b.stock[group])] : Object.values(b.stock).map(stockLevel)
        if (!levels.includes(availability)) return false
      }
      return true
    })
    return delay([...list].sort((a, b) => a.distance - b.distance))
  },
  getById: async (id) => {
    if (backendConfigured) {
      const { data, error } = await requireSupabase().from('blood_banks').select('id,name,area,city,distance_km,phone,hours,address,stock,is_sample').eq('id', id).maybeSingle()
      if (error) throw error
      if (!data) return null
      const { data: batches, error: batchError } = await requireSupabase().from('blood_inventory_batches').select('blood_bank_id,blood_group,units_remaining,expires_on').eq('blood_bank_id', id)
      if (batchError) throw batchError
      return withTrackedStock([{ ...data, distance: Number(data.distance_km) }], batches || [])[0]
    }
    return delay(bloodBanks.find((b) => b.id === id) || null)
  },
}
