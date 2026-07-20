const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const PaymentSchedule = require('../models/PaymentSchedule')

const getPayments = async (req, res) => {
  try {
    const filter = {}
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
    const booking = await Booking.findById(req.body.booking)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const payment = new Payment({ ...req.body, recordedBy: req.user._id })
    await payment.save()

    booking.paidAmount = (booking.paidAmount || 0) + payment.amount
    await booking.save()

    if (req.body.schedule) {
      await PaymentSchedule.findByIdAndUpdate(req.body.schedule, { status: 'Paid' })
    }

    res.status(201).json(payment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getPayments, createPayment, deletePayment }
