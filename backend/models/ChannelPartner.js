const mongoose = require('mongoose')

const channelPartnerSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    city: { type: String, trim: true },
    commissionRate: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

// A partner brokerage can hold a directory record with more than one builder,
// so uniqueness is per-builder, not global (the corresponding User login stays
// globally unique — see backend/models/User.js — this only governs the directory entry).
channelPartnerSchema.index({ builderId: 1, email: 1 }, { unique: true })

module.exports = mongoose.model('ChannelPartner', channelPartnerSchema)
