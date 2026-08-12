const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const PaymentSchedule = require('../models/PaymentSchedule')

const getPayments = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.query.project) filter.project = req.query.project
    if (req.query.booking) filter.booking = req.query.booking
    const payments = await Payment.find(filter)
      .populate({ path: 'booking', select: 'unit customer', populate: [
        { path: 'unit', select: 'block unitNo' },
        { path: 'customer', select: 'name phone' },
      ] })
      .sort({ date: -1 })
    res.json(payments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.body.booking, builderId: req.builderId })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const payment = new Payment({ ...req.body, builderId: req.builderId, recordedBy: req.user._id })
    await payment.save()

    booking.paidAmount = (booking.paidAmount || 0) + payment.amount
    await booking.save()

    if (req.body.schedule) {
      await PaymentSchedule.findOneAndUpdate(
        { _id: req.body.schedule, builderId: req.builderId },
        { status: 'Paid' }
      )
    }

    res.status(201).json(payment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getPayments, createPayment, deletePayment }
