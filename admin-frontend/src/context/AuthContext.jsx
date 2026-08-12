import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const PLATFORM_ROLES = ['platform_admin', 'platform_staff']

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
    if (!PLATFORM_ROLES.includes(data.role)) {
      // The shared login endpoint doesn't know which frontend is calling it —
      // reject anything that isn't PropVault platform staff here.
      throw Object.assign(new Error('This account does not have access to the Platform Portal'), {
        response: { data: { message: 'This account does not have access to the Platform Portal' } },
      })
    }
    storeSession(data)
    return data
  }, [storeSession])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
