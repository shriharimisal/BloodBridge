import { backendConfigured, requireSupabase } from './supabase.js'

export async function currentUserId() {
  if (!backendConfigured) return null
  const { data, error } = await requireSupabase().auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Please log in to continue.')
  return data.user.id
}

export function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    group: row.blood_group,
    bloodGroup: row.blood_group,
    status: row.status,
    lastDonation: row.last_donation ? new Date(`${row.last_donation}T00:00:00`).toLocaleDateString() : 'No donations yet',
    donationCount: row.donation_count || 0,
  }
}

export function mapRequest(row) {
  return {
    id: row.id,
    group: row.blood_group,
    units: row.units,
    hospital: row.hospital,
    location: row.location,
    requiredBy: new Date(row.required_by).toLocaleString(),
    urgency: row.urgency,
    status: row.status,
  }
}
