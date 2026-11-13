import { delay } from './delay'
import { bloodBanks, BLOOD_GROUPS } from '../data/mock'

export const stockLevel = (units) => (units === 0 ? 'Unavailable' : units < 5 ? 'Low' : 'Available')

// TODO(backend): GET /blood/availability
export const bloodService = {
  getAvailability: () =>
    delay(
      BLOOD_GROUPS.map((group) => {
        const units = bloodBanks.reduce((sum, b) => sum + b.stock[group], 0)
        return { group, units, level: stockLevel(units) }
      })
    ),
}
