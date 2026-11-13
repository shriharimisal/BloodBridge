import { inventoryService } from './inventoryService.js'

export const stockLevel = (units) => (units === 0 ? 'Unavailable' : units < 5 ? 'Low' : 'Available')

export const bloodService = {
  getAvailability: inventoryService.getAvailability,
}
