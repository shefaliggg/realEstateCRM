const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLE_ENUM = [
  'builder_admin',
  'sales_manager',
  'sales_executive',
  'crm_manager',
  'crm_executive',
  'marketing_manager',
  'marketing_executive',
  'partner_admin',
  'partner_agent',
  'customer',
  // Legacy value — replaced by partner_admin/partner_agent. Kept in the enum
  // (never removed) so pre-existing Membership docs stay schema-valid;
  // attachTenantScope (backend/middleware/tenantMiddleware.js) lazily
  // upgrades any membership still on this value to partner_admin on read.
  'channel_partner',
];

const PLATFORM_ROLE_ENUM = ['platform_admin', 'platform_staff'];

const isPlatformRole = (role) => PLATFORM_ROLE_ENUM.includes(role);

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
      // Only meaningful for platform-tier accounts (platform_admin/platform_staff).
      // Org-tier accounts read their effective role off the active Membership instead.
      type: String,
      enum: [...ROLE_ENUM, ...PLATFORM_ROLE_ENUM],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordSet: {
      type: Boolean,
      default: false,
    },
    // True from account creation (temp password issued) until the user
    // completes the forced set-new-password step on their first login.
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
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
module.exports.PLATFORM_ROLE_ENUM = PLATFORM_ROLE_ENUM;
module.exports.isPlatformRole = isPlatformRole;
