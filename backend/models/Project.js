const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    developerName: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Apartments', 'Villas', 'Plots', 'Commercial', 'Mixed Use'],
      default: 'Apartments',
    },
    status: {
      type: String,
      enum: ['Pre-Launch', 'Launched', 'Under Construction', 'Ready to Move', 'Completed'],
      default: 'Launched',
    },
    location: {
      address: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
      googleMapLink: String,
    },
    reraNo: { type: String, trim: true },
    launchDate: Date,
    possessionDate: Date,
    totalUnits: { type: Number, default: 0 },
    blocks: [{ type: String }],       // e.g. ['A','B','C','D','E','F','G','H']
    bhkTypes: [{ type: String }],     // e.g. ['2 BHK', '2.5 BHK', '3 BHK']
    description: String,
    images: [{ type: String, trim: true }],
    videos: [{ type: String, trim: true }],
    amenities: [{ type: String }],
    highlights: [{ type: String }],
    managedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
