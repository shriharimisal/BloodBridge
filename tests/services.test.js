import test from 'node:test'
import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'
import { authService } from '../src/services/authService.js'
import { backendConfigured, requireSupabase } from '../src/services/supabase.js'
import { bloodBankService } from '../src/services/bloodBankService.js'
import { bloodService } from '../src/services/bloodService.js'
import { donorService } from '../src/services/donorService.js'
import { notificationService } from '../src/services/notificationService.js'
import { requestService } from '../src/services/requestService.js'
import { mapProfile, mapRequest } from '../src/services/backendHelpers.js'

const values = new Map()
globalThis.window = {
  crypto: webcrypto,
  location: { origin: 'http://localhost:5173' },
  localStorage: {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  },
}

test('demo data, filters, account, request, profile, history, and notification flows', async () => {
  assert.equal(backendConfigured, false)
  assert.throws(() => requireSupabase(), /backend is not configured/i)

  const bloodBanks = await bloodBankService.search({ group: 'O-', radius: '10' })
  assert.equal(bloodBanks.length, 3)
  assert.equal((await bloodBankService.getById('missing')), null)
  const availability = await bloodService.getAvailability()
  assert.equal(availability.length, 8)
  assert.ok(availability.find((item) => item.group === 'O+').units > 0)

  const filteredRequests = await requestService.list({ group: 'O-', status: 'Open' })
  assert.ok(filteredRequests.length > 0)
  const created = await requestService.create({ patient: 'Test Patient', group: 'A+', units: 1, hospital: 'Test Hospital', location: 'Test City', requiredBy: new Date(Date.now() + 86400000).toISOString(), urgency: 'Normal', contact: '0000000000', info: '' })
  assert.match(created.reference, /^BB-/)
  assert.ok((await requestService.list({ group: 'A+' })).some((item) => item.id === created.id))

  const originalProfile = await donorService.getProfile()
  assert.ok(originalProfile.bloodGroup)
  await donorService.saveProfile({ name: 'Test Donor', phone: '0000000000', city: 'Test City', group: 'A+' })
  assert.equal((await donorService.getProfile()).name, 'Test Donor')
  await donorService.setAvailability('Unavailable')
  assert.equal((await donorService.getProfile()).status, 'Unavailable')
  assert.ok(Array.isArray(await donorService.getHistory()))

  assert.ok((await notificationService.list()).some((item) => !item.read))
  await notificationService.markAllRead()
  assert.ok((await notificationService.list()).every((item) => item.read))

  const email = `test-${Date.now()}@example.test`
  await authService.register({ name: 'Test Account', email, password: 'test-password-123', group: 'O+' })
  assert.equal((await authService.login({ email, password: 'test-password-123' })).email, email)
  await authService.logout()
  assert.equal(authService.getSession(), null)

  assert.equal(mapProfile({ id: 'u1', blood_group: 'O+', donation_count: 2 }).bloodGroup, 'O+')
  assert.equal(mapRequest({ id: 'r1', blood_group: 'B+', status: 'Open' }).group, 'B+')
})
