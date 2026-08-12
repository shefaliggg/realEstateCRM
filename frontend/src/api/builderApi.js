import api from './axios'

export const getMyBuilder = () => api.get('/builder/me').then((r) => r.data)
export const updateMyBuilder = (payload) => api.put('/builder/me', payload).then((r) => r.data)
