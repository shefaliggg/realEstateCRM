const Role = require('../models/Role');
const { MANAGED_ROLE_KEYS, getDefaultPermissions } = require('./permissions');

const humanize = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Idempotently creates the 7 system Role rows for a builder if any are
// missing (new builder, or a builder created before this system existed).
// No standalone migration script needed — this covers both cases lazily.
const ensureDefaultRoles = async (builderId) => {
  const existing = await Role.find({ builderId }).select('key');
  const existingKeys = new Set(existing.map((r) => r.key));
  const missing = MANAGED_ROLE_KEYS.filter((key) => !existingKeys.has(key));
  if (missing.length === 0) return;

  await Role.insertMany(
    missing.map((key) => ({
      builderId,
      key,
      name: humanize(key),
      isSystem: true,
      permissions: getDefaultPermissions(key),
    })),
    { ordered: false }
  ).catch(() => {
    // Ignore duplicate-key races from concurrent requests seeding the same
    // builder at once — whichever insert won is sufficient.
  });
};

const listRoles = async (builderId) => {
  await ensureDefaultRoles(builderId);
  return Role.find({ builderId }).sort({ key: 1 });
};

// Used by tenantMiddleware (per-request) and authController (session
// responses) so both resolve permissions the exact same way.
const resolveEffectivePermissions = async (builderId, roleKey) => {
  if (!MANAGED_ROLE_KEYS.includes(roleKey)) return [];
  await ensureDefaultRoles(builderId);
  const role = await Role.findOne({ builderId, key: roleKey }).select('permissions');
  return role ? role.permissions : getDefaultPermissions(roleKey);
};

module.exports = { ensureDefaultRoles, listRoles, resolveEffectivePermissions };
