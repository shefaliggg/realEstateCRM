import { useEffect, useState } from 'react'
import api from '../api/axios'

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
}

function InviteBuilderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', slug: '', contactEmail: '', contactPhone: '', adminName: '', adminEmail: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo(null)
    if (!form.name || !form.adminName || !form.adminEmail) {
      setError('Builder name, admin name and admin email are required.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/platform/builders', form)
      const delivered = data.invite?.delivery === 'email'
      setInfo({
        message: delivered
          ? `Invited ${data.builder.name} — login details emailed to ${form.adminEmail}.`
          : `Invited ${data.builder.name} — email delivery is not configured, use the credentials below.`,
        username: data.invite?.username,
        tempPassword: data.invite?.tempPassword,
      })
      setForm({ name: '', slug: '', contactEmail: '', contactPhone: '', adminName: '', adminEmail: '' })
      onCreated?.(data.builder)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite builder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Invite a new builder</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
              &times;
            </button>
          </div>
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          {info && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm space-y-1">
              <p>{info.message}</p>
              {info.tempPassword && (
                <p className="break-all">
                  Username: <span className="font-mono font-medium">{info.username}</span>
                  {' · '}
                  Temporary password: <span className="font-mono font-medium">{info.tempPassword}</span>
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Builder Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Acme Developers" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="input-field" placeholder="acme-developers" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className="input-field" placeholder="ops@acme.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Admin Name</label>
              <input name="adminName" value={form.adminName} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Admin Email</label>
              <input name="adminEmail" value={form.adminEmail} onChange={handleChange} className="input-field" placeholder="admin@acme.com" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrganizationsPage() {
  const [builders, setBuilders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const loadBuilders = () => {
    setLoading(true)
    api.get('/platform/builders')
      .then((res) => setBuilders(res.data))
      .catch(() => setLoadError('Failed to load builders'))
      .finally(() => setLoading(false))
  }

  useEffect(loadBuilders, [])

  const toggleSuspend = async (builder) => {
    setBusyId(builder._id)
    try {
      await api.post(`/platform/builders/${builder._id}/suspend`, { suspend: builder.status !== 'suspended' })
      loadBuilders()
    } catch {
      setError('Failed to update builder status')
    } finally {
      setBusyId(null)
    }
  }

  const resendInvite = async (builder) => {
    setBusyId(builder._id)
    setError('')
    setInfo(null)
    try {
      const { data } = await api.post(`/platform/builders/${builder._id}/resend-invite`)
      const delivered = data.invite?.delivery === 'email'
      setInfo({
        message: delivered
          ? `Invite resent to ${builder.name}'s admin.`
          : `Invite resent — email delivery is not configured, use the credentials below.`,
        username: data.invite?.username,
        tempPassword: data.invite?.tempPassword,
      })
    } catch {
      setError('Failed to resend invite')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Organizations</h1>
          <p className="text-sm text-gray-500">Every builder organization onboarded onto PropVault.</p>
        </div>
        <button type="button" onClick={() => setShowInviteModal(true)} className="btn-primary whitespace-nowrap">
          Send Invitation
        </button>
      </div>

      {showInviteModal && (
        <InviteBuilderModal
          onClose={() => setShowInviteModal(false)}
          onCreated={(builder) => {
            loadBuilders()
            setShowInviteModal(false)
          }}
        />
      )}

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      {info && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm space-y-1">
          <p>{info.message}</p>
          {info.tempPassword && (
            <p className="break-all">
              Username: <span className="font-mono font-medium">{info.username}</span>
              {' · '}
              Temporary password: <span className="font-mono font-medium">{info.tempPassword}</span>
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading…</p>
        ) : loadError ? (
          <p className="p-6 text-red-500 text-sm">{loadError}</p>
        ) : builders.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No builders yet — invite one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Slug</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {builders.map((b) => (
                  <tr key={b._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[b.status] || ''}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{b.billingPlan}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {b.status === 'pending' && (
                        <button
                          disabled={busyId === b._id}
                          onClick={() => resendInvite(b)}
                          className="text-primary-700 hover:text-primary-800 font-medium"
                        >
                          Resend invite
                        </button>
                      )}
                      <button
                        disabled={busyId === b._id}
                        onClick={() => toggleSuspend(b)}
                        className={b.status === 'suspended' ? 'text-green-700 hover:text-green-800 font-medium' : 'text-red-600 hover:text-red-700 font-medium'}
                      >
                        {b.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
