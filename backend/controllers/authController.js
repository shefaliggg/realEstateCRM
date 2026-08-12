const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isPlatformRole } = require('../models/User');
const Membership = require('../models/Membership');
const Builder = require('../models/Builder');
const { isStrongPassword } = require('../utils/security');
const { recordAudit } = require('../utils/auditLog');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { resolveEffectivePermissions } = require('../utils/roleService');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PRE_SELECT_TOKEN_EXPIRES_IN = '10m';
const PASSWORD_RESET_TOKEN_EXPIRES_IN = '15m';

const generateToken = (id, role, builderId, membershipId, expiresIn = JWT_EXPIRES_IN) =>
  jwt.sign({ id, role, builderId, membershipId }, process.env.JWT_SECRET, { expiresIn });

const generatePasswordResetToken = (id) =>
  jwt.sign({ id, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN });

// Shared by login() and setPassword() — both end with "figure out this
// account's session and hand back a token". Platform staff get a token
// immediately; org-tier users with exactly one active builder membership are
// auto-scoped the same way; with more than one, the client must call
// POST /api/auth/select-builder before it gets a fully scoped token.
const buildSessionResponse = async (req, user) => {
  if (isPlatformRole(user.role)) {
    recordAudit({
      actor: user._id,
      action: 'login',
      targetType: 'User',
      targetId: user._id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    return {
      ...sanitizeUser(user),
      role: user.role,
      builderId: null,
      permissions: [],
      token: generateToken(user._id, user.role, null, null),
    };
  }

  const memberships = await Membership.find({ userId: user._id, status: 'active' }).populate(
    'builderId',
    'name slug status'
  );
  const activeMemberships = memberships.filter((m) => m.builderId?.status === 'active');

  if (activeMemberships.length === 0) {
    const err = new Error('No active organization membership found. Contact your administrator.');
    err.statusCode = 403;
    throw err;
  }

  if (activeMemberships.length > 1) {
    return {
      requiresBuilderSelection: true,
      preToken: generateToken(user._id, null, null, null, PRE_SELECT_TOKEN_EXPIRES_IN),
      memberships: activeMemberships.map((m) => ({
        builderId: m.builderId._id,
        builderName: m.builderId.name,
        role: m.role,
        membershipId: m._id,
      })),
    };
  }

  const membership = activeMemberships[0];
  recordAudit({
    builderId: membership.builderId._id,
    actor: user._id,
    action: 'login',
    targetType: 'User',
    targetId: user._id,
    metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
  });

  const permissions = await resolveEffectivePermissions(membership.builderId._id, membership.role);

  return {
    ...sanitizeUser(user),
    role: membership.role,
    builderId: membership.builderId._id,
    builderName: membership.builderId.name,
    membershipId: membership._id,
    permissions,
    token: generateToken(user._id, membership.role, membership.builderId._id, membership._id),
  };
};

// @desc  Role-based login. Accounts still on their invite's temporary
//        password are stopped short of a real session and handed a
//        short-lived resetToken instead — the client must call
//        POST /api/auth/set-password to finish onboarding before it gets in.
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact administrator.' });
    }

    if (user.mustChangePassword) {
      return res.json({
        requiresPasswordChange: true,
        resetToken: generatePasswordResetToken(user._id),
        email: user.email,
      });
    }

    const session = await buildSessionResponse(req, user);
    res.json(session);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc  Complete login when an account has more than one active builder
//        membership (or to switch orgs mid-session). Re-validates the
//        membership fresh rather than trusting the caller.
// @route POST /api/auth/select-builder
const selectBuilder = async (req, res) => {
  try {
    const { builderId } = req.body;
    if (!builderId) {
      return res.status(400).json({ message: 'builderId is required' });
    }

    const membership = await Membership.findOne({
      userId: req.user._id,
      builderId,
      status: 'active',
    }).populate('builderId', 'name slug status');

    if (!membership || membership.builderId?.status !== 'active') {
      return res.status(403).json({ message: 'You do not have access to that organization' });
    }

    recordAudit({
      builderId: membership.builderId._id,
      actor: req.user._id,
      action: 'login',
      targetType: 'User',
      targetId: req.user._id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'], switchedOrg: true },
    });

    const permissions = await resolveEffectivePermissions(membership.builderId._id, membership.role);

    res.json({
      ...sanitizeUser(req.user),
      role: membership.role,
      builderId: membership.builderId._id,
      builderName: membership.builderId.name,
      membershipId: membership._id,
      permissions,
      token: generateToken(req.user._id, membership.role, membership.builderId._id, membership._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  List every active organization the current account belongs to —
//        powers the "switch organization" control (distinct from login's
//        one-time builder-selection step, this is for switching mid-session).
// @route GET /api/auth/memberships
const listMyMemberships = async (req, res) => {
  try {
    if (isPlatformRole(req.user.role)) {
      return res.json([]);
    }
    const memberships = await Membership.find({ userId: req.user._id, status: 'active' }).populate(
      'builderId',
      'name slug status'
    );
    res.json(
      memberships
        .filter((m) => m.builderId?.status === 'active')
        .map((m) => ({ builderId: m.builderId._id, builderName: m.builderId.name, role: m.role, membershipId: m._id }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get current logged-in user's session (account + active org context)
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (isPlatformRole(req.user.role)) {
      return res.json({ ...sanitizeUser(req.user), role: req.user.role, builderId: null, permissions: [] });
    }
    if (!req.membership) {
      return res.status(403).json({ message: 'No organization selected for this session' });
    }
    const membership = await req.membership.populate('builderId', 'name slug status');
    res.json({
      ...sanitizeUser(req.user),
      role: membership.role,
      builderId: membership.builderId._id,
      builderName: membership.builderId.name,
      membershipId: membership._id,
      permissions: [...(req.permissions || [])],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Seed the first PropVault platform admin (disabled by default in production)
// @route POST /api/auth/seed-admin
const seedAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_ADMIN !== 'true') {
      return res.status(403).json({ message: 'Seed admin is disabled in production' });
    }

    const adminExists = await User.findOne({ role: 'platform_admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Platform admin already exists' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character.',
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'platform_admin',
      passwordSet: true,
      emailVerified: true,
      onboardingCompletedAt: new Date(),
    });
    res.status(201).json({
      ...sanitizeUser(admin),
      role: admin.role,
      builderId: null,
      token: generateToken(admin._id, admin.role, null, null),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Complete first-login onboarding: swap the invite's temporary
//        password for a real one, activate any memberships still waiting on
//        this account (and their builder, if this is that org's first admin
//        signing in for the first time), then log the user straight in.
// @route POST /api/auth/set-password
const setPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'This reset link has expired. Please log in again with your temporary password.' });
    }
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character.',
      });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (!user.mustChangePassword) {
      return res.status(400).json({ message: 'Password has already been set for this account. Please log in normally.' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    if (!user.onboardingCompletedAt) user.onboardingCompletedAt = new Date();
    await user.save();

    const invitedMemberships = await Membership.find({ userId: user._id, status: 'invited' });
    for (const membership of invitedMemberships) {
      membership.status = 'active';
      membership.inviteStatus = 'accepted';
      membership.activatedAt = new Date();
      await membership.save();

      if (membership.role === 'builder_admin') {
        const builder = await Builder.findById(membership.builderId);
        if (builder && builder.status === 'pending') {
          builder.status = 'active';
          builder.activatedAt = new Date();
          await builder.save();
        }
      }
    }

    const session = await buildSessionResponse(req, user);
    res.json({ message: 'Password set successfully', ...session });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = {
  login,
  selectBuilder,
  listMyMemberships,
  getMe,
  seedAdmin,
  setPassword,
  sanitizeUser,
  generateToken,
};
