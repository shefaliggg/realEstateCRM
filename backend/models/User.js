const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLE_ENUM = [
  'admin',
  'sales_manager',
  'sales_executive',
  'crm_manager',
  'crm_executive',
  'marketing_manager',
  'marketing_executive',
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      default: 'sales_executive',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordSet: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    inviteTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    inviteTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    inviteStatus: {
      type: String,
      enum: ['none', 'pending', 'pending_otp', 'accepted', 'revoked', 'expired'],
      default: 'none',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    otpCodeHash: {
      type: String,
      default: null,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    otpLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },
    onboardingCompletedAt: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLE_ENUM = ROLE_ENUM;
