import { delay } from './delay'
import { donorProfile, donations } from '../data/mock'
import { readStorage, writeStorage } from './storage'

// TODO(backend): donor profile, availability and donation history endpoints.
export const donorService = {
  getProfile: () => delay(readStorage('profile', donorProfile)),
  setAvailability: (status) => {
    const profile = { ...readStorage('profile', donorProfile), status }
    if (!writeStorage('profile', profile)) return Promise.reject(new Error('Could not save availability.'))
    return delay({ status }, 150)
  },
  getHistory: () => delay(readStorage('donations', donations)),
  saveProfile: (data) => {
    const profile = { ...readStorage('profile', donorProfile), ...data, bloodGroup: data.group || data.bloodGroup }
    if (!writeStorage('profile', profile)) return Promise.reject(new Error('Could not save profile.'))
    return delay({ ok: true, data: profile }, 200)
  },
}
