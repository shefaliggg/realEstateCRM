const LEAD_LISTS_KEY = 'mk-lead-lists-v1'

const DEFAULT_LISTS = [
  {
    id: 'll-default',
    name: 'Default Lead List',
    description: 'Initial lead list for marketing lead generation.',
    createdAt: new Date().toISOString(),
    leads: [],
  },
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeLead(lead = {}) {
  return {
    id: lead.id ?? `lead-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: lead.name ?? '',
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    address: lead.address ?? '',
    company: lead.company ?? '',
    source: lead.source ?? 'Manual',
    notes: lead.notes ?? '',
    createdAt: lead.createdAt ?? new Date().toISOString(),
  }
}

function normalizeList(list = {}) {
  return {
    id: list.id,
    name: list.name ?? 'Untitled List',
    description: list.description ?? '',
    createdAt: list.createdAt ?? new Date().toISOString(),
    leads: Array.isArray(list.leads) ? list.leads.map(normalizeLead) : [],
  }
}

export function getLeadLists() {
  const saved = readJson(LEAD_LISTS_KEY, DEFAULT_LISTS)
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_LISTS
  return saved.map(normalizeList)
}

export function saveLeadLists(lists) {
  const normalized = Array.isArray(lists) && lists.length > 0
    ? lists.map(normalizeList)
    : DEFAULT_LISTS
  writeJson(LEAD_LISTS_KEY, normalized)
  return normalized
}

export function createLeadList(payload) {
  const lists = getLeadLists()
  const next = {
    id: `ll-${Date.now()}`,
    name: payload?.name?.trim() || `Lead List ${lists.length + 1}`,
    description: payload?.description?.trim() || '',
    createdAt: new Date().toISOString(),
    leads: [],
  }
  lists.unshift(next)
  saveLeadLists(lists)
  return next
}

export function addLeadsToList(listId, incomingLeads) {
  const leads = Array.isArray(incomingLeads) ? incomingLeads.map(normalizeLead) : []
  if (!listId || leads.length === 0) return null

  const lists = getLeadLists()
  const targetIndex = lists.findIndex((list) => list.id === listId)
  if (targetIndex === -1) return null

  lists[targetIndex] = {
    ...lists[targetIndex],
    leads: [...leads, ...lists[targetIndex].leads],
  }
  saveLeadLists(lists)
  return lists[targetIndex]
}

export function parseCsvLeads(csvText) {
  if (!csvText?.trim()) return []

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const rows = lines.slice(1)

  return rows
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim())
      const row = {}
      headers.forEach((key, idx) => {
        row[key] = cols[idx] ?? ''
      })

      return normalizeLead({
        name: row.name || row.fullname || row.contact || '',
        phone: row.phone || row.mobile || row.whatsapp || '',
        email: row.email || '',
        address: row.address || row.location || '',
        company: row.company || row.business || '',
        source: row.source || 'CSV Import',
        notes: row.notes || '',
      })
    })
    .filter((lead) => lead.name || lead.phone || lead.email)
}

export function parseGoogleMapsText(rawText) {
  if (!rawText?.trim()) return []

  const blocks = rawText
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)

  const phonePattern = /(\+?\d[\d\s()\-]{7,}\d)/
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

  return blocks
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (lines.length === 0) return null

      const name = lines[0]
      const joined = lines.join(' | ')
      const phoneMatch = joined.match(phonePattern)
      const emailMatch = joined.match(emailPattern)

      const addressCandidate = lines.find((line) => /\d/.test(line) && /,|street|road|nagar|city|sector/i.test(line))
        || lines[1]
        || ''

      return normalizeLead({
        name,
        phone: phoneMatch?.[0] ?? '',
        email: emailMatch?.[0] ?? '',
        address: addressCandidate,
        source: 'Google Maps',
      })
    })
    .filter((lead) => lead && (lead.name || lead.phone || lead.email))
}
