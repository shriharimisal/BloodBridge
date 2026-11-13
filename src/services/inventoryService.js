import { BLOOD_GROUPS, bloodBanks } from '../data/mock.js'
import { backendConfigured, requireSupabase } from './supabase.js'

const legacyUnits = (bank, group) => Math.max(0, Number(bank.stock?.[group] || 0))

function localDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function addDaysKey(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

export function withTrackedStock(banks, batches) {
  return banks.map((bank) => {
    const stock = { ...(bank.stock || {}) }
    for (const group of BLOOD_GROUPS) {
      const matching = batches.filter((batch) => batch.blood_bank_id === bank.id && batch.blood_group === group)
      if (matching.length) {
        stock[group] = matching.reduce((sum, batch) => {
          if (batch.expires_on < localDateKey(new Date())) return sum
          return sum + Math.max(0, Number(batch.units_remaining || 0))
        }, 0)
      } else {
        stock[group] = legacyUnits(bank, group)
      }
    }
    return { ...bank, stock }
  })
}

async function getSnapshot() {
  if (!backendConfigured) return { banks: bloodBanks, batches: [] }
  const client = requireSupabase()
  const [bankResult, batchResult] = await Promise.all([
    client.from('blood_banks').select('id,stock'),
    client.from('blood_inventory_batches').select('blood_bank_id,blood_group,units_remaining,expires_on'),
  ])
  if (bankResult.error) throw bankResult.error
  if (batchResult.error) throw batchResult.error
  return { banks: bankResult.data || [], batches: batchResult.data || [] }
}

export const inventoryService = {
  getAvailability: async () => {
    const { banks, batches } = await getSnapshot()
    const effectiveBanks = withTrackedStock(banks, batches)
    return BLOOD_GROUPS.map((group) => {
      const units = effectiveBanks.reduce((sum, bank) => sum + legacyUnits(bank, group), 0)
      const untrackedUnits = banks.reduce((sum, bank) => {
        const hasTrackedRows = batches.some((batch) => batch.blood_bank_id === bank.id && batch.blood_group === group)
        return sum + (hasTrackedRows ? 0 : legacyUnits(bank, group))
      }, 0)
      return {
        group,
        units,
        untrackedUnits,
        level: units === 0 ? 'Unavailable' : units < 5 ? 'Low' : 'Available',
      }
    })
  },

  getExpirySummary: async () => {
    const { banks, batches } = await getSnapshot()
    const today = localDateKey(new Date())
    const nextWeek = addDaysKey(7)
    const effectiveBanks = withTrackedStock(banks, batches)
    const groups = BLOOD_GROUPS.map((group) => {
      const rows = batches.filter((batch) => batch.blood_group === group)
      return {
        group,
        expiringUnits: rows.filter((batch) => batch.expires_on >= today && batch.expires_on <= nextWeek).reduce((sum, batch) => sum + Number(batch.units_remaining || 0), 0),
        expiredUnits: rows.filter((batch) => batch.expires_on < today).reduce((sum, batch) => sum + Number(batch.units_remaining || 0), 0),
      }
    })
    const untrackedUnits = effectiveBanks.reduce((sum, bank) => sum + BLOOD_GROUPS.reduce((groupSum, group) => {
      const hasTrackedRows = batches.some((batch) => batch.blood_bank_id === bank.id && batch.blood_group === group)
      return groupSum + (hasTrackedRows ? 0 : legacyUnits(bank, group))
    }, 0), 0)
    return {
      groups,
      hasTrackedBatches: batches.length > 0,
      trackedUnits: batches.reduce((sum, batch) => sum + Number(batch.units_remaining || 0), 0),
      expiringUnits: groups.reduce((sum, group) => sum + group.expiringUnits, 0),
      expiredUnits: groups.reduce((sum, group) => sum + group.expiredUnits, 0),
      untrackedUnits,
    }
  },
}

export { getSnapshot as getInventorySnapshot }
