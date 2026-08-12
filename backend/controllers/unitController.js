const Unit = require('../models/Unit')
const Project = require('../models/Project')

const uploadedFileUrl = (bucket) =>
  bucket && bucket[0] ? `/uploads/project-images/${bucket[0].filename}` : undefined

const NUMBER_FIELDS = [
  'floor', 'carpetArea', 'builtUpArea', 'superBuiltUpArea', 'balconyArea',
  'basePrice', 'pricePerSqft', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges',
]
const BOOLEAN_FIELDS = ['cornerUnit', 'parkingIncluded']

const normalizeUnitBody = (body, files = {}) => {
  const payload = { ...body }
  NUMBER_FIELDS.forEach((field) => {
    if (body[field] !== undefined && body[field] !== '') payload[field] = Number(body[field])
    else if (body[field] === '') delete payload[field]
  })
  BOOLEAN_FIELDS.forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field] === 'true' || body[field] === true
  })

  const floorPlan = uploadedFileUrl(files.floorPlan)
  const priceSheet = uploadedFileUrl(files.priceSheet)
  if (floorPlan || priceSheet) {
    payload.documents = { ...(payload.documents || {}) }
    if (floorPlan) payload.documents.floorPlan = floorPlan
    if (priceSheet) payload.documents.priceSheet = priceSheet
  }
  delete payload.floorPlan
  delete payload.priceSheet

  return payload
}

const getUnits = async (req, res) => {
  try {
    const filter = { project: req.params.projectId, builderId: req.builderId }
    if (req.query.block) filter.block = req.query.block
    if (req.query.status) filter.status = req.query.status
    if (req.query.bhkType) filter.bhkType = req.query.bhkType
    const units = await Unit.find(filter).sort({ block: 1, floor: 1, unitNo: 1 })
    res.json(units)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('project', 'name type location')
      .populate('currentLead', 'name phone email nurtureStage')
      .populate('currentDeal', 'dealName stage value probability')
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    res.json(unit)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createUnit = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, builderId: req.builderId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const payload = normalizeUnitBody(req.body, req.files || {})
    const unit = new Unit({ ...payload, project: req.params.projectId, builderId: req.builderId })
    await unit.save()
    res.status(201).json(unit)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A unit with this number already exists in this block' })
    res.status(400).json({ message: err.message })
  }
}

const updateUnit = async (req, res) => {
  try {
    const payload = normalizeUnitBody(req.body, req.files || {})
    const unit = await Unit.findOne({ _id: req.params.id, builderId: req.builderId })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'documents') unit.documents = { ...(unit.documents?.toObject?.() || unit.documents || {}), ...value }
      else unit[key] = value
    })
    await unit.save()
    res.json(unit)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    res.json({ message: 'Unit deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const computeTotalPrice = (u) => {
  const hasPricingInput = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges'].some(
    (field) => u[field] !== undefined && u[field] !== null && u[field] !== ''
  )
  if (!hasPricingInput) return undefined
  return (Number(u.basePrice) || 0) + (Number(u.plc) || 0) + (Number(u.floorRise) || 0) +
    (Number(u.parkingCharges) || 0) + (Number(u.clubCharges) || 0) + (Number(u.otherCharges) || 0)
}

const bulkCreateUnits = async (req, res) => {
  try {
    const { units } = req.body
    if (!Array.isArray(units) || units.length === 0) {
      return res.status(400).json({ message: 'units array is required' })
    }
    const project = await Project.findOne({ _id: req.params.projectId, builderId: req.builderId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    // insertMany doesn't run the pre('save') hook, so totalPrice is computed here instead
    const docs = units.map((u) => ({ ...u, project: req.params.projectId, builderId: req.builderId, totalPrice: computeTotalPrice(u) }))
    const created = await Unit.insertMany(docs, { ordered: false })
    res.status(201).json({ message: `${created.length} unit(s) created`, units: created })
  } catch (err) {
    const created = err.insertedDocs?.length || err.result?.result?.nInserted || 0
    res.status(created > 0 ? 207 : 400).json({
      message: created > 0
        ? `${created} unit(s) created, some were skipped (likely duplicate unit numbers)`
        : (err.message || 'Failed to create units'),
    })
  }
}

const bulkUpdateUnits = async (req, res) => {
  try {
    const { unitIds, status, note, ...priceFields } = req.body
    if (!Array.isArray(unitIds) || unitIds.length === 0) {
      return res.status(400).json({ message: 'unitIds is required' })
    }

    const pricingKeys = ['basePrice', 'pricePerSqft', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges']
    const units = await Unit.find({ _id: { $in: unitIds }, builderId: req.builderId })

    await Promise.all(
      units.map(async (unit) => {
        if (status && status !== unit.status) {
          unit.status = status
          unit.statusHistory.push({ status, changedBy: req.user._id, note: note || 'Bulk update' })
        }
        pricingKeys.forEach((key) => {
          if (priceFields[key] !== undefined && priceFields[key] !== '') {
            unit[key] = Number(priceFields[key])
          }
        })
        await unit.save()
      })
    )

    res.json({ message: `${units.length} unit(s) updated` })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { getUnits, getUnitById, createUnit, updateUnit, deleteUnit, bulkCreateUnits, bulkUpdateUnits }
