const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const PaymentSchedule = require('../models/PaymentSchedule');
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Builder = require('../models/Builder');

const withEffectiveStatus = (schedule) => {
  const obj = schedule.toObject ? schedule.toObject() : schedule;
  if (obj.status === 'Pending' && obj.dueDate && new Date(obj.dueDate) < new Date()) {
    return { ...obj, status: 'Overdue' };
  }
  return obj;
};

const getMe = async (req, res) => {
  try {
    if (!req.membership.customer) {
      return res.status(404).json({ message: 'No customer record linked to this account.' });
    }
    const customer = await Customer.findOne({ _id: req.membership.customer, builderId: req.builderId })
      .populate('unit', 'block floor unitNo bhkType carpetArea basePrice')
      .populate('project', 'name location coverImage');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.membership.customer) {
      return res.status(404).json({ message: 'No customer record linked to this account.' });
    }
    const { phone, address } = req.body;
    const customer = await Customer.findOne({ _id: req.membership.customer, builderId: req.builderId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    const updated = await customer.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getBookings = async (req, res) => {
  try {
    if (!req.membership.customer) return res.json([]);
    const bookings = await Booking.find({ customer: req.membership.customer, builderId: req.builderId })
      .populate('unit', 'block floor unitNo bhkType carpetArea basePrice')
      .populate('project', 'name location coverImage')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPaymentSchedule = async (req, res) => {
  try {
    if (!req.membership.customer) return res.json([]);
    const bookings = await Booking.find({ customer: req.membership.customer, builderId: req.builderId }).select('_id');
    const schedules = await PaymentSchedule.find({
      booking: { $in: bookings.map((b) => b._id) },
      builderId: req.builderId,
    }).sort({ dueDate: 1 });
    res.json(schedules.map(withEffectiveStatus));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    if (!req.membership.customer) return res.json([]);
    const bookings = await Booking.find({ customer: req.membership.customer, builderId: req.builderId }).select('_id');
    const payments = await Payment.find({
      booking: { $in: bookings.map((b) => b._id) },
      builderId: req.builderId,
    }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConstructionUpdates = async (req, res) => {
  try {
    if (!req.membership.customer) return res.json([]);
    const customer = await Customer.findOne({ _id: req.membership.customer, builderId: req.builderId }).select('project');
    if (!customer) return res.json([]);
    const project = await Project.findOne({ _id: customer.project, builderId: req.builderId }).select('name constructionProgressPhotos');
    res.json({ projectName: project?.name, photos: project?.constructionProgressPhotos || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Only the public-facing document fields — same subset
// partnerPortalController.getDownloads exposes to channel partners.
const getDocuments = async (req, res) => {
  try {
    if (!req.membership.customer) return res.json(null);
    const customer = await Customer.findOne({ _id: req.membership.customer, builderId: req.builderId }).select('project');
    if (!customer) return res.json(null);
    const project = await Project.findOne({ _id: customer.project, builderId: req.builderId }).select(
      'name documents.brochure documents.priceSheet documents.paymentPlan documents.reraCertificate'
    );
    if (!project) return res.json(null);
    res.json({
      name: project.name,
      brochure: project.documents?.brochure || null,
      priceSheet: project.documents?.priceSheet || null,
      paymentPlan: project.documents?.paymentPlan || null,
      reraCertificate: project.documents?.reraCertificate || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// No ticketing system exists yet — this just surfaces the company's support
// contact info rather than a full inbox.
const getSupportInfo = async (req, res) => {
  try {
    const builder = await Builder.findById(req.builderId).select('name contactEmail contactPhone');
    res.json({
      builderName: builder?.name,
      contactEmail: builder?.contactEmail || null,
      contactPhone: builder?.contactPhone || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMe,
  updateMe,
  getBookings,
  getPaymentSchedule,
  getPayments,
  getConstructionUpdates,
  getDocuments,
  getSupportInfo,
};
