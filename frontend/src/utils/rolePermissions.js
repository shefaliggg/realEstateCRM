import api from '../api/axios'

export const ROLE_OPTIONS = [
  'builder_admin',
  'sales_manager',
  'sales_executive',
  'crm_manager',
  'crm_executive',
  'marketing_manager',
  'marketing_executive',
]

export const MODULE_OPTIONS = [
  'Dashboard',
  'Projects',
  'Leads',
  'Deals',
  'Site Visits',
  'Channel Partners',
  'Post-Sales',
  'Users & Roles',
  'Reports',
  'Campaigns',
  'Lead Generation',
  'Settings',
  'Email Marketing',
  'WhatsApp Marketing',
  'SMS Marketing',
  'Social Media',
  'Content & SEO',
  'Paid Ads',
  'AI Calling',
  'Marketing Analytics',
]

// Backend permission key for a nav module — must match
// backend/utils/permissions.js's MODULE_PERMISSION_KEYS.
export const moduleKey = (module) => `module:${module}`

// permissions: the flat permission-key array on the authenticated user
// (AuthContext's user.permissions, sourced from the backend Role for their
// current membership — see backend/utils/roleService.js).
export function hasModuleAccess(permissions, module) {
  return Boolean(permissions?.includes(moduleKey(module)))
}

// GET /api/roles — this builder's 7 roles with their permission arrays.
export async function fetchRoles() {
  const { data } = await api.get('/roles')
  return data
}

// PUT /api/roles/:key — replace one role's full permission array.
export async function updateRolePermissions(roleKey, permissions) {
  const { data } = await api.put(`/roles/${roleKey}`, { permissions })
  return data
}
