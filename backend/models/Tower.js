const mongoose = require('mongoose')

const towerSchema = new mongoose.Schema(
  {
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Builder', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Planned', 'Under Construction', 'Ready'],
      default: 'Planned',
    },
    numberOfFloors: { type: Number, default: 0 },
    numberOfBasements: { type: Number, default: 0 },
    numberOfLifts: { type: Number, default: 0 },
    numberOfFlats: { type: Number, default: 0 },
    possessionDate: Date,

    constructionStartDate: Date,
    completionDate: Date,
    occupancyCertificate: { type: Boolean, default: false },
    fireNOC: { type: Boolean, default: false },

    features: {
      serviceLift: { type: Boolean, default: false },
      passengerLift: { type: Boolean, default: false },
      generatorBackup: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      fireSafety: { type: Boolean, default: false },
      garbageChute: { type: Boolean, default: false },
      wheelchairAccess: { type: Boolean, default: false },
    },

    amenities: [{ type: String }],
    specifications: {
      structure: String,
      flooring: String,
      kitchen: String,
      bathroom: String,
      doors: String,
      windows: String,
      electrical: String,
      plumbing: String,
      paint: String,
    },

    documents: {
      floorPlans: [{ type: String, trim: true }],
      towerLayout: String,
      elevationDrawing: String,
    },

    siteEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    salesManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

towerSchema.index({ project: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Tower', towerSchema)
