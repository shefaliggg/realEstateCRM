const Unit = require('../models/Unit')
const Project = require('../models/Project')
const Customer = require('../models/Customer')
const Lead = require('../models/Lead')
const { findExistingCustomer } = require('../utils/customerLookup')
const Booking = require('../models/Booking')

const uploadedFileUrl = (bucket) =>
  bucket && bucket[0] ? `/uploads/project-images/${bucket[0].filename}` : undefined

const NUMBER_FIELDS = [
  'floor', 'carpetArea', 'builtUpArea', 'superBuiltUpArea', 'balconyArea',
  'plotArea', 'gardenArea', 'terraceArea', 'bathrooms', 'villaFloors', 'parkingSpaces',
  'basePrice', 'pricePerSqft', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges',
]
const BOOLEAN_FIELDS = ['cornerUnit', 'parkingIncluded', 'privateGarden']

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
    const units = await Unit.find(filter)
      .populate('currentCustomer', 'name phone email')
      .populate('currentLead', 'name source')
      .sort({ block: 1, floor: 1, unitNo: 1 })
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
    const { customerId, customerName, customerPhone, customerEmail, leadId, statusNote } = payload
    ;['customerId', 'customerName', 'customerPhone', 'customerEmail', 'leadId', 'statusNote'].forEach((k) => delete payload[k])

    const newStatus = payload.status
    const statusChanging = newStatus && newStatus !== unit.status
    const needsCustomer = newStatus === 'Reserved' || newStatus === 'Booked'

    if (needsCustomer && (statusChanging || customerId || customerName || leadId)) {
      let customer = null
      let lead = null
      if (customerId) {
        customer = await Customer.findOne({ _id: customerId, builderId: req.builderId })
        if (!customer) return res.status(404).json({ message: 'Customer not found' })
      } else if (leadId) {
        lead = await Lead.findOne({ _id: leadId, builderId: req.builderId })
        if (!lead) return res.status(404).json({ message: 'Lead not found' })
        customer = lead.customer ? await Customer.findOne({ _id: lead.customer, builderId: req.builderId }) : null
        if (!customer) customer = await findExistingCustomer(req.builderId, lead)
        if (!customer) {
          customer = await Customer.create({
            builderId: req.builderId,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            project: unit.project,
            unit: unit._id,
            lead: lead._id,
            createdBy: req.user._id,
          })
        }
      } else if (customerName && customerPhone) {
        const existing = await findExistingCustomer(req.builderId, { phone: customerPhone, email: customerEmail })
        if (existing) {
          return res.status(409).json({
            message: `A customer with this phone/email already exists: ${existing.name} (${existing.phone})`,
            customer: existing,
          })
        }
        {
          const matchingLead = await Lead.findOne({ builderId: req.builderId, phone: customerPhone.trim(), customer: null })
          customer = await Customer.create({
            builderId: req.builderId,
            name: customerName,
            phone: customerPhone,
            email: customerEmail || undefined,
            project: unit.project,
            unit: unit._id,
            lead: matchingLead?._id || null,
            createdBy: req.user._id,
          })
          lead = matchingLead
        }
      } else if (!unit.currentCustomer) {
        return res.status(400).json({ message: `Customer details are required to mark a unit ${newStatus}` })
      }
      if (customer) {
        if (!customer.unit || String(customer.unit) !== String(unit._id)) {
          customer.unit = unit._id
          await customer.save()
        }
        unit.currentCustomer = customer._id
        const linkedLead = lead || (customer.lead ? await Lead.findOne({ _id: customer.lead, builderId: req.builderId }) : null)
        if (linkedLead) {
          unit.currentLead = linkedLead._id
          if (String(linkedLead.customer) !== String(customer._id)) {
            linkedLead.customer = customer._id
            await linkedLead.save()
          }
        }
      }
      if (newStatus === 'Booked') {
        const existing = await Booking.findOne({ unit: unit._id, builderId: req.builderId, status: 'Active' })
        if (!existing) {
          await Booking.create({
            builderId: req.builderId,
            project: unit.project,
            unit: unit._id,
            customer: unit.currentCustomer,
            totalAmount: unit.totalPrice || unit.basePrice || 0,
            bookedBy: req.user._id,
            createdBy: req.user._id,
          })
        }
      }
    } else if (statusChanging && (newStatus === 'Available' || newStatus === 'Cancelled')) {
      unit.currentCustomer = null
      unit.currentLead = null
      await Booking.updateMany({ unit: unit._id, builderId: req.builderId, status: 'Active' }, { status: 'Cancelled' })
    }

    if (statusChanging) {
      unit.statusHistory.push({ status: newStatus, changedBy: req.user._id, note: statusNote || undefined })
    }
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

const applyPriceMethod = (unit, priceMethod, priceValue) => {
  const value = Number(priceValue)
  if (!priceMethod || Number.isNaN(value)) return
  const currentBase = Number(unit.basePrice) || 0
  if (priceMethod === 'perSqft') unit.basePrice = value * (Number(unit.carpetArea) || 0)
  else if (priceMethod === 'increasePct') unit.basePrice = currentBase * (1 + value / 100)
  else if (priceMethod === 'decreasePct') unit.basePrice = currentBase * (1 - value / 100)
  else if (priceMethod === 'increaseAmt') unit.basePrice = currentBase + value
}

const bulkUpdateUnits = async (req, res) => {
  try {
    const { unitIds, status, note, priceMethod, priceValue, ...priceFields } = req.body
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
        applyPriceMethod(unit, priceMethod, priceValue)
        await unit.save()
      })
    )

    res.json({ message: `${units.length} unit(s) updated` })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { getUnits, getUnitById, createUnit, updateUnit, deleteUnit, bulkCreateUnits, bulkUpdateUnits }
