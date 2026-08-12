import api from './axios'

export const getMe = () => api.get('/partner/me').then((r) => r.data)
export const updateMe = (payload) => api.put('/partner/me', payload).then((r) => r.data)
export const getPartnerProjects = () => api.get('/partner/projects').then((r) => r.data)
export const getPartnerInventory = () => api.get('/partner/inventory').then((r) => r.data)
export const getPartnerLeads = () => api.get('/partner/leads').then((r) => r.data)
export const registerPartnerLead = (payload) => api.post('/partner/leads', payload).then((r) => r.data)
export const getPartnerBookings = () => api.get('/partner/bookings').then((r) => r.data)
export const getPartnerCommissions = () => api.get('/partner/commissions').then((r) => r.data)
export const getPartnerDownloads = () => api.get('/partner/downloads').then((r) => r.data)
export const getPartnerTeam = () => api.get('/partner/team').then((r) => r.data)
export const invitePartnerAgent = (payload) => api.post('/partner/team', payload).then((r) => r.data)
export const updatePartnerTeamMember = (membershipId, payload) =>
  api.put(`/partner/team/${membershipId}`, payload).then((r) => r.data)
export const assignPartnerLead = (leadId, agentUserId) =>
  api.put(`/partner/leads/${leadId}/assign`, { agentUserId }).then((r) => r.data)
