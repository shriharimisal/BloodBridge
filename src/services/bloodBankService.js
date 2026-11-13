import { delay } from './delay'
import { bloodBanks } from '../data/mock'
import { stockLevel } from './bloodService'

// TODO(backend): GET /blood-banks and GET /blood-banks/:id
export const bloodBankService = {
  search: ({ group = '', location = '', radius = '', name = '', availability = '' } = {}) => {
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
  getById: (id) => delay(bloodBanks.find((b) => b.id === id) || null),
}
