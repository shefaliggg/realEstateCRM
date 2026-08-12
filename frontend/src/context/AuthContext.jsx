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
    if (data.requiresPasswordChange) {
      // Account is still on its invite's temporary password — no session yet,
      // the caller must collect a new password and call setPassword below.
      return data
    }
    if (data.requiresBuilderSelection) {
      // More than one active organization membership — stash the short-lived
      // preToken so the follow-up select-builder call is authenticated, but
      // don't treat this as a real session yet (no `user` in localStorage).
      localStorage.setItem('token', data.preToken)
      return data
    }
    storeSession(data)
    return data
  }, [storeSession])

  const setPassword = useCallback(async (resetToken, newPassword) => {
    const { data } = await api.post('/auth/set-password', { resetToken, newPassword })
    if (data.requiresBuilderSelection) {
      // Same bridge as login's multi-org case — stash the preToken and let
      // the caller prompt for select-builder next.
      localStorage.setItem('token', data.preToken)
    } else {
      storeSession(data)
    }
    return data
  }, [storeSession])

  const selectBuilder = useCallback(async (builderId) => {
    const { data } = await api.post('/auth/select-builder', { builderId })
    storeSession(data)
    return data
  }, [storeSession])

  const getMyMemberships = useCallback(async () => {
    const { data } = await api.get('/auth/memberships')
    return data
  }, [])

  // Re-fetches the current session (role, builder, permissions) without a
  // full re-login — used after an admin edits their own role's permissions
  // so the change is reflected immediately instead of on next login.
  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser((prev) => {
      const next = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
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
        setPassword,
        selectBuilder,
        getMyMemberships,
        refreshUser,
        logout,
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
