import api from './axios'

export const getCustomers = () => api.get('/customers').then((r) => r.data)
export const createCustomer = (payload) => api.post('/customers', payload).then((r) => r.data)
export const inviteCustomer = (id) => api.post(`/customers/${id}/invite`).then((r) => r.data)

export const getBookings = () => api.get('/bookings').then((r) => r.data)
export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data)
export const updateBooking = (id, payload) => api.put(`/bookings/${id}`, payload).then((r) => r.data)

export const getSchedules = () => api.get('/schedules').then((r) => r.data)
export const createSchedule = (payload) => api.post('/schedules', payload).then((r) => r.data)
export const updateSchedule = (id, payload) => api.put(`/schedules/${id}`, payload).then((r) => r.data)

export const getPayments = () => api.get('/payments').then((r) => r.data)
export const createPayment = (payload) => api.post('/payments', payload).then((r) => r.data)
