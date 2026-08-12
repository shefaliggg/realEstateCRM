const AuditLog = require('../models/AuditLog');

// Fire-and-forget: an audit write must never fail the request it's logging.
// builderId is null for platform-level actions (e.g. inviting a builder).
const recordAudit = ({ builderId = null, actor, action, targetType, targetId, metadata }) => {
  AuditLog.create({ builderId, actor, action, targetType, targetId, metadata }).catch((err) => {
    console.error('Failed to record audit log:', err.message);
  });
};

module.exports = { recordAudit };
