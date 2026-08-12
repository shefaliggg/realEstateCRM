const Membership = require('../models/Membership');
const Builder = require('../models/Builder');
const { isPlatformRole } = require('../models/User');
const { resolveEffectivePermissions } = require('../utils/roleService');
const { getUserType } = require('../utils/userType');

// Runs immediately after `protect`. Resolves which organization (if any) the
// current request is acting on, and the role that applies within it.
//
// Platform-tier users (platform_admin/platform_staff) never have a builder
// scope — req.builderId stays null and req.effectiveRole is just their
// account role.
//
// Org-tier users carry no role/builderId on the User doc itself (a person can
// belong to multiple builders under one login — see Membership model), so the
// active organization is resolved fresh from the Membership named by the
// JWT's membershipId, re-checked against the DB on every request so a
// revoked membership or a suspended builder is denied immediately rather
// than only once the token expires.
const attachTenantScope = async (req, res, next) => {
  try {
    if (isPlatformRole(req.user.role)) {
      req.builderId = null;
      req.effectiveRole = req.user.role;
      req.userType = getUserType(req.user.role);
      req.membership = null;
      req.permissions = new Set();
      return next();
    }

    const { builderId, membershipId } = req.tokenClaims || {};
    if (!builderId || !membershipId) {
      return res.status(403).json({ message: 'No organization selected for this session' });
    }

    const membership = await Membership.findOne({
      _id: membershipId,
      userId: req.user._id,
      builderId,
      status: 'active',
    });
    if (!membership) {
      return res.status(403).json({ message: 'Access denied: organization membership is not active' });
    }

    const builder = await Builder.findById(builderId).select('status');
    if (!builder || builder.status !== 'active') {
      return res.status(403).json({ message: 'Access denied: organization is suspended' });
    }

    // Legacy role value from before the partner_admin/partner_agent split —
    // upgrade in place on first read so every existing partner keeps today's
    // org-wide visibility (see backend/models/User.js ROLE_ENUM comment).
    if (membership.role === 'channel_partner') {
      membership.role = 'partner_admin';
      await membership.save();
    }

    req.builderId = String(membership.builderId);
    req.effectiveRole = membership.role;
    req.userType = getUserType(membership.role);
    req.membership = membership;
    req.permissions = new Set(await resolveEffectivePermissions(req.builderId, membership.role));
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Applied to every builder-facing router (CRM/Projects/Leads/etc.) so
// platform staff can never hit them, even by accident.
const requireBuilderScope = (req, res, next) => {
  if (!req.builderId) {
    return res.status(403).json({ message: 'Access denied: this endpoint requires an organization context' });
  }
  next();
};

module.exports = { attachTenantScope, requireBuilderScope };
