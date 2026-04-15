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

const normalizeProjectPayload = (body, files = []) => {
  const payload = { ...body }
  const fileBuckets = Array.isArray(files)
    ? { images: files, videos: [] }
    : (files || {})

  if (body.totalUnits !== undefined) {
    payload.totalUnits = body.totalUnits === '' ? undefined : Number(body.totalUnits)
  }

  const blocks = parseArrayField(body.blocks)
  if (blocks !== undefined) payload.blocks = blocks

  const bhkTypes = parseArrayField(body.bhkTypes)
  if (bhkTypes !== undefined) payload.bhkTypes = bhkTypes

  const amenities = parseArrayField(body.amenities)
  if (amenities !== undefined) payload.amenities = amenities

  const highlights = parseArrayField(body.highlights)
  if (highlights !== undefined) payload.highlights = highlights

  const managedBy = parseArrayField(body.managedBy)
  if (managedBy !== undefined) payload.managedBy = managedBy

  if (
    body.address !== undefined
    || body.locality !== undefined
    || body.city !== undefined
    || body.state !== undefined
    || body.pincode !== undefined
    || body.googleMapLink !== undefined
  ) {
    payload.location = {
      address: body.address || '',
      locality: body.locality || '',
      city: body.city || '',
      state: body.state || '',
      pincode: body.pincode || '',
      googleMapLink: body.googleMapLink || '',
    }
  }

  const uploadedImages = (fileBuckets.images || []).map((file) => `/uploads/project-images/${file.filename}`)
  const uploadedVideos = (fileBuckets.videos || []).map((file) => `/uploads/project-images/${file.filename}`)
  const explicitImages = parseArrayField(body.images)
  const explicitVideos = parseArrayField(body.videos)

  if (uploadedImages.length > 0) {
    payload.images = uploadedImages
  } else if (explicitImages !== undefined) {
    payload.images = explicitImages
  }

  if (uploadedVideos.length > 0) {
    payload.videos = uploadedVideos
  } else if (explicitVideos !== undefined) {
    payload.videos = explicitVideos
  }

  delete payload.address
  delete payload.locality
  delete payload.city
  delete payload.state
  delete payload.pincode
  delete payload.googleMapLink

  return payload
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('managedBy', 'name email phone role')
      .sort({ createdAt: -1 })
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const units = await Unit.find({ project: project._id })
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
    const project = await Project.findById(req.params.id).populate('managedBy', 'name email phone role')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    const units = await Unit.find({ project: project._id })
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
    const project = new Project({ ...payload, createdBy: req.user._id })
    await project.save()
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateProject = async (req, res) => {
  try {
    const payload = normalizeProjectPayload(req.body, req.files)
    const project = await Project.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('managedBy', 'name email phone role')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject }
