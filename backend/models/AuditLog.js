const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // null for platform-level actions (e.g. a platform admin inviting a builder)
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      default: null,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ builderId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
