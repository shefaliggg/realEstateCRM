import api from './axios'

export const getChannelPartners = () => api.get('/channel-partners').then((r) => r.data)
export const getChannelPartnerById = (id) => api.get(`/channel-partners/${id}`).then((r) => r.data)
export const createChannelPartner = (payload) => api.post('/channel-partners', payload).then((r) => r.data)
export const updateChannelPartner = (id, payload) => api.put(`/channel-partners/${id}`, payload).then((r) => r.data)
