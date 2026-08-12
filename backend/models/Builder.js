const mongoose = require('mongoose');

const BUILDER_STATUS_ENUM = ['pending', 'active', 'suspended'];

const builderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Builder name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Builder slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: BUILDER_STATUS_ENUM,
      default: 'pending',
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    billingPlan: {
      type: String,
      default: 'trial',
    },
    createdBy: {
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

const Builder = mongoose.model('Builder', builderSchema);

module.exports = Builder;
module.exports.BUILDER_STATUS_ENUM = BUILDER_STATUS_ENUM;
