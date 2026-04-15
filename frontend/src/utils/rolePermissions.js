export const ROLE_OPTIONS = [
  'admin',
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
  'Email Marketing',
  'WhatsApp Marketing',
  'SMS Marketing',
  'Social Media',
  'Content & SEO',
  'Paid Ads',
  'AI Calling',
  'Marketing Analytics',
]

const STORAGE_KEY = 'role-module-permissions'

function createDefaultRolePermissions() {
  const config = {}
  for (const role of ROLE_OPTIONS) {
    config[role] = {}
    for (const module of MODULE_OPTIONS) {
      config[role][module] = true
    }
  }
  return config
}

function readConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultRolePermissions()

    const parsed = JSON.parse(raw)
    const defaults = createDefaultRolePermissions()

    for (const role of ROLE_OPTIONS) {
      const source = parsed?.[role]
      if (!source || typeof source !== 'object') continue
      for (const module of MODULE_OPTIONS) {
        if (typeof source[module] === 'boolean') {
          defaults[role][module] = source[module]
        }
      }
    }

    return defaults
  } catch {
    return createDefaultRolePermissions()
  }
}

function writeConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getRoleModulePermissions(role) {
  const config = readConfig()
  return config[role] ?? config.sales_executive ?? {}
}

export function saveRoleModulePermissions(role, modulePermissions) {
  const config = readConfig()
  config[role] = {
    ...(config[role] ?? {}),
    ...modulePermissions,
  }
  writeConfig(config)
  window.dispatchEvent(new Event('role-permissions-updated'))
}
