const Project = require('../models/Project')
const Unit = require('../models/Unit')
const { parseArrayField, flattenNestedGroupsForUpdate } = require('../utils/nestedPayload')

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

  // Merges newly uploaded files with an explicit kept-URL list (JSON array in body), so an edit
  // request can both remove existing items (by omitting their URL) and add new ones (as files)
  // without wiping the rest of the collection. Falls back to upload-only replace when no
  // explicit list is sent, preserving the original create-flow behavior.
  const mergeFileArrayField = (bucket, explicitValue) => {
    const uploaded = uploadedFileUrls(bucket)
    const explicit = parseArrayField(explicitValue)
    if (explicit !== undefined) return [...explicit, ...uploaded]
    if (uploaded.length > 0) return uploaded
    return undefined
  }

  const mergedImages = mergeFileArrayField(fileBuckets.images, body.images)
  if (mergedImages !== undefined) payload.images = mergedImages
  const mergedVideos = mergeFileArrayField(fileBuckets.videos, body.videos)
  if (mergedVideos !== undefined) payload.videos = mergedVideos

  const logoUrl = uploadedFileUrl(fileBuckets.logo)
  if (logoUrl) payload.logo = logoUrl
  const coverImageUrl = uploadedFileUrl(fileBuckets.coverImage)
  if (coverImageUrl) payload.coverImage = coverImageUrl
  const masterPlanUrl = uploadedFileUrl(fileBuckets.masterPlanImage)
  if (masterPlanUrl) payload.masterPlanImage = masterPlanUrl

  const mergedFloorPlanImages = mergeFileArrayField(fileBuckets.floorPlanImages, body.floorPlanImages)
  if (mergedFloorPlanImages !== undefined) payload.floorPlanImages = mergedFloorPlanImages
  const mergedConstructionProgressPhotos = mergeFileArrayField(fileBuckets.constructionProgressPhotos, body.constructionProgressPhotos)
  if (mergedConstructionProgressPhotos !== undefined) payload.constructionProgressPhotos = mergedConstructionProgressPhotos

  const reraCertificateUrl = uploadedFileUrl(fileBuckets.reraCertificate)
  const brochureUrl = uploadedFileUrl(fileBuckets.brochure)
  const priceSheetUrl = uploadedFileUrl(fileBuckets.priceSheet)
  const paymentPlanUrl = uploadedFileUrl(fileBuckets.paymentPlan)
  const occupancyCertificateUrl = uploadedFileUrl(fileBuckets.occupancyCertificate)
  const completionCertificateUrl = uploadedFileUrl(fileBuckets.completionCertificate)
  const mergedLegalDocuments = mergeFileArrayField(fileBuckets.legalDocuments, body.legalDocuments)
  const mergedApprovalDocuments = mergeFileArrayField(fileBuckets.approvalDocuments, body.approvalDocuments)
  if (
    reraCertificateUrl || brochureUrl || priceSheetUrl || paymentPlanUrl || occupancyCertificateUrl || completionCertificateUrl ||
    mergedLegalDocuments !== undefined || mergedApprovalDocuments !== undefined
  ) {
    payload.documents = {}
    if (reraCertificateUrl) payload.documents.reraCertificate = reraCertificateUrl
    if (brochureUrl) payload.documents.brochure = brochureUrl
    if (priceSheetUrl) payload.documents.priceSheet = priceSheetUrl
    if (paymentPlanUrl) payload.documents.paymentPlan = paymentPlanUrl
    if (occupancyCertificateUrl) payload.documents.occupancyCertificate = occupancyCertificateUrl
    if (completionCertificateUrl) payload.documents.completionCertificate = completionCertificateUrl
    if (mergedLegalDocuments !== undefined) payload.documents.legalDocuments = mergedLegalDocuments
    if (mergedApprovalDocuments !== undefined) payload.documents.approvalDocuments = mergedApprovalDocuments
  }

  return payload
}

const NESTED_GROUP_KEYS = ['location', 'salesInfo', 'contact', 'seo', 'documents']

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
    const payload = flattenNestedGroupsForUpdate(normalizeProjectPayload(req.body, req.files), NESTED_GROUP_KEYS)
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
