const Lead = require('../models/Lead')
const Booking = require('../models/Booking')
const Payment = require('../models/Payment')
const PaymentSchedule = require('../models/PaymentSchedule')

const withEffectiveStatus = (schedule) => {
  const obj = schedule.toObject ? schedule.toObject() : schedule
  if (obj.status === 'Pending' && obj.dueDate && new Date(obj.dueDate) < new Date()) {
    return { ...obj, status: 'Overdue' }
  }
  return obj
}

const startOfMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// @desc  Company-wide revenue/collections/activity rollup for the builder_admin dashboard.
// @route GET /api/dashboard/admin-summary
const getAdminSummary = async (req, res) => {
  try {
    const builderId = req.builderId
    const monthStart = startOfMonth()

    const [leads, bookings, payments, schedules] = await Promise.all([
      Lead.find({ builderId }).select('createdAt followUpTasks'),
      Booking.find({ builderId }).select('createdAt status totalAmount'),
      Payment.find({ builderId }).select('amount'),
      PaymentSchedule.find({ builderId }).select('status dueDate amount'),
    ])

    const revenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
    const collected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pending = schedules
      .map(withEffectiveStatus)
      .filter((s) => s.status !== 'Paid')
      .reduce((sum, s) => sum + Number(s.amount || 0), 0)

    const leadsThisMonth = leads.filter((l) => new Date(l.createdAt) >= monthStart).length
    const bookingsThisMonth = bookings.filter((b) => new Date(b.createdAt) >= monthStart).length
    const siteVisitsThisMonth = leads.reduce((count, lead) => {
      const visits = (lead.followUpTasks || []).filter(
        (t) => t.type === 'Site Visit' && t.dueDate && new Date(t.dueDate) >= monthStart
      )
      return count + visits.length
    }, 0)
    const conversionRate = leads.length ? Number(((bookings.length / leads.length) * 100).toFixed(1)) : 0

    res.json({
      revenue,
      collected,
      pending,
      leadsThisMonth,
      siteVisitsThisMonth,
      bookingsThisMonth,
      conversionRate,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getAdminSummary }
