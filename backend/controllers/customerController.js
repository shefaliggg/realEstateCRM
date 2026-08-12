const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const { createInvitedUser } = require('../utils/inviteUser')
const { recordAudit } = require('../utils/auditLog')
const { getRequestOrigin } = require('../utils/requestOrigin')

const getCustomers = async (req, res) => {
  try {
    const filter = { builderId: req.builderId }
    if (req.query.project) filter.project = req.query.project
    if (req.query.unit) filter.unit = req.query.unit
    const customers = await Customer.find(filter)
      .populate('unit', 'block floor unitNo bhkType')
      .populate('project', 'name')
      .sort({ createdAt: -1 })

    const bookings = await Booking.find({ customer: { $in: customers.map((c) => c._id) }, builderId: req.builderId })
    const bookingsByCustomer = new Map()
    bookings.forEach((b) => {
      bookingsByCustomer.set(String(b.customer), b)
    })

    const withBalance = customers.map((c) => {
      const booking = bookingsByCustomer.get(String(c._id))
      return {
        ...c.toObject(),
        balance: booking ? booking.totalAmount - booking.paidAmount : 0,
      }
    })

    res.json(withBalance)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, builderId: req.builderId })
      .populate('unit', 'block floor unitNo bhkType carpetArea basePrice')
      .populate('project', 'name')
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json(customer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createCustomer = async (req, res) => {
  try {
    const customer = new Customer({ ...req.body, builderId: req.builderId, createdBy: req.user._id })
    await customer.save()
    res.status(201).json(customer)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, builderId: req.builderId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json(customer)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, builderId: req.builderId })
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json({ message: 'Customer deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const inviteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, builderId: req.builderId })
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    if (!customer.email) {
      return res.status(400).json({ message: 'Add an email address for this customer before inviting them to the portal.' })
    }

    const { user, membership, tempPassword, mailResult, joiningExistingAccount } = await createInvitedUser({
      name: customer.name,
      email: customer.email,
      role: 'customer',
      builderId: req.builderId,
      invitedBy: req.user._id,
      customer: customer._id,
      origin: getRequestOrigin(req),
    })

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'customer_invited',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { email: user.email },
    })

    res.status(201).json({
      joiningExistingAccount,
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    })
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message })
  }
}

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, inviteCustomer }
