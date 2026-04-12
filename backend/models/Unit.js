const mongoose = require('mongoose')

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
})

const unitSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    block: { type: String, required: true, trim: true },      // A, B, C ...
    floor: { type: Number, required: true },
    unitNo: { type: String, required: true, trim: true },     // e.g. "101", "A-301"
    bhkType: { type: String, required: true },                // "2 BHK", "2.5 BHK", "3 BHK"
    carpetArea: { type: Number },                             // sqft
    basePrice: { type: Number },                              // INR
    facing: { type: String },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'],
      default: 'Available',
    },
    currentLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    currentDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
)

// Unique unit per project + block + unitNo
unitSchema.index({ project: 1, block: 1, unitNo: 1 }, { unique: true })

module.exports = mongoose.model('Unit', unitSchema)
