const Role = require('../models/Role');
const { listRoles, ensureDefaultRoles } = require('../utils/roleService');
const { PERMISSION_CATALOG, MANAGED_ROLE_KEYS } = require('../utils/permissions');
const { recordAudit } = require('../utils/auditLog');

// @desc  List this builder's roles and their permissions (seeding system
//        defaults first if this builder doesn't have Role rows yet)
// @route GET /api/roles
const getRoles = async (req, res) => {
  try {
    const roles = await listRoles(req.builderId);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Replace a role's permission set for this builder
// @route PUT /api/roles/:key
const updateRolePermissions = async (req, res) => {
  try {
    const { key } = req.params;
    if (!MANAGED_ROLE_KEYS.includes(key)) {
      return res.status(400).json({ message: `Unknown or unmanaged role: ${key}` });
    }

    const { permissions } = req.body;
    if (!Array.isArray(permissions) || !permissions.every((p) => PERMISSION_CATALOG.includes(p))) {
      return res.status(400).json({ message: 'permissions must be an array of known permission keys' });
    }

    await ensureDefaultRoles(req.builderId);
    const role = await Role.findOneAndUpdate(
      { builderId: req.builderId, key },
      { $set: { permissions } },
      { new: true, runValidators: true }
    );

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'role_permissions_updated',
      targetType: 'Role',
      targetId: role._id,
      metadata: { key, permissions },
    });

    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRoles, updateRolePermissions };
