import { BLOOD_GROUPS, bloodBanks } from './mock.js'

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function expiryDate(offset) {
  const now = new Date()
  const pattern = offset % 4
  const monthOffset = pattern < 2 ? (now.getDate() > 18 ? 1 : 0) : pattern - 1
  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  const withinPattern = Math.floor(offset / 4)
  const firstDay = pattern < 2 ? Math.min(24, lastDay) : Math.min(10, lastDay)
  const span = pattern < 2 ? 7 : 9
  const day = Math.min(lastDay, firstDay + (withinPattern % span))
  return dateKey(new Date(monthStart.getFullYear(), monthStart.getMonth(), day))
}

function componentsFor(units) {
  const redCells = Math.ceil(units * 0.55)
  const platelets = Math.floor(units * 0.2)
  const plasma = units - redCells - platelets
  return [['Red cells', redCells], ['Platelets', platelets], ['Plasma', plasma]].filter(([, quantity]) => quantity > 0)
}

function createInventoryLots() {
  const lots = []
  let expiryOffset = 0
  let lotNumber = 1001
  for (const [bankIndex, bank] of bloodBanks.entries()) {
    for (const group of BLOOD_GROUPS) {
      const units = Number(bank.stock[group] || 0)
      for (const [component, quantity] of componentsFor(units)) {
        const firstBatch = quantity > 5 ? Math.ceil(quantity * 0.6) : quantity
        const batches = quantity > 5 ? [firstBatch, quantity - firstBatch] : [quantity]
        for (const batchUnits of batches) {
          lots.push({
            id: `lot-${lotNumber}`,
            lotNumber: `BB-${lotNumber++}`,
            hospital: bank.name,
            location: `${bank.area}, ${bank.city}`,
            group,
            component,
            units: batchUnits,
            expiresOn: expiryDate(expiryOffset++ + bankIndex),
          })
        }
      }
    }
  }
  return lots.sort((a, b) => a.expiresOn.localeCompare(b.expiresOn) || a.hospital.localeCompare(b.hospital) || a.group.localeCompare(b.group))
}

export const inventoryLots = createInventoryLots()

export const dispatchCases = [
  { id: 'DSP-204', patient: 'Patient case 204', group: 'O-', component: 'Red cells', units: 3, hospital: 'Sahyadri Hospital', location: 'Deccan, Pune', urgency: 'Critical', requiredBy: 'Today · 6:00 pm', status: 'Matching stock', step: 1 },
  { id: 'DSP-205', patient: 'Patient case 205', group: 'B+', component: 'Platelets', units: 2, hospital: 'Ruby Hall Clinic', location: 'Sassoon Road, Pune', urgency: 'Urgent', requiredBy: 'Tomorrow · 10:00 am', status: 'Donor confirmed', step: 2 },
  { id: 'DSP-206', patient: 'Patient case 206', group: 'A+', component: 'Red cells', units: 1, hospital: 'KEM Hospital', location: 'Rasta Peth, Pune', urgency: 'Urgent', requiredBy: 'Tomorrow · 12:00 pm', status: 'Preparing dispatch', step: 3 },
  { id: 'DSP-207', patient: 'Patient case 207', group: 'AB-', component: 'Plasma', units: 2, hospital: 'Jehangir Hospital', location: 'Sassoon Road, Pune', urgency: 'Normal', requiredBy: '16 Nov · 4:00 pm', status: 'Delivered', step: 5 },
  { id: 'DSP-208', patient: 'Patient case 208', group: 'O+', component: 'Red cells', units: 2, hospital: 'City Care Hospital', location: 'Shivajinagar, Pune', urgency: 'Critical', requiredBy: 'Today · 8:30 pm', status: 'In transit', step: 4 },
]

export const transitDeliveries = [
  { id: 'TR-540', dispatchId: 'DSP-208', group: 'O+', component: 'Red cells', units: 2, from: 'City Central Blood Bank', to: 'City Care Hospital', eta: 'Today · 8:20 pm', current: 2, checkpoints: ['Prepared', 'Picked up', 'In transit', 'Received'] },
  { id: 'TR-541', dispatchId: 'DSP-206', group: 'A+', component: 'Red cells', units: 1, from: 'Red Cross Blood Bank', to: 'KEM Hospital', eta: 'Today · 9:10 pm', current: 1, checkpoints: ['Prepared', 'Picked up', 'In transit', 'Received'] },
  { id: 'TR-539', dispatchId: 'DSP-207', group: 'AB-', component: 'Plasma', units: 2, from: 'Sahyadri Hospital Blood Centre', to: 'Jehangir Hospital', eta: 'Delivered · 4:16 pm', current: 4, checkpoints: ['Prepared', 'Picked up', 'In transit', 'Received'] },
]

export function inventoryStatus(expiresOn) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(`${expiresOn}T00:00:00`)
  const daysLeft = Math.ceil((expiry - today) / 86400000)
  if (daysLeft < 0) return { label: 'Expired', daysLeft, tone: 'rose' }
  if (daysLeft <= 21) return { label: 'Expiring soon', daysLeft, tone: 'amber' }
  return { label: 'Available', daysLeft, tone: 'emerald' }
}

export function dateLabel(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function getPotentialMatchUnits(group, component) {
  return inventoryLots
    .filter((lot) => lot.group === group && lot.component === component && inventoryStatus(lot.expiresOn).daysLeft >= 0)
    .reduce((sum, lot) => sum + lot.units, 0)
}
