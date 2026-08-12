const ChannelPartner = require('../models/ChannelPartner');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Lead = require('../models/Lead');
const Booking = require('../models/Booking');
const Deal = require('../models/Deal');
const Membership = require('../models/Membership');
const { sanitizeUser } = require('../utils/sanitizeUser');
const { createInvitedUser } = require('../utils/inviteUser');
const { recordAudit } = require('../utils/auditLog');
const { getRequestOrigin } = require('../utils/requestOrigin');

const USER_POPULATE_FIELDS = 'name email phone isActive passwordSet emailVerified';

const sanitizeTeamMembership = (membership) => ({
  membershipId: membership._id,
  role: membership.role,
  status: membership.status,
  inviteStatus: membership.inviteStatus,
  activatedAt: membership.activatedAt,
  createdAt: membership.createdAt,
  user: membership.userId ? sanitizeUser(membership.userId) : null,
});

// partner_admin sees the whole org's records; partner_agent only sees leads
// they registered or were assigned — the same createdBy/assignedTo fields
// Lead/Deal already carry for internal-staff assignment.
const scopeToAgent = (req, baseQuery) => {
  if (req.effectiveRole !== 'partner_agent') return baseQuery;
  return { ...baseQuery, $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] };
};

const getMe = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(404).json({ message: 'No channel partner company linked to this account.' });
    }
    const partner = await ChannelPartner.findOne({ _id: req.membership.channelPartner, builderId: req.builderId });
    if (!partner) return res.status(404).json({ message: 'Channel partner not found' });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(404).json({ message: 'No channel partner company linked to this account.' });
    }
    const { contactPerson, phone, city } = req.body;
    const partner = await ChannelPartner.findOne({ _id: req.membership.channelPartner, builderId: req.builderId });
    if (!partner) return res.status(404).json({ message: 'Channel partner not found' });

    partner.contactPerson = contactPerson ?? partner.contactPerson;
    partner.phone = phone ?? partner.phone;
    partner.city = city ?? partner.city;

    const updated = await partner.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// No per-partner project assignment exists yet — every partner sees every
// project, same breadth staff see. Revisit once Project gains a
// partner-visibility field.
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ builderId: req.builderId })
      .select('name code type status location pricing coverImage images amenities highlights')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const units = await Unit.find({ status: 'Available', builderId: req.builderId })
      .populate('project', 'name location type')
      .sort({ createdAt: -1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLeads = async (req, res) => {
  try {
    if (!req.membership.channelPartner) return res.json([]);
    const leads = await Lead.find(
      scopeToAgent(req, { channelPartner: req.membership.channelPartner, builderId: req.builderId })
    )
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerLead = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(400).json({ message: 'Only channel partner accounts can register leads.' });
    }
    const { name, phone, email, budget, city, requirements, project } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Lead name and phone are required' });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      budget,
      city,
      requirements,
      project: project || undefined,
      source: 'Referral',
      channelPartner: req.membership.channelPartner,
      createdBy: req.user._id,
      // Self-assigned when an agent registers it, so it's immediately
      // visible to them without waiting on the partner admin to assign it.
      assignedTo: req.effectiveRole === 'partner_agent' ? req.user._id : undefined,
      builderId: req.builderId,
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getBookings = async (req, res) => {
  try {
    if (!req.membership.channelPartner) return res.json([]);
    const bookings = await Booking.find(
      scopeToAgent(req, { channelPartner: req.membership.channelPartner, builderId: req.builderId })
    )
      .populate({ path: 'unit', select: 'block floor unitNo bhkType', populate: { path: 'project', select: 'name' } })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommissions = async (req, res) => {
  try {
    if (!req.membership.channelPartner) return res.json([]);
    const deals = await Deal.find(
      scopeToAgent(req, { channelPartner: req.membership.channelPartner, builderId: req.builderId })
    )
      .select('dealName stage value commission commissionStatus commissionDueDate commissionPaidDate unit')
      .populate({ path: 'unit', select: 'block floor unitNo bhkType', populate: { path: 'project', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  List this partner org's people (partner_admin + agents)
// @route GET /api/partner/team
const getTeam = async (req, res) => {
  try {
    if (!req.membership.channelPartner) return res.json([]);
    const memberships = await Membership.find({
      builderId: req.builderId,
      channelPartner: req.membership.channelPartner,
    })
      .sort({ createdAt: -1 })
      .populate('userId', USER_POPULATE_FIELDS);
    res.json(memberships.map(sanitizeTeamMembership));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Invite a new agent into this partner org
// @route POST /api/partner/team
const inviteAgent = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(400).json({ message: 'No channel partner company linked to this account.' });
    }
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Please fill name and email' });
    }

    const { user, membership, tempPassword, mailResult, joiningExistingAccount } = await createInvitedUser({
      name,
      email,
      role: 'partner_agent',
      builderId: req.builderId,
      invitedBy: req.user._id,
      channelPartner: req.membership.channelPartner,
      origin: getRequestOrigin(req),
    });

    recordAudit({
      builderId: req.builderId,
      actor: req.user._id,
      action: 'partner_agent_invited',
      targetType: 'Membership',
      targetId: membership._id,
      metadata: { email: user.email },
    });

    res.status(201).json({
      agent: sanitizeTeamMembership({ ...membership.toObject(), userId: user }),
      joiningExistingAccount,
      invite: {
        delivery: mailResult.sent ? 'email' : 'not_configured',
        username: process.env.NODE_ENV === 'production' ? undefined : user.email,
        tempPassword: process.env.NODE_ENV === 'production' ? undefined : tempPassword,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc  Activate/deactivate or remove an agent in this partner org
// @route PUT /api/partner/team/:membershipId
const updateTeamMember = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(400).json({ message: 'No channel partner company linked to this account.' });
    }
    const membership = await Membership.findOne({
      _id: req.params.membershipId,
      builderId: req.builderId,
      channelPartner: req.membership.channelPartner,
    });
    if (!membership) return res.status(404).json({ message: 'Team member not found' });
    if (String(membership._id) === String(req.membership._id)) {
      return res.status(400).json({ message: 'Cannot change your own membership here' });
    }

    const { isActive, remove } = req.body;
    if (remove) {
      await membership.deleteOne();
      return res.json({ message: 'Agent removed from team' });
    }

    if (isActive !== undefined) {
      membership.status = isActive ? 'active' : 'revoked';
      await membership.save();
    }

    res.json(sanitizeTeamMembership(await membership.populate('userId', USER_POPULATE_FIELDS)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Assign a lead to one of this org's agents
// @route PUT /api/partner/leads/:id/assign
const assignLead = async (req, res) => {
  try {
    if (!req.membership.channelPartner) {
      return res.status(400).json({ message: 'No channel partner company linked to this account.' });
    }
    const { agentUserId } = req.body;
    const lead = await Lead.findOne({
      _id: req.params.id,
      channelPartner: req.membership.channelPartner,
      builderId: req.builderId,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (agentUserId) {
      const agentMembership = await Membership.findOne({
        userId: agentUserId,
        builderId: req.builderId,
        channelPartner: req.membership.channelPartner,
      });
      if (!agentMembership) return res.status(400).json({ message: 'Not a member of this partner org' });
    }

    lead.assignedTo = agentUserId || null;
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Only the public-facing document fields — legal/approval/occupancy/
// completion documents stay internal-staff-only.
const getDownloads = async (req, res) => {
  try {
    const projects = await Project.find({ builderId: req.builderId })
      .select('name documents.brochure documents.priceSheet documents.paymentPlan documents.reraCertificate');
    res.json(
      projects.map((p) => ({
        _id: p._id,
        name: p.name,
        brochure: p.documents?.brochure || null,
        priceSheet: p.documents?.priceSheet || null,
        paymentPlan: p.documents?.paymentPlan || null,
        reraCertificate: p.documents?.reraCertificate || null,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMe,
  updateMe,
  getProjects,
  getInventory,
  getLeads,
  registerLead,
  getBookings,
  getCommissions,
  getTeam,
  inviteAgent,
  updateTeamMember,
  assignLead,
  getDownloads,
};
