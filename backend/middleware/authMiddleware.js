const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }
    // Stashed for attachTenantScope (backend/middleware/tenantMiddleware.js),
    // which resolves req.builderId/req.effectiveRole from these claims.
    req.tokenClaims = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Org-tier role checks read req.effectiveRole (set by attachTenantScope from
// the active Membership), not req.user.role — a person's role can differ
// per builder, so it's never reliably on the User doc itself.
const adminOnly = (req, res, next) => {
  if (req.effectiveRole !== 'builder_admin') {
    return res.status(403).json({ message: 'Access denied: builder admins only' });
  }
  next();
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.effectiveRole || !roles.includes(req.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  next();
};

// DB-backed replacement for allowRoles(...) allowlists — checks the current
// builder's per-role permission set (req.permissions, set by
// attachTenantScope) rather than a hardcoded role list. builder_admin always
// passes so admins can never lock themselves out by misconfiguring their own
// role's permissions.
const requirePermission = (key) => (req, res, next) => {
  if (req.effectiveRole === 'builder_admin') return next();
  if (!req.permissions?.has(key)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  next();
};

// Channel partners (both partner_admin and partner_agent) use this normally;
// builder admins are also let through so they can preview the portal from
// the product switcher. Admin requests won't have a linked ChannelPartner
// record — controllers must handle req.membership.channelPartner being
// unset rather than assuming it's always present.
const requireChannelPartner = (req, res, next) => {
  if (!['partner_admin', 'partner_agent', 'builder_admin'].includes(req.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied: channel partners only' });
  }
  next();
};

// Partner-org-admin-only actions (inviting/managing agents, assigning
// leads) — partner_agent is excluded. builder_admin is let through for the
// same portal-preview reason requireChannelPartner allows it.
const requirePartnerAdmin = (req, res, next) => {
  if (!['partner_admin', 'builder_admin'].includes(req.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied: partner admins only' });
  }
  next();
};

// Customers use this normally; builder admins are also let through so they
// can preview the portal, same carve-out as requireChannelPartner. Admin
// requests won't have a linked Customer record — controllers must handle
// req.membership.customer being unset rather than assuming it's always present.
const requireCustomer = (req, res, next) => {
  if (!['customer', 'builder_admin'].includes(req.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied: customers only' });
  }
  next();
};

// Guards internal staff endpoints from every external user type (channel
// partners and customers) — req.userType is set by attachTenantScope from
// the resolved role, so this covers both tiers uniformly rather than
// listing role strings. Channel partners only ever talk to /api/partner/*
// and customers only to /api/customer-portal/*; /api/channel-partners is
// staff-only via allowRoles — this covers every other resource route.
const blockExternalUsers = (req, res, next) => {
  if (req.userType !== 'INTERNAL') {
    return res.status(403).json({ message: 'Access denied: not available to this account type' });
  }
  next();
};

// Platform-tier guards for /api/platform/* — these never go through
// attachTenantScope's membership branch, so they check req.user.role directly.
const platformAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'platform_admin') {
    return res.status(403).json({ message: 'Access denied: PropVault platform admins only' });
  }
  next();
};

const platformStaffOnly = (req, res, next) => {
  if (!['platform_admin', 'platform_staff'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied: PropVault platform staff only' });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  allowRoles,
  requirePermission,
  requireChannelPartner,
  requirePartnerAdmin,
  requireCustomer,
  blockExternalUsers,
  platformAdminOnly,
  platformStaffOnly,
};
