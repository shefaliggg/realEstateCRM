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
    facing: { type: String },
    cornerUnit: { type: Boolean, default: false },

    carpetArea: { type: Number },                             // sqft
    builtUpArea: { type: Number },
    superBuiltUpArea: { type: Number },
    balconyArea: { type: Number },

    basePrice: { type: Number },                              // INR
    pricePerSqft: { type: Number },
    plc: { type: Number },
    floorRise: { type: Number },
    parkingCharges: { type: Number },
    clubCharges: { type: Number },
    otherCharges: { type: Number },
    totalPrice: { type: Number },                             // auto-computed from the components above

    parkingIncluded: { type: Boolean, default: false },
    parkingNumber: { type: String, trim: true },

    possessionStatus: {
      type: String,
      enum: ['Ready', 'Under Construction'],
      default: 'Under Construction',
    },

    documents: {
      floorPlan: String,
      priceSheet: String,
    },

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

unitSchema.pre('save', function computeTotalPrice(next) {
  const hasPricingInput = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges'].some(
    (field) => this[field] !== undefined && this[field] !== null
  )
  if (hasPricingInput) {
    this.totalPrice =
      (this.basePrice || 0) +
      (this.plc || 0) +
      (this.floorRise || 0) +
      (this.parkingCharges || 0) +
      (this.clubCharges || 0) +
      (this.otherCharges || 0)
  }
  next()
})

module.exports = mongoose.model('Unit', unitSchema)
