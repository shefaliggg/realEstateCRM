const aiService = require('../services/aiService');

const CAPABILITIES = {
  'global-assistant': aiService.globalAssistant,
  'suggest-lead-follow-up': aiService.suggestLeadFollowUp,
  'generate-ad-copy': aiService.generateAdCopy,
  'recommend-inventory': aiService.recommendInventory,
};

const runCapability = async (req, res) => {
  const handler = CAPABILITIES[req.params.capability];
  if (!handler) {
    return res.status(400).json({ message: `Unknown AI capability: ${req.params.capability}` });
  }
  try {
    const result = await handler({ ...req.body, user: req.user });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { runCapability };
