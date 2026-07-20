const mongoose = require('mongoose')

const paymentScheduleSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    label: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue'],
      default: 'Pending',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PaymentSchedule', paymentScheduleSchema)
