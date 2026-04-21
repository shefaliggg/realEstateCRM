const PARTNERS_KEY = 'channel-partners-v1'
const PARTNER_LEADS_KEY = 'channel-partner-leads-v1'
const PARTNER_PAYOUTS_KEY = 'channel-partner-payouts-v1'

const DEFAULT_PARTNERS = [
  {
    id: 'cp-1',
    name: 'Skyline Realty Associates',
    contactPerson: 'Anuj Verma',
    phone: '+91 98765 11001',
    email: 'anuj@skylinerealty.in',
    city: 'Hyderabad',
    commissionRate: 1.5,
    active: true,
    joinedAt: '2026-01-15',
  },
  {
    id: 'cp-2',
    name: 'Prime Key Consultants',
    contactPerson: 'Nidhi Rao',
    phone: '+91 98765 11002',
    email: 'nidhi@primekey.in',
    city: 'Bengaluru',
    commissionRate: 1.25,
    active: true,
    joinedAt: '2026-02-08',
  },
  {
    id: 'cp-3',
    name: 'Urban Nest Partners',
    contactPerson: 'Rahul Sethi',
    phone: '+91 98765 11003',
    email: 'rahul@urbannest.in',
    city: 'Pune',
    commissionRate: 1.1,
    active: false,
    joinedAt: '2025-11-21',
  },
]

const DEFAULT_PAYOUTS = [
  {
    id: 'pay-1',
    partnerId: 'cp-1',
    dealRef: 'DL-2031',
    projectName: 'VMR Azure',
    amount: 180000,
    status: 'Paid',
    dueDate: '2026-03-10',
    paidDate: '2026-03-08',
  },
  {
    id: 'pay-2',
    partnerId: 'cp-2',
    dealRef: 'DL-2044',
    projectName: 'Eden Towers',
    amount: 135000,
    status: 'Pending',
    dueDate: '2026-04-25',
    paidDate: '',
  },
  {
    id: 'pay-3',
    partnerId: 'cp-1',
    dealRef: 'DL-2049',
    projectName: 'Green Arc',
    amount: 220000,
    status: 'Processing',
    dueDate: '2026-04-30',
    paidDate: '',
  },
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getPartners() {
  const data = readJson(PARTNERS_KEY, DEFAULT_PARTNERS)
  if (!localStorage.getItem(PARTNERS_KEY)) {
    writeJson(PARTNERS_KEY, data)
  }
  return data
}

export function savePartners(partners) {
  writeJson(PARTNERS_KEY, partners)
}

export function getPartnerLeadLinks() {
  return readJson(PARTNER_LEADS_KEY, [])
}

export function savePartnerLeadLinks(links) {
  writeJson(PARTNER_LEADS_KEY, links)
}

export function getPartnerPayouts() {
  const data = readJson(PARTNER_PAYOUTS_KEY, DEFAULT_PAYOUTS)
  if (!localStorage.getItem(PARTNER_PAYOUTS_KEY)) {
    writeJson(PARTNER_PAYOUTS_KEY, data)
  }
  return data
}

export function savePartnerPayouts(payouts) {
  writeJson(PARTNER_PAYOUTS_KEY, payouts)
}
