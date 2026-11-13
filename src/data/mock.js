// Mock data for UI display only. Replaced by backend responses later.
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const URGENCY = ['Critical', 'Urgent', 'Normal']

const stock = (v) => Object.fromEntries(BLOOD_GROUPS.map((g, i) => [g, v[i]]))

export const bloodBanks = [
  { id: 'bb1', name: 'City Central Blood Bank', area: 'Shivajinagar', city: 'Pune', distance: 2.4, phone: '020 5550 0101', hours: 'Open 24 hours', address: '12 Station Road, Shivajinagar', stock: stock([14, 3, 9, 0, 4, 1, 22, 5]) },
  { id: 'bb2', name: 'Sahyadri Hospital Blood Centre', area: 'Deccan', city: 'Pune', distance: 4.1, phone: '020 5550 0102', hours: '8 am – 10 pm', address: '45 Karve Road, Deccan', stock: stock([6, 0, 12, 2, 0, 0, 10, 1]) },
  { id: 'bb3', name: 'Red Cross Blood Bank', area: 'Camp', city: 'Pune', distance: 6.8, phone: '020 5550 0103', hours: '9 am – 6 pm', address: '7 MG Road, Camp', stock: stock([20, 6, 15, 4, 8, 2, 30, 9]) },
  { id: 'bb4', name: 'Ruby Care Blood Storage', area: 'Wakad', city: 'Pune', distance: 12.5, phone: '020 5550 0104', hours: '9 am – 8 pm', address: '3 Datta Mandir Road, Wakad', stock: stock([2, 1, 5, 0, 1, 0, 7, 0]) },
  { id: 'bb5', name: 'Mumbai General Blood Centre', area: 'Dadar', city: 'Mumbai', distance: 148, phone: '022 5550 0105', hours: 'Open 24 hours', address: '22 Tilak Road, Dadar', stock: stock([18, 5, 11, 3, 6, 2, 25, 7]) },
]

export const requests = [
  { id: 'r1', group: 'O-', units: 3, hospital: 'Sahyadri Hospital', location: 'Deccan, Pune', urgency: 'Critical', status: 'Open', requiredBy: 'Today, 6:00 pm' },
  { id: 'r2', group: 'B+', units: 2, hospital: 'Ruby Hall Clinic', location: 'Sassoon Road, Pune', urgency: 'Urgent', status: 'Open', requiredBy: 'Tomorrow, 10:00 am' },
  { id: 'r3', group: 'A+', units: 1, hospital: 'KEM Hospital', location: 'Rasta Peth, Pune', urgency: 'Normal', status: 'In progress', requiredBy: '16 Nov, 12:00 pm' },
  { id: 'r4', group: 'AB-', units: 2, hospital: 'Jehangir Hospital', location: 'Sassoon Road, Pune', urgency: 'Urgent', status: 'Fulfilled', requiredBy: '12 Nov, 4:00 pm' },
]

export const notifications = [
  { id: 'n1', type: 'Emergency request', text: 'Critical need for O- blood at Sahyadri Hospital, Deccan.', time: '10 min ago', read: false },
  { id: 'n2', type: 'Donor response', text: 'A donor has offered to help with your request for B+ blood.', time: '2 hours ago', read: false },
  { id: 'n3', type: 'Request update', text: 'Your request for A+ blood is now in progress.', time: 'Yesterday', read: true },
  { id: 'n4', type: 'Donation reminder', text: 'You are eligible to donate whole blood again.', time: '3 days ago', read: true },
]

export const donorProfile = { bloodGroup: 'O+', status: 'Available', lastDonation: '14 Aug 2026', donationCount: 4 }

export const donations = [
  { id: 'd1', date: '14 Aug 2026', place: 'City Central Blood Bank', type: 'Whole blood', units: 1 },
  { id: 'd2', date: '10 Apr 2026', place: 'Red Cross Blood Bank', type: 'Whole blood', units: 1 },
  { id: 'd3', date: '02 Dec 2025', place: 'Sahyadri Hospital Blood Centre', type: 'Whole blood', units: 1 },
  { id: 'd4', date: '20 Jul 2025', place: 'Red Cross Blood Bank', type: 'Whole blood', units: 1 },
]
