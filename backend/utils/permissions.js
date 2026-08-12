const { ROLE_ENUM } = require('../models/User');

// One key per nav module (kept identical to frontend/src/utils/rolePermissions.js
// MODULE_OPTIONS, prefixed so they can't collide with action keys below) plus
// two action keys that already existed as hardcoded adminOnly gates.
const MODULE_OPTIONS = [
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
];

const MODULE_PERMISSION_KEYS = MODULE_OPTIONS.map((m) => `module:${m}`);

const ACTION_PERMISSION_KEYS = ['manage_inventory', 'manage_users'];

const PERMISSION_CATALOG = [...MODULE_PERMISSION_KEYS, ...ACTION_PERMISSION_KEYS];

// Roles this permission system governs. External roles — the channel-partner
// tier (partner_admin/partner_agent, plus the legacy channel_partner value)
// and the customer tier — are deliberately excluded. They're authorized via
// requireChannelPartner/requirePartnerAdmin/requireCustomer against
// structurally different route sets (the partner and customer portals), not
// the internal module list.
const EXTERNAL_ROLE_KEYS = ['partner_admin', 'partner_agent', 'channel_partner', 'customer'];
const MANAGED_ROLE_KEYS = ROLE_ENUM.filter((r) => !EXTERNAL_ROLE_KEYS.includes(r));

const SALES_TRACK_ROLE_KEYS = ['sales_manager', 'sales_executive', 'crm_manager', 'crm_executive'];
const MARKETING_TRACK_ROLE_KEYS = ['marketing_manager', 'marketing_executive'];

const SALES_TRACK_MODULES = [
  'module:Dashboard',
  'module:Projects',
  'module:Leads',
  'module:Deals',
  'module:Site Visits',
  'module:Channel Partners',
  'module:Post-Sales',
  'module:Reports',
];

// Leads is shared with the sales track — marketing needs visibility into
// marketing-attributed leads (see the original PropVault spec's "Marketing:
// Create/View Marketing leads"). Only the 4 modules with a real page
// (frontend/src/config/nav.js's Marketing sub-list) default on; the rest of
// MODULE_OPTIONS' marketing entries stay valid catalog/toggle keys but
// aren't enabled by default since there's no page behind them yet.
const MARKETING_TRACK_MODULES = [
  'module:Dashboard',
  'module:Projects',
  'module:Leads',
  'module:Reports',
  'module:Campaigns',
  'module:Lead Generation',
  'module:Settings',
  'module:Email Marketing',
];

// builder_admin gets everything; internal staff default to their track's
// modules only (not the two admin-only action keys either) — the single
// consolidated staff sidebar relies on this split now that CRM and
// Marketing are no longer separate role-gated frontend apps.
const getDefaultPermissions = (roleKey) => {
  if (roleKey === 'builder_admin') return [...PERMISSION_CATALOG];
  if (MARKETING_TRACK_ROLE_KEYS.includes(roleKey)) return [...MARKETING_TRACK_MODULES];
  if (SALES_TRACK_ROLE_KEYS.includes(roleKey)) return [...SALES_TRACK_MODULES];
  return [];
};

module.exports = {
  MODULE_OPTIONS,
  MODULE_PERMISSION_KEYS,
  ACTION_PERMISSION_KEYS,
  PERMISSION_CATALOG,
  MANAGED_ROLE_KEYS,
  getDefaultPermissions,
};
