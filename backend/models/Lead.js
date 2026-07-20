const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  createdAt: { type: Date, default: Date.now },
})

const followUpTaskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Call', 'WhatsApp', 'Email', 'Site Visit', 'Meeting', 'Other'],
      default: 'Call',
    },
    note: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    source: {
      type: String,
      enum: [
        'Website', 'Phone Call', 'Referral', '99acres', 'MagicBricks',
        'Facebook', 'Google Ads', 'Instagram', 'LinkedIn', 'Walk-in', 'Direct', 'Other',
      ],
      default: 'Website',
    },
    // Nurture Stage — tracks pre-sales readiness (separate from Deal stage)
    nurtureStage: {
      type: String,
      enum: ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured'],
      default: 'Cold',
    },
    // Manual 1-5 star score set by agent
    leadScore: { type: Number, min: 1, max: 5, default: 3 },
    budget: { type: Number },                                       // INR
    requirements: String,
    city: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    // Units the lead has shown interest in
    unitInterest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nextFollowUpDate: Date,
    lastContactDate: Date,
    notes: [noteSchema],
    followUpTasks: [followUpTaskSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Lead', leadSchema)
