import { donations } from '../data/mock.js'
import { backendConfigured, requireSupabase } from './supabase.js'
import { readStorage } from './storage.js'

const monthKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0')].join('-')

function mockStats() {
  const records = readStorage('donations', donations)
  const months = []
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  start.setMonth(start.getMonth() - 5)
  for (let offset = 0; offset < 6; offset += 1) {
    const month = new Date(start)
    month.setMonth(start.getMonth() + offset)
    const key = monthKey(month)
    const count = records.filter((donation) => {
      const donatedOn = new Date(donation.donatedOn || donation.date)
      return Number.isFinite(donatedOn.getTime()) && monthKey(donatedOn) === key
    }).length
    months.push({ month: key, donations: count, units: count })
  }
  return { totalDonations: records.length, totalUnits: records.reduce((sum, donation) => sum + Number(donation.units || 0), 0), months }
}

export const dashboardStatsService = {
  getDonationStats: async () => {
    if (!backendConfigured) return mockStats()
    const { data, error } = await requireSupabase()
      .from('donation_dashboard_stats')
      .select('total_donations,total_units,monthly_counts')
      .eq('id', true)
      .single()
    if (error) throw error
    return {
      totalDonations: Number(data.total_donations || 0),
      totalUnits: Number(data.total_units || 0),
      months: Array.isArray(data.monthly_counts) ? data.monthly_counts : [],
    }
  },
}
