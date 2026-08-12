const Booking = require('../models/Booking')
const Unit = require('../models/Unit')
const PaymentSchedule = require('../models/PaymentSchedule')
const Payment = require('../models/Payment')

const getBookings = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.query.project) filter.project = req.query.project
    if (req.query.unit) filter.unit = req.query.unit
    if (req.query.customer) filter.customer = req.query.customer
    if (req.query.status) filter.status = req.query.status
    const bookings = await Booking.find(filter)
      .populate('unit', 'block floor unitNo bhkType')
      .populate('customer', 'name phone email')
      .populate('bookedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('unit', 'block floor unitNo bhkType carpetArea basePrice')
      .populate('customer', 'name phone email address')
      .populate('bookedBy', 'name email')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    const schedules = await PaymentSchedule.find({ booking: booking._id, builderId: req.builderId }).sort({ dueDate: 1 })
    const payments = await Payment.find({ booking: booking._id, builderId: req.builderId }).sort({ date: -1 })
    res.json({ ...booking.toObject(), schedules, payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createBooking = async (req, res) => {
  try {
    const unit = await Unit.findOne({ _id: req.body.unit, builderId: req.builderId })
    if (!unit) return res.status(404).json({ message: 'Unit not found' })

    const booking = new Booking({ ...req.body, builderId: req.builderId, bookedBy: req.user._id, createdBy: req.user._id })
    await booking.save()

    unit.status = 'Booked'
    unit.statusHistory.push({ status: 'Booked', changedBy: req.user._id, note: 'Booking created' })
    await unit.save()

    res.status(201).json(booking)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, builderId: req.builderId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    if (req.body.status === 'Completed' || req.body.status === 'Cancelled') {
      const unit = await Unit.findOne({ _id: booking.unit, builderId: req.builderId })
      if (unit) {
        unit.status = req.body.status === 'Completed' ? 'Registered' : 'Available'
        unit.statusHistory.push({
          status: unit.status,
          changedBy: req.user._id,
          note: `Booking marked ${req.body.status}`,
        })
        await unit.save()
      }
    }

    res.json(booking)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ message: 'Booking deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getBookings, getBookingById, createBooking, updateBooking, deleteBooking }
