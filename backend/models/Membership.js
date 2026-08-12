const mongoose = require('mongoose');
const { ROLE_ENUM } = require('./User');

const MEMBERSHIP_STATUS_ENUM = ['invited', 'active', 'revoked'];
const MEMBERSHIP_INVITE_STATUS_ENUM = ['pending', 'accepted', 'revoked'];

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      required: true,
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      required: true,
    },
    channelPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChannelPartner',
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    status: {
      type: String,
      enum: MEMBERSHIP_STATUS_ENUM,
      default: 'invited',
    },
    inviteStatus: {
      type: String,
      enum: MEMBERSHIP_INVITE_STATUS_ENUM,
      default: 'pending',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, builderId: 1 }, { unique: true });
membershipSchema.index({ builderId: 1, role: 1 });

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
module.exports.MEMBERSHIP_STATUS_ENUM = MEMBERSHIP_STATUS_ENUM;
module.exports.MEMBERSHIP_INVITE_STATUS_ENUM = MEMBERSHIP_INVITE_STATUS_ENUM;
