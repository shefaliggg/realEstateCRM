import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const storeSession = useCallback((data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    storeSession(data)
    return data
  }, [storeSession])

  const validateInvite = useCallback(async (token) => {
    const { data } = await api.get(`/auth/invite/${token}`)
    return data
  }, [])

  const acceptInvite = useCallback(async (token, password) => {
    const { data } = await api.post('/auth/invite/accept', { token, password })
    return data
  }, [])

  const verifyInviteOtp = useCallback(async (token, otp) => {
    const { data } = await api.post('/auth/invite/verify-otp', { token, otp })
    storeSession(data)
    return data
  }, [storeSession])

  const resendInviteOtp = useCallback(async (token) => {
    const { data } = await api.post('/auth/invite/resend-otp', { token })
    return data
  }, [])

  const createUserInvite = useCallback(async (payload) => {
    const { data } = await api.post('/users', payload)
    return data
  }, [])

  const getUsers = useCallback(async () => {
    const { data } = await api.get('/users')
    return data
  }, [])

  const getPendingInvites = useCallback(async () => {
    const { data } = await api.get('/users/invites/pending')
    return data
  }, [])

  const resendUserInvite = useCallback(async (id) => {
    const { data } = await api.post(`/users/${id}/resend-invite`)
    return data
  }, [])

  const revokeUserInvite = useCallback(async (id) => {
    const { data } = await api.post(`/users/${id}/revoke-invite`)
    return data
  }, [])

  const updateUser = useCallback(async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        validateInvite,
        acceptInvite,
        verifyInviteOtp,
        resendInviteOtp,
        createUserInvite,
        getUsers,
        getPendingInvites,
        resendUserInvite,
        revokeUserInvite,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
