import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPartnerTeam, invitePartnerAgent, updatePartnerTeamMember } from '../../api/partnerApi'

export default function PartnerTeamPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'partner_admin' || user?.role === 'builder_admin'

  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '' })
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      setTeam(await getPartnerTeam())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const onInvite = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.name || !form.email) {
      setError('Name and email are required')
      return
    }
    try {
      const result = await invitePartnerAgent(form)
      setMessage(
        result.invite?.tempPassword
          ? `Agent added. Dev temp password for ${result.invite.username}: ${result.invite.tempPassword}`
          : 'Agent added and invite sent.'
      )
      setForm({ name: '', email: '' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite agent')
    }
  }

  const onToggleActive = async (member) => {
    setBusyId(member.membershipId)
    setError('')
    try {
      await updatePartnerTeamMember(member.membershipId, { isActive: member.status !== 'active' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agent')
    } finally {
      setBusyId(null)
    }
  }

  const onRemove = async (member) => {
    setBusyId(member.membershipId)
    setError('')
    try {
      await updatePartnerTeamMember(member.membershipId, { remove: true })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove agent')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {message && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{message}</div>}

      {!isAdmin ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-sm text-gray-600">
          Only your partner org's admin can manage the team.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Agent</h2>
          <form onSubmit={onInvite} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Full name"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <button type="submit" className="btn-primary">Add and Send Invite</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading team...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  {isAdmin && <th className="py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.membershipId} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 text-gray-900">{member.user?.name}</td>
                    <td className="py-2 pr-4 text-gray-700">{member.user?.email}</td>
                    <td className="py-2 pr-4 text-gray-700">{member.role === 'partner_admin' ? 'Admin' : 'Agent'}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-2">
                        {member.role !== 'partner_admin' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
                              disabled={busyId === member.membershipId}
                              onClick={() => onToggleActive(member)}
                            >
                              {member.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                              disabled={busyId === member.membershipId}
                              onClick={() => onRemove(member)}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {team.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-6 text-center text-sm text-gray-500">
                      No team members yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
