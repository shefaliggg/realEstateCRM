const Customer = require('../models/Customer')
const Booking = require('../models/Booking')

const getCustomers = async (req, res) => {
  try {
    const filter = {}
    if (req.query.project) filter.project = req.query.project
    if (req.query.unit) filter.unit = req.query.unit
    const customers = await Customer.find(filter)
      .populate('unit', 'block floor unitNo bhkType')
      .populate('project', 'name')
      .sort({ createdAt: -1 })

    const bookings = await Booking.find({ customer: { $in: customers.map((c) => c._id) } })
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
    const customer = await Customer.findById(req.params.id)
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
    const customer = new Customer({ ...req.body, createdBy: req.user._id })
    await customer.save()
    res.status(201).json(customer)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json(customer)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json({ message: 'Customer deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer }
