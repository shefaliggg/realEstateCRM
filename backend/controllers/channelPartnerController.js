const ChannelPartner = require('../models/ChannelPartner');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const { createInvitedUser } = require('../utils/inviteUser');
const { recordAudit } = require('../utils/auditLog');
const { getRequestOrigin } = require('../utils/requestOrigin');

// @desc  List channel partners
// @route GET /api/channel-partners
const getChannelPartners = async (req, res) => {
  try {
    const partners = await ChannelPartner.find({ builderId: req.builderId }).sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get a partner + their leads and deals/commissions
// @route GET /api/channel-partners/:id
const getChannelPartnerById = async (req, res) => {
  try {
    const partner = await ChannelPartner.findOne({ _id: req.params.id, builderId: req.builderId });
    if (!partner) return res.status(404).json({ message: 'Channel partner not found' });

    const [leads, deals] = await Promise.all([
      Lead.find({ channelPartner: partner._id, builderId: req.builderId }).sort({ createdAt: -1 }),
      Deal.find({ channelPartner: partner._id, builderId: req.builderId })
        .populate({ path: 'unit', select: 'block floor unitNo bhkType', populate: { path: 'project', select: 'name' } })
        .sort({ createdAt: -1 }),
    ]);

    res.json({ partner, leads, deals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update partner details / toggle active
// @route PUT /api/channel-partners/:id
const updateChannelPartner = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, city, commissionRate, active } = req.body;
    const partner = await ChannelPartner.findOne({ _id: req.params.id, builderId: req.builderId });
    if (!partner) return res.status(404).json({ message: 'Channel partner not found' });

    partner.name = name ?? partner.name;
    partner.contactPerson = contactPerson ?? partner.contactPerson;
    partner.phone = phone ?? partner.phone;
    partner.email = email ?? partner.email;
    partner.city = city ?? partner.city;
    partner.commissionRate = commissionRate ?? partner.commissionRate;
    partner.active = active ?? partner.active;

    const updated = await partner.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a channel partner and invite their portal login
// @route POST /api/channel-partners
const createChannelPartner = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, city, commissionRate } = req.body;
    if (!name || !contactPerson || !phone || !email) {
      return res.status(400).json({ message: 'Please fill company name, contact person, phone and email' });
    }

    const partner = await ChannelPartner.create({
      builderId: req.builderId,
      name,
      contactPerson,
      phone,
      email,
      city,
      commissionRate: Number(commissionRate || 0),
      active: true,
      createdBy: req.user._id,
    });

    const { mailResult } = await createInvitedUser({
      name: contactPerson,
      email,
      role: 'partner_admin',
      builderId: req.builderId,
      invitedBy: req.user._id,
      channelPartner: partner._id,
      origin: getRequestOrigin(req),
    });

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'channel_partner_created',
      targetType: 'ChannelPartner',
      targetId: partner._id,
      metadata: { name, email },
    });

    res.status(201).json({
      partner,
      invite: { delivery: mailResult.sent ? 'email' : 'not_configured' },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = {
  getChannelPartners,
  getChannelPartnerById,
  updateChannelPartner,
  createChannelPartner,
};
