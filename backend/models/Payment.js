const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSchedule' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: {
      type: String,
      enum: ['Online', 'Cheque', 'NEFT', 'IMPS', 'Cash', 'Other'],
      default: 'Online',
    },
    reference: String,
    note: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Payment', paymentSchema)
