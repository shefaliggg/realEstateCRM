const Project = require('../models/Project')
const Unit = require('../models/Unit')

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }
}

const parseNumberField = (value) => {
  if (value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

const parseBooleanField = (value) => {
  if (value === undefined) return undefined
  return value === 'true' || value === true
}

const parseDateField = (value) => {
  if (value === undefined) return undefined
  return value === '' ? null : value
}

const uploadedFileUrl = (bucket) =>
  bucket && bucket[0] ? `/uploads/project-images/${bucket[0].filename}` : undefined

const uploadedFileUrls = (bucket) => (bucket || []).map((file) => `/uploads/project-images/${file.filename}`)

const BASIC_FIELDS = ['name', 'code', 'developerName', 'description', 'type', 'status', 'reraNo', 'totalLandArea']
const LOCATION_FIELDS = ['country', 'state', 'city', 'locality', 'address', 'landmark', 'pincode', 'googleMapLink']
const LOCATION_NUMBER_FIELDS = ['latitude', 'longitude']
const DATE_FIELDS = ['reraRegistrationDate', 'launchDate', 'possessionDate', 'constructionStartDate']
const COUNT_FIELDS = ['numberOfTowers', 'numberOfFloors', 'totalUnits', 'totalBlocks', 'constructionProgressPct']
const PRICING_NUMBER_FIELDS = ['priceStart', 'priceEnd', 'basePricePerSqft', 'plcCharges', 'floorRiseCharges', 'parkingCharges', 'clubMembershipFee', 'registrationCharges', 'otherCharges']
const SPEC_FIELDS = ['structure', 'flooring', 'kitchen', 'bathroom', 'doors', 'windows', 'electrical', 'plumbing', 'paint']
const SALES_INFO_TEXT_FIELDS = ['salesOfficeAddress', 'siteOfficeContact', 'crmNotes']
const CONTACT_FIELDS = ['salesPhone', 'alternatePhone', 'whatsapp', 'email', 'website']
const SEO_TEXT_FIELDS = ['slug', 'metaTitle', 'metaDescription']

const normalizeProjectPayload = (body, files = []) => {
  const payload = {}
  const fileBuckets = Array.isArray(files) ? { images: files } : (files || {})

  BASIC_FIELDS.forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field]
  })

  if (body.virtualTourLink !== undefined) payload.virtualTourLink = body.virtualTourLink

  COUNT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) payload[field] = parseNumberField(body[field])
  })

  DATE_FIELDS.forEach((field) => {
    const parsed = parseDateField(body[field])
    if (parsed !== undefined) payload[field] = parsed
  })

  const hasLocationInput = [...LOCATION_FIELDS, ...LOCATION_NUMBER_FIELDS].some((f) => body[f] !== undefined)
  if (hasLocationInput) {
    payload.location = {}
    LOCATION_FIELDS.forEach((field) => { payload.location[field] = body[field] || '' })
    LOCATION_NUMBER_FIELDS.forEach((field) => { payload.location[field] = parseNumberField(body[field]) })
  }

  const hasPricingInput = [...PRICING_NUMBER_FIELDS, 'gstApplicable'].some((f) => body[f] !== undefined)
  if (hasPricingInput) {
    payload.pricing = {}
    PRICING_NUMBER_FIELDS.forEach((field) => { payload.pricing[field] = parseNumberField(body[field]) })
    if (body.gstApplicable !== undefined) payload.pricing.gstApplicable = parseBooleanField(body.gstApplicable)
  }

  const hasSpecInput = SPEC_FIELDS.some((f) => body[f] !== undefined)
  if (hasSpecInput) {
    payload.specifications = {}
    SPEC_FIELDS.forEach((field) => { payload.specifications[field] = body[field] || '' })
  }

  const hasSalesInfoInput = [...SALES_INFO_TEXT_FIELDS, 'bookingOpen', 'bankLoanAvailable', 'approvedBanks'].some((f) => body[f] !== undefined)
  if (hasSalesInfoInput) {
    payload.salesInfo = {}
    SALES_INFO_TEXT_FIELDS.forEach((field) => { payload.salesInfo[field] = body[field] || '' })
    if (body.bookingOpen !== undefined) payload.salesInfo.bookingOpen = parseBooleanField(body.bookingOpen)
    if (body.bankLoanAvailable !== undefined) payload.salesInfo.bankLoanAvailable = parseBooleanField(body.bankLoanAvailable)
    const approvedBanks = parseArrayField(body.approvedBanks)
    if (approvedBanks !== undefined) payload.salesInfo.approvedBanks = approvedBanks
  }

  const hasContactInput = CONTACT_FIELDS.some((f) => body[f] !== undefined)
  if (hasContactInput) {
    payload.contact = {}
    CONTACT_FIELDS.forEach((field) => { payload.contact[field] = body[field] || '' })
  }

  const hasSeoInput = [...SEO_TEXT_FIELDS, 'keywords'].some((f) => body[f] !== undefined)
  if (hasSeoInput) {
    payload.seo = {}
    SEO_TEXT_FIELDS.forEach((field) => { payload.seo[field] = body[field] || '' })
    const keywords = parseArrayField(body.keywords)
    if (keywords !== undefined) payload.seo.keywords = keywords
  }

  const blocks = parseArrayField(body.blocks)
  if (blocks !== undefined) payload.blocks = blocks

  const bhkTypes = parseArrayField(body.bhkTypes)
  if (bhkTypes !== undefined) payload.bhkTypes = bhkTypes

  const unitConfigurations = parseArrayField(body.unitConfigurations)
  if (unitConfigurations !== undefined) payload.unitConfigurations = unitConfigurations

  const nearbyLocations = parseArrayField(body.nearbyLocations)
  if (nearbyLocations !== undefined) payload.nearbyLocations = nearbyLocations

  const amenities = parseArrayField(body.amenities)
  if (amenities !== undefined) payload.amenities = amenities

  const highlights = parseArrayField(body.highlights)
  if (highlights !== undefined) payload.highlights = highlights

  const managedBy = parseArrayField(body.managedBy)
  if (managedBy !== undefined) payload.managedBy = managedBy

  const teamDesignations = parseArrayField(body.teamDesignations)
  if (teamDesignations !== undefined) payload.teamDesignations = teamDesignations

  const uploadedImages = uploadedFileUrls(fileBuckets.images)
  const uploadedVideos = uploadedFileUrls(fileBuckets.videos)
  const explicitImages = parseArrayField(body.images)
  const explicitVideos = parseArrayField(body.videos)
  if (uploadedImages.length > 0) payload.images = uploadedImages
  else if (explicitImages !== undefined) payload.images = explicitImages
  if (uploadedVideos.length > 0) payload.videos = uploadedVideos
  else if (explicitVideos !== undefined) payload.videos = explicitVideos

  const logoUrl = uploadedFileUrl(fileBuckets.logo)
  if (logoUrl) payload.logo = logoUrl
  const coverImageUrl = uploadedFileUrl(fileBuckets.coverImage)
  if (coverImageUrl) payload.coverImage = coverImageUrl
  const masterPlanUrl = uploadedFileUrl(fileBuckets.masterPlanImage)
  if (masterPlanUrl) payload.masterPlanImage = masterPlanUrl

  const floorPlanImages = uploadedFileUrls(fileBuckets.floorPlanImages)
  if (floorPlanImages.length > 0) payload.floorPlanImages = floorPlanImages
  const constructionProgressPhotos = uploadedFileUrls(fileBuckets.constructionProgressPhotos)
  if (constructionProgressPhotos.length > 0) payload.constructionProgressPhotos = constructionProgressPhotos

  const reraCertificateUrl = uploadedFileUrl(fileBuckets.reraCertificate)
  const brochureUrl = uploadedFileUrl(fileBuckets.brochure)
  const priceSheetUrl = uploadedFileUrl(fileBuckets.priceSheet)
  const paymentPlanUrl = uploadedFileUrl(fileBuckets.paymentPlan)
  const occupancyCertificateUrl = uploadedFileUrl(fileBuckets.occupancyCertificate)
  const completionCertificateUrl = uploadedFileUrl(fileBuckets.completionCertificate)
  const legalDocuments = uploadedFileUrls(fileBuckets.legalDocuments)
  const approvalDocuments = uploadedFileUrls(fileBuckets.approvalDocuments)
  if (reraCertificateUrl || brochureUrl || priceSheetUrl || paymentPlanUrl || occupancyCertificateUrl || completionCertificateUrl || legalDocuments.length > 0 || approvalDocuments.length > 0) {
    payload.documents = {}
    if (reraCertificateUrl) payload.documents.reraCertificate = reraCertificateUrl
    if (brochureUrl) payload.documents.brochure = brochureUrl
    if (priceSheetUrl) payload.documents.priceSheet = priceSheetUrl
    if (paymentPlanUrl) payload.documents.paymentPlan = paymentPlanUrl
    if (occupancyCertificateUrl) payload.documents.occupancyCertificate = occupancyCertificateUrl
    if (completionCertificateUrl) payload.documents.completionCertificate = completionCertificateUrl
    if (legalDocuments.length > 0) payload.documents.legalDocuments = legalDocuments
    if (approvalDocuments.length > 0) payload.documents.approvalDocuments = approvalDocuments
  }

  return payload
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ builderId: req.builderId })
      .populate('managedBy', 'name email phone role')
      .populate('teamDesignations.user', 'name email phone role')
      .sort({ createdAt: -1 })
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const units = await Unit.find({ project: project._id, builderId: req.builderId })
        return {
          ...project.toObject(),
          inventoryStats: {
            total: units.length,
            available: units.filter((u) => u.status === 'Available').length,
            reserved: units.filter((u) => u.status === 'Reserved').length,
            booked: units.filter((u) => u.status === 'Booked').length,
            registered: units.filter((u) => u.status === 'Registered').length,
          },
        }
      })
    )
    res.json(projectsWithStats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('managedBy', 'name email phone role')
      .populate('teamDesignations.user', 'name email phone role')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    const units = await Unit.find({ project: project._id, builderId: req.builderId })
    res.json({
      ...project.toObject(),
      inventoryStats: {
        total: units.length,
        available: units.filter((u) => u.status === 'Available').length,
        reserved: units.filter((u) => u.status === 'Reserved').length,
        booked: units.filter((u) => u.status === 'Booked').length,
        registered: units.filter((u) => u.status === 'Registered').length,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createProject = async (req, res) => {
  try {
    const payload = normalizeProjectPayload(req.body, req.files)
    const project = new Project({ ...payload, builderId: req.builderId, createdBy: req.user._id })
    await project.save()
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateProject = async (req, res) => {
  try {
    const payload = normalizeProjectPayload(req.body, req.files)
    const project = await Project.findOneAndUpdate({ _id: req.params.id, builderId: req.builderId }, payload, {
      new: true,
      runValidators: true,
    })
      .populate('managedBy', 'name email phone role')
      .populate('teamDesignations.user', 'name email phone role')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject }
