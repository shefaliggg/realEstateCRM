const Deal = require('../models/Deal')
const Unit = require('../models/Unit')
const Lead = require('../models/Lead')

const getDeals = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.query.stage) filter.stage = req.query.stage
    if (req.query.hasPartner === 'true') filter.channelPartner = { $ne: null }
    if (req.query.channelPartner) filter.channelPartner = req.query.channelPartner
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
    if (req.query.project) {
      const unitIds = await Unit.find({ project: req.query.project }).distinct('_id')
      filter.unit = { $in: unitIds }
    }
    const deals = await Deal.find(filter)
      .populate({ path: 'unit', select: 'block floor unitNo bhkType status', populate: { path: 'project', select: 'name' } })
      .populate('lead', 'name phone email nurtureStage')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
    res.json(deals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate({ path: 'unit', select: 'block floor unitNo bhkType carpetArea basePrice status', populate: { path: 'project', select: 'name location' } })
      .populate('lead', 'name phone email nurtureStage budget unitInterest')
      .populate('assignedTo', 'name email')
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    res.json(deal)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createDeal = async (req, res) => {
  try {
    const deal = new Deal({ ...req.body, createdBy: req.user._id, builderId: req.builderId })
    if (!deal.channelPartner && deal.lead) {
      const lead = await Lead.findOne({ _id: deal.lead, builderId: req.builderId }).select('channelPartner')
      if (lead?.channelPartner) deal.channelPartner = lead.channelPartner
    }
    await deal.save()
    // Mark unit as Reserved when deal is created
    await Unit.findByIdAndUpdate(req.body.unit, {
      status: 'Reserved',
      currentDeal: deal._id,
    })
    res.status(201).json(deal)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateDeal = async (req, res) => {
  try {
    const existing = await Deal.findOne({ _id: req.params.id, builderId: req.builderId })
    if (!existing) return res.status(404).json({ message: 'Deal not found' })

    const deal = await Deal.findOneAndUpdate({ _id: req.params.id, builderId: req.builderId }, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({ path: 'unit', select: 'block floor unitNo bhkType status', populate: { path: 'project', select: 'name' } })
      .populate('lead', 'name phone email')
      .populate('assignedTo', 'name email')

    // Unit status side effects on stage changes
    if (req.body.stage && req.body.stage !== existing.stage) {
      if (req.body.stage === 'Won') {
        await Unit.findByIdAndUpdate(existing.unit, { status: 'Booked' })
      } else if (req.body.stage === 'Lost') {
        await Unit.findByIdAndUpdate(existing.unit, { status: 'Available', currentDeal: null })
      }
    }

    res.json(deal)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!deal) return res.status(404).json({ message: 'Deal not found' })
    // Release unit back to Available if it was only Reserved
    await Unit.findOneAndUpdate(
      { _id: deal.unit, status: 'Reserved' },
      { status: 'Available', currentDeal: null }
    )
    res.json({ message: 'Deal deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDeals, getDealById, createDeal, updateDeal, deleteDeal }
