const User = require('../models/User');
const { ROLE_ENUM } = require('../models/User');
const { generateInviteToken, hashValue } = require('../utils/security');
const { sendMail } = require('../utils/email');

const INVITE_EXPIRY_HOURS = Number(process.env.INVITE_EXPIRY_HOURS || 72);

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  role: user.role,
  isActive: user.isActive,
  passwordSet: user.passwordSet,
  emailVerified: user.emailVerified,
  inviteStatus: user.inviteStatus,
  onboardingCompletedAt: user.onboardingCompletedAt,
  invitedBy: user.invitedBy,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildInviteLink = (token) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontend.replace(/\/$/, '')}/accept-invite/${token}`;
};

const sendInviteMail = async ({ email, name, role, inviteLink, expiresAt }) => {
  const subject = 'You are invited to PropVault CRM';
  const text = [
    `Hello ${name},`,
    '',
    `You have been invited as ${role}.`,
    `Set your password and verify OTP using this link: ${inviteLink}`,
    `Invite expires at: ${expiresAt.toISOString()}`,
  ].join('\n');

  return sendMail({ to: email, subject, text });
};

// @desc  Get all users (admin only)
// @route GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get user by ID
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user
// @route PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (role && !ROLE_ENUM.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.isActive = isActive ?? user.isActive;
    if (phone !== undefined) user.phone = phone;

    const updated = await user.save();
    res.json(sanitizeUser(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete user
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create user (admin only)
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

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const inviteToken = generateInviteToken();
    const inviteTokenHash = hashValue(inviteToken);
    const inviteTokenExpiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      role,
      isActive: true,
      passwordSet: false,
      emailVerified: false,
      inviteStatus: 'pending',
      inviteTokenHash,
      inviteTokenExpiresAt,
      invitedBy: req.user._id,
    });

    const inviteLink = buildInviteLink(inviteToken);
    const mailResult = await sendInviteMail({
      email: user.email,
      name: user.name,
      role: user.role,
      inviteLink,
      expiresAt: inviteTokenExpiresAt,
    });

    res.status(201).json({
      user: sanitizeUser(user),
      invite: {
        expiresAt: inviteTokenExpiresAt,
        delivery: mailResult.sent ? 'email' : 'not_configured',
        link: process.env.NODE_ENV === 'production' ? undefined : inviteLink,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  List pending invites
// @route GET /api/users/invites/pending
const getPendingInvites = async (req, res) => {
  try {
    const users = await User.find({ inviteStatus: { $in: ['pending', 'pending_otp'] } }).sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Resend invite for a user
// @route POST /api/users/:id/resend-invite
const resendInvite = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+inviteTokenHash +inviteTokenExpiresAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inviteStatus === 'accepted') {
      return res.status(400).json({ message: 'User has already completed onboarding' });
    }

    const inviteToken = generateInviteToken();
    user.inviteTokenHash = hashValue(inviteToken);
    user.inviteTokenExpiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
    user.inviteStatus = 'pending';
    user.passwordSet = false;
    user.emailVerified = false;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;
    await user.save();

    const inviteLink = buildInviteLink(inviteToken);
    const mailResult = await sendInviteMail({
      email: user.email,
      name: user.name,
      role: user.role,
      inviteLink,
      expiresAt: user.inviteTokenExpiresAt,
    });

    res.json({
      message: 'Invite resent',
      invite: {
        expiresAt: user.inviteTokenExpiresAt,
        delivery: mailResult.sent ? 'email' : 'not_configured',
        link: process.env.NODE_ENV === 'production' ? undefined : inviteLink,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Revoke invite for a user
// @route POST /api/users/:id/revoke-invite
const revokeInvite = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.inviteStatus === 'accepted') {
      return res.status(400).json({ message: 'Cannot revoke an already accepted invite' });
    }

    user.inviteStatus = 'revoked';
    user.inviteTokenHash = null;
    user.inviteTokenExpiresAt = null;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;
    await user.save();

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
