const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    agreementStatus: {
      type: String,
      enum: ['Not Started', 'Draft', 'Signed'],
      default: 'Not Started',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Customer', customerSchema)
