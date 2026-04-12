const Unit = require('../models/Unit')

const getUnits = async (req, res) => {
  try {
    const filter = { project: req.params.projectId }
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
    const unit = await Unit.findById(req.params.id)
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
    const unit = new Unit({ ...req.body, project: req.params.projectId })
    await unit.save()
    res.status(201).json(unit)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    res.json(unit)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id)
    if (!unit) return res.status(404).json({ message: 'Unit not found' })
    res.json({ message: 'Unit deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getUnits, getUnitById, createUnit, updateUnit, deleteUnit }
