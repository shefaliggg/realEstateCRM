import api from './axios'

export const getMe = () => api.get('/customer-portal/me').then((r) => r.data)
export const updateMe = (payload) => api.put('/customer-portal/me', payload).then((r) => r.data)
export const getCustomerBookings = () => api.get('/customer-portal/bookings').then((r) => r.data)
export const getCustomerPaymentSchedule = () => api.get('/customer-portal/payment-schedule').then((r) => r.data)
export const getCustomerPayments = () => api.get('/customer-portal/payments').then((r) => r.data)
export const getConstructionUpdates = () => api.get('/customer-portal/construction-updates').then((r) => r.data)
export const getCustomerDocuments = () => api.get('/customer-portal/documents').then((r) => r.data)
export const getSupportInfo = () => api.get('/customer-portal/support').then((r) => r.data)
