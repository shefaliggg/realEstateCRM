const Project = require('../models/Project')
const Unit = require('../models/Unit')

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
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
    const project = await Project.findById(req.params.id)
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
    const project = new Project({ ...req.body, createdBy: req.user._id })
    await project.save()
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
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
