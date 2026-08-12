const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  type: String,
  note: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

const dealSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    dealName: { type: String, required: true, trim: true },
    // Linked to a specific inventory unit (not a free-text property)
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    stage: {
      type: String,
      enum: [
        'Lead Qualification', 'Needs Analysis', 'Proposal Sent',
        'Negotiation', 'Contract Review', 'Won', 'Lost',
      ],
      default: 'Lead Qualification',
    },
    value: { type: Number },
    commission: { type: Number },
    channelPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelPartner', default: null },
    commissionStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid'],
      default: 'Pending',
    },
    commissionDueDate: Date,
    commissionPaidDate: Date,
    closingDate: Date,
    probability: { type: Number, min: 0, max: 100, default: 10 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    notes: String,
    activities: [activitySchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Deal', dealSchema)
