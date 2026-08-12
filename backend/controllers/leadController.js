const Lead = require('../models/Lead')
const { sendMail } = require('../utils/email')

const formatVisitDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getLeads = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.query.nurtureStage) filter.nurtureStage = req.query.nurtureStage
    if (req.query.source) filter.source = req.query.source
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
    if (req.query.project) filter.project = req.query.project
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
    const lead = await Lead.findOne({ _id: req.params.id, builderId: req.builderId })
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
    const lead = new Lead({ ...req.body, createdBy: req.user._id, builderId: req.builderId })
    await lead.save()
    res.status(201).json(lead)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, builderId: req.builderId }, req.body, {
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
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
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
    const lead = await Lead.findOne({ _id: req.params.id, builderId: req.builderId })
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
    const lead = await Lead.findOne({ _id: req.params.id, builderId: req.builderId })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    const taskPayload = { ...req.body, createdBy: req.user._id }
    lead.followUpTasks.push(taskPayload)
    await lead.save()

    // Notify lead when a site visit is scheduled.
    if (taskPayload.type === 'Site Visit' && lead.email) {
      const formattedDate = formatVisitDate(taskPayload.dueDate)
      const subject = 'Your site visit has been scheduled'
      const text = [
        `Hello ${lead.name || 'there'},`,
        '',
        'Your site visit has been scheduled.',
        formattedDate ? `Date & Time: ${formattedDate}` : null,
        taskPayload.note ? `Details: ${taskPayload.note}` : null,
        '',
        'If you need to reschedule, please reply to this email or contact our team.',
      ].filter(Boolean).join('\n')

      try {
        await sendMail({
          to: lead.email,
          subject,
          text,
        })
      } catch (mailErr) {
        console.error('Site visit email failed:', mailErr.message)
      }
    }

    res.json(lead.followUpTasks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const completeTask = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, builderId: req.builderId })
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
