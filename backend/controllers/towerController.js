const Tower = require('../models/Tower')
const Project = require('../models/Project')
const Unit = require('../models/Unit')

const uploadedFileUrl = (bucket) =>
  bucket && bucket[0] ? `/uploads/project-images/${bucket[0].filename}` : undefined

const uploadedFileUrls = (bucket) => (bucket || []).map((file) => `/uploads/project-images/${file.filename}`)

const parseBoolean = (value) => value === 'true' || value === true

const buildPayload = (body, files = {}) => {
  const payload = {}
  if (body.name !== undefined) payload.name = body.name
  if (body.code !== undefined) payload.code = body.code
  if (body.status !== undefined) payload.status = body.status
  if (body.numberOfFloors !== undefined) payload.numberOfFloors = Number(body.numberOfFloors) || 0
  if (body.numberOfBasements !== undefined) payload.numberOfBasements = Number(body.numberOfBasements) || 0
  if (body.numberOfLifts !== undefined) payload.numberOfLifts = Number(body.numberOfLifts) || 0
  if (body.numberOfFlats !== undefined) payload.numberOfFlats = Number(body.numberOfFlats) || 0
  if (body.possessionDate !== undefined) payload.possessionDate = body.possessionDate || null
  if (body.constructionStartDate !== undefined) payload.constructionStartDate = body.constructionStartDate || null
  if (body.completionDate !== undefined) payload.completionDate = body.completionDate || null
  if (body.occupancyCertificate !== undefined) payload.occupancyCertificate = parseBoolean(body.occupancyCertificate)
  if (body.fireNOC !== undefined) payload.fireNOC = parseBoolean(body.fireNOC)

  const featureKeys = ['serviceLift', 'passengerLift', 'generatorBackup', 'cctv', 'fireSafety', 'garbageChute', 'wheelchairAccess']
  if (featureKeys.some((k) => body[k] !== undefined)) {
    payload.features = {}
    featureKeys.forEach((k) => { if (body[k] !== undefined) payload.features[k] = parseBoolean(body[k]) })
  }

  if (body.siteEngineer !== undefined) payload.siteEngineer = body.siteEngineer || null
  if (body.salesManager !== undefined) payload.salesManager = body.salesManager || null

  const floorPlans = uploadedFileUrls(files.floorPlans)
  const towerLayout = uploadedFileUrl(files.towerLayout)
  const elevationDrawing = uploadedFileUrl(files.elevationDrawing)
  if (floorPlans.length > 0 || towerLayout || elevationDrawing) {
    payload.documents = {}
    if (floorPlans.length > 0) payload.documents.floorPlans = floorPlans
    if (towerLayout) payload.documents.towerLayout = towerLayout
    if (elevationDrawing) payload.documents.elevationDrawing = elevationDrawing
  }

  return payload
}

const withUnitStats = async (towers, builderId) => {
  const projectIds = [...new Set(towers.map((t) => String(t.project?._id || t.project)))]
  const units = await Unit.find({ project: { $in: projectIds }, builderId })
  return towers.map((t) => {
    const towerUnits = units.filter((u) => u.block === t.name && String(u.project) === String(t.project?._id || t.project))
    return {
      ...t.toObject(),
      unitStats: {
        total: towerUnits.length,
        available: towerUnits.filter((u) => u.status === 'Available').length,
        reserved: towerUnits.filter((u) => u.status === 'Reserved').length,
        booked: towerUnits.filter((u) => u.status === 'Booked').length,
        registered: towerUnits.filter((u) => u.status === 'Registered').length,
      },
    }
  })
}

const getTowers = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.params.projectId) filter.project = req.params.projectId
    else if (req.query.project) filter.project = req.query.project
    const towers = await Tower.find(filter)
      .populate('siteEngineer', 'name email')
      .populate('salesManager', 'name email')
      .sort({ name: 1 })
    res.json(await withUnitStats(towers, req.builderId))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getTowerById = async (req, res) => {
  try {
    const tower = await Tower.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('project', 'name')
      .populate('siteEngineer', 'name email phone')
      .populate('salesManager', 'name email phone')
    if (!tower) return res.status(404).json({ message: 'Tower not found' })
    const [withStats] = await withUnitStats([tower], req.builderId)
    res.json(withStats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createTower = async (req, res) => {
  try {
    const payload = buildPayload(req.body, req.files || {})
    if (!payload.name) return res.status(400).json({ message: 'Tower name is required' })

    const project = await Project.findOne({ _id: req.params.projectId, builderId: req.builderId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const tower = new Tower({ ...payload, project: req.params.projectId, builderId: req.builderId, createdBy: req.user._id })
    await tower.save()

    if (!(project.blocks || []).some((b) => b.toLowerCase() === tower.name.toLowerCase())) {
      project.blocks = [...(project.blocks || []), tower.name]
      await project.save()
    }

    res.status(201).json(tower)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A tower with this name already exists in this project' })
    res.status(400).json({ message: err.message })
  }
}

const updateTower = async (req, res) => {
  try {
    const payload = buildPayload(req.body, req.files || {})
    const tower = await Tower.findOneAndUpdate({ _id: req.params.id, builderId: req.builderId }, payload, { new: true, runValidators: true })
    if (!tower) return res.status(404).json({ message: 'Tower not found' })
    res.json(tower)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteTower = async (req, res) => {
  try {
    const tower = await Tower.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!tower) return res.status(404).json({ message: 'Tower not found' })
    res.json({ message: 'Tower deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getTowers, getTowerById, createTower, updateTower, deleteTower }
