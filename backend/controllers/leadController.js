const Lead = require('../models/Lead')

const getLeads = async (req, res) => {
  try {
    const filter = {}
    if (req.query.nurtureStage) filter.nurtureStage = req.query.nurtureStage
    if (req.query.source) filter.source = req.query.source
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('unitInterest', 'block floor unitNo bhkType status')
      .sort({ createdAt: -1 })
    res.json(leads)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'unitInterest',
        select: 'block floor unitNo bhkType status carpetArea basePrice',
        populate: { path: 'project', select: 'name' },
      })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createLead = async (req, res) => {
  try {
    const lead = new Lead({ ...req.body, createdBy: req.user._id })
    await lead.save()
    res.status(201).json(lead)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('unitInterest', 'block floor unitNo bhkType status')
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json({ message: 'Lead deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addNote = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ message: 'Note text is required' })
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.notes.push({ text, author: req.user._id, authorName: req.user.name })
    await lead.save()
    res.json(lead.notes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addTask = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.followUpTasks.push({ ...req.body, createdBy: req.user._id })
    await lead.save()
    res.json(lead.followUpTasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const completeTask = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const task = lead.followUpTasks.id(req.params.taskId)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    task.completed = true
    task.completedAt = new Date()
    await lead.save()
    res.json(lead.followUpTasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, addNote, addTask, completeTask }
