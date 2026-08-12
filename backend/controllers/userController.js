const Membership = require('../models/Membership');
const { ROLE_ENUM } = require('../models/User');
const { generateTempPassword } = require('../utils/security');
const { recordAudit } = require('../utils/auditLog');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { createInvitedUser, buildLoginLink, sendInviteMail } = require('../utils/inviteUser');
const { getRequestOrigin } = require('../utils/requestOrigin');

const USER_POPULATE_FIELDS = 'name email phone isActive passwordSet emailVerified';

// This entire file operates within req.builderId (see backend/middleware/tenantMiddleware.js) —
// "user" here always means "member of the current builder org", i.e. a Membership row.
// The :id route params below refer to a Membership id, not a User id, since a
// person's role/status is scoped per builder, not global to their account.
const sanitizeMembership = (membership) => ({
  membershipId: membership._id,
  role: membership.role,
  status: membership.status,
  inviteStatus: membership.inviteStatus,
  invitedBy: membership.invitedBy,
  activatedAt: membership.activatedAt,
  createdAt: membership.createdAt,
  updatedAt: membership.updatedAt,
  user: membership.userId ? sanitizeUser(membership.userId) : null,
});

// @desc  Get all members of the current builder org (builder_admin only)
// @route GET /api/users
const getUsers = async (req, res) => {
  try {
    const memberships = await Membership.find({ builderId: req.builderId })
      .sort({ createdAt: -1 })
      .populate('userId', USER_POPULATE_FIELDS);
    res.json(memberships.map(sanitizeMembership));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get one member of the current builder org by membership id
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const membership = await Membership.findOne({ _id: req.params.id, builderId: req.builderId }).populate(
      'userId',
      USER_POPULATE_FIELDS
    );
    if (!membership) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeMembership(membership));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update a member's role/status within the current builder org
// @route PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    const membership = await Membership.findOne({ _id: req.params.id, builderId: req.builderId }).populate(
      'userId',
      USER_POPULATE_FIELDS
    );
    if (!membership) return res.status(404).json({ message: 'User not found' });

    if (role !== undefined) {
      if (!ROLE_ENUM.includes(role)) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
      membership.role = role;
    }

    if (isActive !== undefined) {
      // Deactivating here revokes access to THIS org only — the account
      // itself (and any other builder memberships it holds) is untouched.
      membership.status = isActive ? 'active' : 'revoked';
    }

    await membership.save();

    if (name !== undefined || phone !== undefined) {
      if (name !== undefined) membership.userId.name = name;
      if (phone !== undefined) membership.userId.phone = phone;
      await membership.userId.save();
    }

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'user_updated',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { name, role, isActive },
    });

    res.json(sanitizeMembership(membership));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Remove a member from the current builder org. This deletes the
//        Membership only — the underlying account (and its access to any
//        other builder org) is untouched.
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const membership = await Membership.findOneAndDelete({ _id: req.params.id, builderId: req.builderId });
    if (!membership) return res.status(404).json({ message: 'User not found' });

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'user_removed',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: {},
    });

    res.json({ message: 'User removed from organization' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Invite a team member into the current builder org (builder_admin only)
// @route POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Please fill name, email and role' });
    }

    if (!ROLE_ENUM.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const { user, membership, tempPassword, mailResult, joiningExistingAccount } = await createInvitedUser({
      name,
      email,
      role,
      builderId: req.builderId,
      invitedBy: req.user._id,
      origin: getRequestOrigin(req),
    });

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'invite_created',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { email: user.email, role },
    });

    res.status(201).json({
      user: sanitizeMembership({ ...membership.toObject(), userId: user }),
      joiningExistingAccount,
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        // Dev convenience only — in production this only ever goes out by email.
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc  List pending invites for the current builder org
// @route GET /api/users/invites/pending
const getPendingInvites = async (req, res) => {
  try {
    const memberships = await Membership.find({
      builderId: req.builderId,
      inviteStatus: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('userId', USER_POPULATE_FIELDS);
    res.json(memberships.map(sanitizeMembership));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Resend invite for a pending membership
// @route POST /api/users/:id/resend-invite
const resendInvite = async (req, res) => {
  try {
    const membership = await Membership.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('userId', USER_POPULATE_FIELDS)
      .populate('builderId', 'name');
    if (!membership) return res.status(404).json({ message: 'User not found' });

    if (membership.status === 'active') {
      return res.status(400).json({ message: 'User has already completed onboarding' });
    }

    const user = membership.userId;
    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.passwordSet = true;
    user.mustChangePassword = true;
    await user.save();

    membership.status = 'invited';
    membership.inviteStatus = 'pending';
    await membership.save();

    const loginLink = buildLoginLink(getRequestOrigin(req));
    const mailResult = await sendInviteMail({
      email: user.email,
      name: user.name,
      role: membership.role,
      builderName: membership.builderId?.name,
      tempPassword,
      loginLink,
      joiningExistingAccount: false,
    });

    res.json({
      message: 'Invite resent',
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Revoke a pending invite / membership
// @route POST /api/users/:id/revoke-invite
const revokeInvite = async (req, res) => {
  try {
    const membership = await Membership.findOne({ _id: req.params.id, builderId: req.builderId });
    if (!membership) return res.status(404).json({ message: 'User not found' });

    if (membership.status === 'active') {
      return res.status(400).json({ message: 'Cannot revoke an already accepted invite' });
    }

    membership.status = 'revoked';
    membership.inviteStatus = 'revoked';
    await membership.save();

    res.json({ message: 'Invite revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getPendingInvites,
  resendInvite,
  revokeInvite,
};
