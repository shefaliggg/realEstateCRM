// The Platform Portal (inviting/managing builder orgs) lives in a separate app
// now (see admin-frontend/) — this SPA is builder-org-only, so it only ever
// deals with the products below.
export const PRODUCTS = [
  {
    id: 'crm',
    label: 'Workspace',
    homePath: '/dashboard',
    // Single consolidated workspace for every internal role — CRM and
    // Marketing used to be two switchable "apps"; they're now one sidebar
    // (frontend/src/config/nav.js STAFF_NAV), filtered per role by the
    // module-permission system, not by which product they're in.
    roles: [
      'builder_admin',
      'sales_manager', 'sales_executive', 'crm_manager', 'crm_executive',
      'marketing_manager', 'marketing_executive',
    ],
  },
  {
    id: 'partner',
    label: 'Channel Partner Portal',
    homePath: '/partner',
    // builder_admin can still reach this directly (see requireChannelPartner's
    // preview carve-out and App.jsx's PARTNER_ROLES) but it's deliberately
    // not offered in the product switcher anymore — "hide other apps".
    roles: ['partner_admin', 'partner_agent'],
  },
  {
    id: 'customer',
    label: 'Customer Portal',
    homePath: '/customer-portal',
    // Same as 'partner' above — builder_admin keeps route access, not a
    // switcher entry.
    roles: ['customer'],
  },
]

export function getAvailableProducts(role) {
  return PRODUCTS.filter((p) => p.roles.includes(role))
}

export function getDefaultProduct(role) {
  return PRODUCTS.find((p) => p.roles.includes(role)) ?? PRODUCTS[0]
}

export function getProductForPath(pathname) {
  if (pathname === '/partner' || pathname.startsWith('/partner/')) return PRODUCTS.find((p) => p.id === 'partner')
  if (pathname === '/customer-portal' || pathname.startsWith('/customer-portal/')) return PRODUCTS.find((p) => p.id === 'customer')
  return PRODUCTS.find((p) => p.id === 'crm')
}
