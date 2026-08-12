const { isPlatformRole } = require('../models/User');

const PARTNER_ROLE_KEYS = ['partner_admin', 'partner_agent'];
const CUSTOMER_ROLE_KEYS = ['customer'];

// Derived from the resolved role rather than stored — a person's type
// already varies per Membership in this codebase (role/builderId are
// resolved per-request, never fixed on User), so a single stored field on
// User would drift. Computed the same way req.effectiveRole already is.
const getUserType = (role) => {
  if (isPlatformRole(role)) return 'PLATFORM';
  if (PARTNER_ROLE_KEYS.includes(role)) return 'CHANNEL_PARTNER';
  if (CUSTOMER_ROLE_KEYS.includes(role)) return 'CUSTOMER';
  return 'INTERNAL';
};

module.exports = { getUserType, PARTNER_ROLE_KEYS, CUSTOMER_ROLE_KEYS };
