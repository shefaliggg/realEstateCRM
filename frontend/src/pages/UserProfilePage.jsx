import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'

const ROLES = [
  'admin',
  'sales_manager',
  'sales_executive',
  'crm_manager',
  'crm_executive',
  'marketing_manager',
  'marketing_executive',
]

const PENDING_STATUSES = ['pending', 'pending_otp']

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right break-all">{value}</span>
    </div>
  )
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // activate / deactivate
  const [toggling, setToggling] = useState(false)
  const [toggleMsg, setToggleMsg] = useState('')

  // resend invite
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  // edit mode
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(({ data }) => {
        setUser(data)
        setEditForm({ name: data.name, email: data.email, phone: data.phone || '', role: data.role })
      })
      .catch(() => setError('Failed to load user profile.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggleActive() {
    setToggling(true)
    setToggleMsg('')
    try {
      const { data } = await api.put(`/users/${id}`, { isActive: !user.isActive })
      setUser(data)
      setToggleMsg(data.isActive ? 'User activated.' : 'User deactivated.')
    } catch {
      setToggleMsg('Failed to update status.')
    } finally {
      setToggling(false)
    }
  }

  async function handleResendInvite() {
    setResending(true)
    setResendMsg('')
    try {
      await api.post(`/users/${id}/resend-invite`)
      setResendMsg('Invite resent successfully.')
    } catch {
      setResendMsg('Failed to resend invite.')
    } finally {
      setResending(false)
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      const { data } = await api.put(`/users/${id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
      })
      setUser(data)
      setEditForm({ name: data.name, email: data.email, phone: data.phone || '', role: data.role })
      setSaveMsg('Profile updated.')
      setEditMode(false)
    } catch {
      setSaveMsg('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-sm text-gray-400">
        Loading...
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error || 'User not found.'}
        </div>
        <Link to="/users" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          ← Back to Users
        </Link>
      </div>
    )
  }

  const initials = user.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'A'
  const canResend = PENDING_STATUSES.includes(user.inviteStatus)

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <Link to="/users" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </Link>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
        <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-50 text-primary-700 capitalize">
              {user.role?.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.inviteStatus === 'accepted' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
              Invite: {user.inviteStatus || 'none'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => { setEditMode((v) => !v); setSaveMsg('') }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
            {canResend && (
              <button
                onClick={handleResendInvite}
                disabled={resending}
                className="px-4 py-1.5 rounded-lg text-sm font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Invite'}
              </button>
            )}
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition disabled:opacity-50 ${
                user.isActive
                  ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                  : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {toggling ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
          {toggleMsg && <p className="text-xs text-gray-500 text-right">{toggleMsg}</p>}
          {resendMsg && <p className="text-xs text-gray-500 text-right">{resendMsg}</p>}
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <form onSubmit={handleSaveEdit} className="bg-white border border-primary-200 rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Edit Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input
                required
                className="input-field w-full"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                required
                type="email"
                className="input-field w-full"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                className="input-field w-full"
                placeholder="e.g. +91 98765 43210"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                className="input-field w-full"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { setEditMode(false); setSaveMsg('') }}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            {saveMsg && <p className="text-xs text-gray-500">{saveMsg}</p>}
          </div>
        </form>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
          </div>
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone || '—'} />
        </div>

        {/* Account */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</p>
          </div>
          <InfoRow label="Password Set" value={user.passwordSet ? 'Yes' : 'No'} />
          <InfoRow label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
          <InfoRow label="Invite Status" value={user.inviteStatus || 'none'} />
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</p>
          </div>
          <InfoRow label="Joined" value={fmt(user.createdAt)} />
          <InfoRow label="Last Updated" value={fmt(user.updatedAt)} />
          {user.onboardingCompletedAt && (
            <InfoRow label="Onboarded" value={fmt(user.onboardingCompletedAt)} />
          )}
        </div>
      </div>
    </div>
  )
}

