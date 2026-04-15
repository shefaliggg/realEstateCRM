const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hashValue, generateOtp, isStrongPassword } = require('../utils/security');
const { sendMail } = require('../utils/email');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const INVITE_EXPIRY_HOURS = Number(process.env.INVITE_EXPIRY_HOURS || 72);
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const createAndAttachOtp = (user) => {
  const otp = generateOtp();
  user.otpCodeHash = hashValue(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date();
  return otp;
};

const sendOtpMail = async (user, otp) => {
  const subject = 'Your PropVault verification code';
  const text = `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  return sendMail({ to: user.email, subject, text });
};

// @desc  Role-based login
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

    if (user.role !== 'admin' && (!user.passwordSet || !user.emailVerified)) {
      return res.status(403).json({
        message: 'Onboarding is pending. Please complete invite setup first.',
      });
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get current logged-in admin
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Seed first admin (disabled by default in production)
// @route POST /api/auth/seed-admin
const seedAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED_ADMIN !== 'true') {
      return res.status(403).json({ message: 'Seed admin is disabled in production' });
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
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
      role: 'admin',
      passwordSet: true,
      emailVerified: true,
      inviteStatus: 'accepted',
      onboardingCompletedAt: new Date(),
    });
    res.status(201).json({
      ...sanitizeUser(admin),
      token: generateToken(admin._id, admin.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Validate invite token details
// @route GET /api/auth/invite/:token
const validateInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashValue(token);
    const user = await User.findOne({ inviteTokenHash: tokenHash }).select(
      '+inviteTokenHash +inviteTokenExpiresAt +inviteStatus'
    );

    if (!user) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (user.inviteStatus === 'revoked') {
      return res.status(400).json({ message: 'Invite has been revoked' });
    }

    if (user.inviteStatus === 'accepted') {
      return res.status(400).json({ message: 'Invite already used' });
    }

    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      user.inviteStatus = 'expired';
      await user.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    res.json({
      invite: {
        name: user.name,
        email: user.email,
        role: user.role,
        expiresAt: user.inviteTokenExpiresAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Accept invite and set password, then send OTP
// @route POST /api/auth/invite/accept
const acceptInvite = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Invite token and password are required' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number and special character.',
      });
    }

    const tokenHash = hashValue(token);
    const user = await User.findOne({ inviteTokenHash: tokenHash }).select(
      '+inviteTokenHash +inviteTokenExpiresAt +inviteStatus +otpCodeHash +otpExpiresAt +otpAttempts +otpLastSentAt +password'
    );
    if (!user) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (user.inviteStatus === 'revoked') {
      return res.status(400).json({ message: 'Invite has been revoked' });
    }

    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      user.inviteStatus = 'expired';
      await user.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    user.password = password;
    user.passwordSet = true;
    user.inviteStatus = 'pending_otp';
    const otp = createAndAttachOtp(user);
    await user.save();

    const mailResult = await sendOtpMail(user, otp);

    res.json({
      message: 'Password set. OTP sent to your email.',
      email: user.email,
      otpDelivery: mailResult.sent ? 'email' : 'not_configured',
      // Useful in local/dev where SMTP is not configured yet.
      devOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Resend OTP for pending invite onboarding
// @route POST /api/auth/invite/resend-otp
const resendInviteOtp = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Invite token is required' });
    }

    const tokenHash = hashValue(token);
    const user = await User.findOne({ inviteTokenHash: tokenHash }).select(
      '+inviteTokenHash +inviteTokenExpiresAt +inviteStatus +otpCodeHash +otpExpiresAt +otpAttempts +otpLastSentAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (user.inviteStatus !== 'pending_otp') {
      return res.status(400).json({ message: 'OTP resend is not available for this invite state' });
    }

    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      user.inviteStatus = 'expired';
      await user.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000
    ) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    const otp = createAndAttachOtp(user);
    await user.save();

    const mailResult = await sendOtpMail(user, otp);
    res.json({
      message: 'OTP resent successfully',
      otpDelivery: mailResult.sent ? 'email' : 'not_configured',
      devOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Verify OTP and complete invite onboarding
// @route POST /api/auth/invite/verify-otp
const verifyInviteOtp = async (req, res) => {
  try {
    const { token, otp } = req.body;
    if (!token || !otp) {
      return res.status(400).json({ message: 'Invite token and OTP are required' });
    }

    const tokenHash = hashValue(token);
    const user = await User.findOne({ inviteTokenHash: tokenHash }).select(
      '+inviteTokenHash +inviteTokenExpiresAt +inviteStatus +otpCodeHash +otpExpiresAt +otpAttempts +otpLastSentAt +password'
    );
    if (!user) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (user.inviteStatus !== 'pending_otp') {
      return res.status(400).json({ message: 'OTP verification is not available for this invite state' });
    }

    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      user.inviteStatus = 'expired';
      await user.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    if (!user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many failed OTP attempts. Please resend OTP.' });
    }

    if (hashValue(otp) !== user.otpCodeHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.emailVerified = true;
    user.inviteStatus = 'accepted';
    user.onboardingCompletedAt = new Date();
    user.inviteTokenHash = null;
    user.inviteTokenExpiresAt = null;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;
    await user.save();

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  login,
  getMe,
  seedAdmin,
  validateInvite,
  acceptInvite,
  resendInviteOtp,
  verifyInviteOtp,
  INVITE_EXPIRY_HOURS,
};