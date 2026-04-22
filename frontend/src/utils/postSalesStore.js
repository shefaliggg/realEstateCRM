// ─── Keys ───────────────────────────────────────────────────────────────────
const CUSTOMERS_KEY   = 'ps-customers-v1'
const BOOKINGS_KEY    = 'ps-bookings-v1'
const SCHEDULES_KEY   = 'ps-schedules-v1'
const PAYMENTS_KEY    = 'ps-payments-v1'
const DOCUMENTS_KEY   = 'ps-documents-v1'
const REFERRALS_KEY   = 'ps-referrals-v1'

// ─── Seed data ───────────────────────────────────────────────────────────────
const DEFAULT_CUSTOMERS = [
  { id: 'cust-1', name: 'Arjun Mehta',     email: 'arjun.mehta@email.com',  phone: '+91 98001 11001', address: 'B-12, MG Road, Bengaluru', createdAt: '2026-01-10' },
  { id: 'cust-2', name: 'Priya Sharma',    email: 'priya.sharma@email.com', phone: '+91 98001 11002', address: '204, Satellite Road, Ahmedabad', createdAt: '2026-02-03' },
  { id: 'cust-3', name: 'Ravi Nair',       email: 'ravi.nair@email.com',    phone: '+91 98001 11003', address: '45, NH-8, Gurugram', createdAt: '2026-03-15' },
]

const DEFAULT_BOOKINGS = [
  { id: 'bk-1', customerId: 'cust-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',    unitNumber: 'A-401', bookingDate: '2026-01-15', totalAmount: 9500000, paidAmount: 2375000, status: 'Active' },
  { id: 'bk-2', customerId: 'cust-2', customerName: 'Priya Sharma', projectName: 'Eden Towers',  unitNumber: 'C-202', bookingDate: '2026-02-10', totalAmount: 7200000, paidAmount: 7200000, status: 'Completed' },
  { id: 'bk-3', customerId: 'cust-3', customerName: 'Ravi Nair',    projectName: 'Green Arc',    unitNumber: 'B-105', bookingDate: '2026-03-20', totalAmount: 6800000, paidAmount: 680000,  status: 'Active' },
]

const DEFAULT_SCHEDULES = [
  { id: 'sch-1', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',   label: 'Booking Amount (10%)',  dueDate: '2026-01-15', amount: 950000,  status: 'Paid' },
  { id: 'sch-2', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',   label: 'On Agreement (15%)',    dueDate: '2026-02-15', amount: 1425000, status: 'Paid' },
  { id: 'sch-3', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',   label: 'On Foundation (25%)',   dueDate: '2026-05-01', amount: 2375000, status: 'Pending' },
  { id: 'sch-4', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',   label: 'On Slab (25%)',         dueDate: '2026-09-01', amount: 2375000, status: 'Pending' },
  { id: 'sch-5', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',   label: 'On Possession (25%)',   dueDate: '2027-03-01', amount: 2375000, status: 'Pending' },
  { id: 'sch-6', bookingId: 'bk-3', customerName: 'Ravi Nair',    projectName: 'Green Arc',   label: 'Booking Amount (10%)',  dueDate: '2026-03-20', amount: 680000,  status: 'Paid' },
  { id: 'sch-7', bookingId: 'bk-3', customerName: 'Ravi Nair',    projectName: 'Green Arc',   label: 'On Agreement (15%)',    dueDate: '2026-04-20', amount: 1020000, status: 'Pending' },
]

const DEFAULT_PAYMENTS = [
  { id: 'pmt-1', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',  amount: 950000,  date: '2026-01-15', mode: 'Online', reference: 'NEFT2031A', note: 'Booking amount cleared' },
  { id: 'pmt-2', bookingId: 'bk-1', customerName: 'Arjun Mehta',  projectName: 'VMR Azure',  amount: 1425000, date: '2026-02-14', mode: 'Cheque', reference: 'CHQ-004812', note: 'Agreement instalment' },
  { id: 'pmt-3', bookingId: 'bk-2', customerName: 'Priya Sharma', projectName: 'Eden Towers', amount: 7200000, date: '2026-03-01', mode: 'NEFT',   reference: 'NEFT5590P', note: 'Full and final payment' },
  { id: 'pmt-4', bookingId: 'bk-3', customerName: 'Ravi Nair',    projectName: 'Green Arc',   amount: 680000,  date: '2026-03-21', mode: 'Online', reference: 'IMPS0031R', note: '' },
]

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', customerId: 'cust-1', customerName: 'Arjun Mehta',  bookingId: 'bk-1', type: 'Agreement',  name: 'Sale Agreement - VMR Azure A-401.pdf',    uploadedAt: '2026-01-16' },
  { id: 'doc-2', customerId: 'cust-1', customerName: 'Arjun Mehta',  bookingId: 'bk-1', type: 'Receipt',    name: 'Payment Receipt - Booking.pdf',           uploadedAt: '2026-01-16' },
  { id: 'doc-3', customerId: 'cust-1', customerName: 'Arjun Mehta',  bookingId: null,   type: 'Aadhar',     name: 'Arjun_Mehta_Aadhar.pdf',                  uploadedAt: '2026-01-10' },
  { id: 'doc-4', customerId: 'cust-2', customerName: 'Priya Sharma', bookingId: 'bk-2', type: 'Agreement',  name: 'Sale Agreement - Eden Towers C-202.pdf',  uploadedAt: '2026-02-12' },
  { id: 'doc-5', customerId: 'cust-2', customerName: 'Priya Sharma', bookingId: null,   type: 'PAN',        name: 'Priya_Sharma_PAN.pdf',                    uploadedAt: '2026-02-03' },
  { id: 'doc-6', customerId: 'cust-3', customerName: 'Ravi Nair',    bookingId: 'bk-3', type: 'NOC',        name: 'NOC - Green Arc B-105.pdf',               uploadedAt: '2026-03-22' },
]

const DEFAULT_REFERRALS = [
  { id: 'ref-1', referrerId: 'cust-1', referrerName: 'Arjun Mehta',  referredName: 'Deepak Joshi',  referredPhone: '+91 90001 22001', date: '2026-03-01', status: 'Converted' },
  { id: 'ref-2', referrerId: 'cust-2', referrerName: 'Priya Sharma', referredName: 'Kavita Reddy',  referredPhone: '+91 90001 22002', date: '2026-03-20', status: 'Contacted' },
  { id: 'ref-3', referrerId: 'cust-1', referrerName: 'Arjun Mehta',  referredName: 'Suresh Patel',  referredPhone: '+91 90001 22003', date: '2026-04-05', status: 'Pending' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch { return fallback }
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── Customers ───────────────────────────────────────────────────────────────
export const getCustomers   = () => read(CUSTOMERS_KEY, DEFAULT_CUSTOMERS)
export const saveCustomers  = (d) => write(CUSTOMERS_KEY, d)

// ─── Bookings ────────────────────────────────────────────────────────────────
export const getBookings    = () => read(BOOKINGS_KEY, DEFAULT_BOOKINGS)
export const saveBookings   = (d) => write(BOOKINGS_KEY, d)

// ─── Payment Schedules ───────────────────────────────────────────────────────
export const getSchedules   = () => read(SCHEDULES_KEY, DEFAULT_SCHEDULES)
export const saveSchedules  = (d) => write(SCHEDULES_KEY, d)

// ─── Payments ────────────────────────────────────────────────────────────────
export const getPayments    = () => read(PAYMENTS_KEY, DEFAULT_PAYMENTS)
export const savePayments   = (d) => write(PAYMENTS_KEY, d)

// ─── Documents ───────────────────────────────────────────────────────────────
export const getDocuments   = () => read(DOCUMENTS_KEY, DEFAULT_DOCUMENTS)
export const saveDocuments  = (d) => write(DOCUMENTS_KEY, d)

// ─── Referrals ───────────────────────────────────────────────────────────────
export const getReferrals   = () => read(REFERRALS_KEY, DEFAULT_REFERRALS)
export const saveReferrals  = (d) => write(REFERRALS_KEY, d)
