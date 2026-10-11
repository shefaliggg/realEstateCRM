const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    phoneNormalized: { type: String, index: true },
    address: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    agreementStatus: {
      type: String,
      enum: ['Not Started', 'Draft', 'Signed'],
      default: 'Not Started',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

customerSchema.pre('validate', function normalizePhoneField(next) {
  if (this.isNew || this.isModified('phone')) {
    const digits = String(this.phone || '').replace(/\D/g, '')
    if (digits.length < 10) {
      this.invalidate('phone', 'Enter a valid phone number (at least 10 digits)')
    }
    this.phoneNormalized = digits.slice(-10)
  }
  next()
})

module.exports = mongoose.model('Customer', customerSchema)
