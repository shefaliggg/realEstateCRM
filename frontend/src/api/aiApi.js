import api from './axios'

async function callAi(capability, payload) {
  const { data } = await api.post(`/ai/${capability}`, payload)
  return data
}

export const askGlobalAssistant = (prompt) => callAi('global-assistant', { prompt })

export const suggestLeadFollowUp = (leadId) => callAi('suggest-lead-follow-up', { leadId })

export const generateAdCopy = (payload) => callAi('generate-ad-copy', payload)

export const recommendInventory = () => callAi('recommend-inventory', {})
