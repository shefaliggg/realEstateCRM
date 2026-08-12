// Single seam for a real LLM provider. Every capability funnels through this
// function; swapping in a real provider later means changing only this body.
function callModel(prompt) {
  return {
    stub: true,
    reply: `Simulated AI response for: "${prompt}"`,
  };
}

const suggestLeadFollowUp = async ({ leadId }) => {
  callModel(`Suggest a follow-up for lead ${leadId}`);
  return {
    stub: true,
    leadId,
    suggestion:
      'Call within 24 hours and share updated pricing for their shortlisted unit — they last engaged with the floor plan gallery.',
  };
};

const generateAdCopy = async ({ projectName, channel } = {}) => {
  callModel(`Generate ad copy for ${projectName || 'a project'} on ${channel || 'meta'}`);
  return {
    stub: true,
    channel: channel || 'meta',
    headline: `${projectName || 'Your next home'} is now open for bookings`,
    body: 'Spacious homes, prime location, flexible payment plans. Book a free site visit today.',
  };
};

const globalAssistant = async ({ prompt }) => {
  const { reply } = callModel(prompt);
  return { stub: true, reply };
};

const recommendInventory = async () => {
  callModel('Recommend inventory for this channel partner');
  return {
    stub: true,
    recommendation:
      'Units matching recent buyer interest in your city: 2 & 3 BHK homes in projects nearing possession tend to convert fastest for your referrals right now.',
  };
};

module.exports = { suggestLeadFollowUp, generateAdCopy, globalAssistant, recommendInventory };
