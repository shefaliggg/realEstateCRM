const mongoose = require('mongoose')

const unitConfigSchema = new mongoose.Schema(
  {
    bhk: String,
    units: Number,
    areaFrom: Number,
    areaTo: Number,
    startingPrice: Number,
  },
  { _id: false }
)

const nearbyLocationSchema = new mongoose.Schema(
  {
    type: String,
    name: String,
    distance: String,
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    developerName: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Buildings', 'Villas', 'Plots', 'Commercial', 'Mixed Use'],
      default: 'Buildings',
    },
    status: {
      type: String,
      enum: ['Pre-Launch', 'New Launch', 'Under Construction', 'Ready to Move', 'Completed', 'Sold Out'],
      default: 'Pre-Launch',
    },
    description: String,
    logo: String,
    coverImage: String,

    location: {
      country: String,
      state: String,
      city: String,
      locality: String,
      address: String,
      landmark: String,
      pincode: String,
      googleMapLink: String,
      latitude: Number,
      longitude: Number,
    },

    reraNo: { type: String, trim: true },
    reraRegistrationDate: Date,
    launchDate: Date,
    possessionDate: Date,
    constructionStartDate: Date,
    constructionProgressPct: { type: Number, min: 0, max: 100 },
    totalLandArea: String,
    numberOfTowers: { type: Number, default: 0 },
    numberOfFloors: { type: Number, default: 0 },
    totalUnits: { type: Number, default: 0 },
    totalBlocks: { type: Number, default: 0 },

    blocks: [{ type: String }],       // e.g. ['A','B','C','D','E','F','G','H']
    bhkTypes: [{ type: String }],     // e.g. ['2 BHK', '2.5 BHK', '3 BHK']
    unitConfigurations: [unitConfigSchema],

    pricing: {
      priceStart: Number,
      priceEnd: Number,
      basePricePerSqft: Number,
      plcCharges: Number,
      floorRiseCharges: Number,
      parkingCharges: Number,
      clubMembershipFee: Number,
      gstApplicable: { type: Boolean, default: false },
      registrationCharges: Number,
      otherCharges: Number,
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
    nearbyLocations: [nearbyLocationSchema],

    images: [{ type: String, trim: true }],       // gallery images
    videos: [{ type: String, trim: true }],
    floorPlanImages: [{ type: String, trim: true }],
    masterPlanImage: String,
    constructionProgressPhotos: [{ type: String, trim: true }],
    virtualTourLink: String,

    documents: {
      reraCertificate: String,
      brochure: String,
      priceSheet: String,
      paymentPlan: String,
      occupancyCertificate: String,
      completionCertificate: String,
      legalDocuments: [{ type: String, trim: true }],
      approvalDocuments: [{ type: String, trim: true }],
    },

    salesInfo: {
      bookingOpen: { type: Boolean, default: false },
      bankLoanAvailable: { type: Boolean, default: false },
      approvedBanks: [{ type: String }],
      salesOfficeAddress: String,
      siteOfficeContact: String,
      crmNotes: String,
    },

    contact: {
      salesPhone: String,
      alternatePhone: String,
      whatsapp: String,
      email: String,
      website: String,
    },

    seo: {
      slug: { type: String, trim: true },
      metaTitle: String,
      metaDescription: String,
      keywords: [{ type: String }],
    },

    highlights: [{ type: String }],
    managedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
