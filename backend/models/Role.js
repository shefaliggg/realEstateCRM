const mongoose = require('mongoose');
const { ROLE_ENUM } = require('./User');
const { PERMISSION_CATALOG } = require('../utils/permissions');

const roleSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    key: { type: String, enum: ROLE_ENUM, required: true },
    name: { type: String, required: true, trim: true },
    // System roles are the 7 built-in ROLE_ENUM entries — always present,
    // never deletable/renamable, only their `permissions` are editable.
    isSystem: { type: Boolean, default: true },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (perms) => perms.every((p) => PERMISSION_CATALOG.includes(p)),
        message: 'Unknown permission key',
      },
    },
  },
  { timestamps: true }
);

roleSchema.index({ builderId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
