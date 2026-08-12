import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDefaultProduct } from '../config/products'

const passwordPolicyHint = '8+ chars with uppercase, lowercase, number and special character.'

export default function LoginPage() {
  const { login, setPassword, selectBuilder } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Set only when an account belongs to more than one organization — the
  // login response withholds a scoped session until one is picked.
  const [memberships, setMemberships] = useState(null)
  // Set only when the account is still on its invite's temporary password —
  // the login response withholds a session until a new password is set.
  const [resetToken, setResetToken] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      if (data.requiresPasswordChange) {
        setResetToken(data.resetToken)
        return
      }
      if (data.requiresBuilderSelection) {
        setMemberships(data.memberships)
        return
      }
      navigate(getDefaultProduct(data.role).homePath)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const data = await setPassword(resetToken, newPassword)
      if (data.requiresBuilderSelection) {
        setResetToken(null)
        setMemberships(data.memberships)
        return
      }
      navigate(getDefaultProduct(data.role).homePath)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to set password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBuilder = async (builderId) => {
    setError('')
    setLoading(true)
    try {
      const data = await selectBuilder(builderId)
      navigate(getDefaultProduct(data.role).homePath)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open that organization. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
          <p className="text-sm text-gray-500 mb-6">
            You're signing in with a temporary password. Choose a new password to continue.
          </p>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder={passwordPolicyHint}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Saving...' : 'Set Password and Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (memberships) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Choose an organization</h1>
          <p className="text-sm text-gray-500 mb-6">Your account belongs to more than one organization on PropVault.</p>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            {memberships.map((m) => (
              <button
                key={m.membershipId}
                type="button"
                disabled={loading}
                onClick={() => handleSelectBuilder(m.builderId)}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition"
              >
                <p className="font-semibold text-gray-900">{m.builderName}</p>
                <p className="text-xs text-gray-500 capitalize">{m.role.replace(/_/g, ' ')}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PropVault Builder</h1>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Use your invited account credentials to continue
        </p>
      </div>
    </div>
  )
}
