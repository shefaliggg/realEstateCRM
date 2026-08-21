const parseArrayField = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return []
  try {
    const parsed = JSON.parse(trimmed)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }
}

// Nested groups (location, pricing, documents, etc.) are stored as plain embedded objects, so a
// findOneAndUpdate $set on the group key replaces the whole object and silently drops any sibling
// fields the request didn't include. Flattening to dot-notation before an update makes each
// sub-field an independent $set target instead of clobbering siblings on a partial edit. Only safe
// for updates — the `new Model(...)` constructor used on create does not expand dot-notation keys.
const flattenNestedGroupsForUpdate = (payload, groupKeys) => {
  groupKeys.forEach((key) => {
    const value = payload[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => { payload[`${key}.${subKey}`] = subValue })
      delete payload[key]
    }
  })
  return payload
}

module.exports = { parseArrayField, flattenNestedGroupsForUpdate }
