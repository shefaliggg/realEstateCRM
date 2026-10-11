const Customer = require('../models/Customer')

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '').slice(-10)

const findExistingCustomer = async (builderId, { phone, email }) => {
  const or = []
  const normalized = normalizePhone(phone)
  if (normalized.length >= 10) or.push({ phoneNormalized: normalized })
  if (phone && String(phone).trim()) or.push({ phone: String(phone).trim() })
  if (email && String(email).trim()) or.push({ email: String(email).trim().toLowerCase() })
  if (or.length === 0) return null
  return Customer.findOne({ builderId, $or: or })
}

module.exports = { normalizePhone, findExistingCustomer }
