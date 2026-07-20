const PaymentSchedule = require('../models/PaymentSchedule')

const withEffectiveStatus = (schedule) => {
  const obj = schedule.toObject ? schedule.toObject() : schedule
  if (obj.status === 'Pending' && obj.dueDate && new Date(obj.dueDate) < new Date()) {
    return { ...obj, status: 'Overdue' }
  }
  return obj
}

const getSchedules = async (req, res) => {
  try {
    const filter = {}
    if (req.query.project) filter.project = req.query.project
    if (req.query.booking) filter.booking = req.query.booking
    const schedules = await PaymentSchedule.find(filter)
      .populate({ path: 'booking', select: 'unit customer totalAmount paidAmount', populate: [
        { path: 'unit', select: 'block unitNo' },
        { path: 'customer', select: 'name phone' },
      ] })
      .sort({ dueDate: 1 })
    res.json(schedules.map(withEffectiveStatus))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createSchedule = async (req, res) => {
  try {
    const schedule = new PaymentSchedule(req.body)
    await schedule.save()
    res.status(201).json(schedule)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json(schedule)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.findByIdAndDelete(req.params.id)
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json({ message: 'Schedule deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule }
