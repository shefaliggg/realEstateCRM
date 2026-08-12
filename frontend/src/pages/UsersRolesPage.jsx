import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  'builder_admin',
  'sales_manager',
  'sales_executive',
  'crm_manager',
  'crm_executive',
  'marketing_manager',
  'marketing_executive',
]

export default function UsersRolesPage() {
  const {
    createUserInvite,
    getUsers,
    getPendingInvites,
    resendUserInvite,
    revokeUserInvite,
  } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', role: 'sales_executive' })
  const [users, setUsers] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inviteFilter, setInviteFilter] = useState('all')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersData, pendingData] = await Promise.all([getUsers(), getPendingInvites()])
      setUsers(usersData)
      setPendingInvites(pendingData)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const pendingInviteMap = useMemo(() => {
    const map = new Set(pendingInvites.map((m) => m.membershipId))
    return map
  }, [pendingInvites])

  // getUsers()/getPendingInvites() return Membership rows (role/status are
  // per-org, not on the account) with the account nested at `.user`.
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()

    return users.filter((m) => {
      const matchesSearch =
        !q ||
        m.user?.name?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q)

      const matchesRole = roleFilter === 'all' || m.role === roleFilter

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.user?.isActive) ||
        (statusFilter === 'inactive' && !m.user?.isActive)

      const matchesInvite = inviteFilter === 'all' || (m.inviteStatus || 'none') === inviteFilter

      return matchesSearch && matchesRole && matchesStatus && matchesInvite
    })
  }, [users, search, roleFilter, statusFilter, inviteFilter])

  const onCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.name || !form.email || !form.role) {
      setError('Name, email and role are required')
      return
    }

    try {
      const result = await createUserInvite(form)
      setMessage(
        result.invite?.tempPassword
          ? `User created. Dev temp password for ${result.invite.username}: ${result.invite.tempPassword}`
          : 'User created and invite sent.'
      )
      setForm({ name: '', email: '', role: 'sales_executive' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const onResendInvite = async (id) => {
    setBusyUserId(id)
    setError('')
    setMessage('')
    try {
      const result = await resendUserInvite(id)
      setMessage(
        result.invite?.tempPassword
          ? `Invite resent. Dev temp password for ${result.invite.username}: ${result.invite.tempPassword}`
          : 'Invite resent successfully.'
      )
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend invite')
    } finally {
      setBusyUserId(null)
    }
  }

  const onRevokeInvite = async (id) => {
    setBusyUserId(id)
    setError('')
    setMessage('')
    try {
      await revokeUserInvite(id)
      setMessage('Invite revoked successfully')
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke invite')
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Users and Roles</h1>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {message && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{message}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add User</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <select
            className="input-field"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Create and Send Invite</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Users</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            placeholder="Search name or email"
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="input-field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select className="input-field" value={inviteFilter} onChange={(e) => setInviteFilter(e.target.value)}>
            <option value="all">All Invite Status</option>
            <option value="none">none</option>
            <option value="pending">pending</option>
            <option value="accepted">accepted</option>
            <option value="revoked">revoked</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Invite</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((member) => (
                  <tr key={member.membershipId} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 text-gray-900">{member.user?.name}</td>
                    <td className="py-2 pr-4 text-gray-700">{member.user?.email}</td>
                    <td className="py-2 pr-4 text-gray-700">{member.role}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {member.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{member.inviteStatus || 'none'}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/users/${member.membershipId}`}
                          className="px-2 py-1 rounded bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs"
                        >
                          View
                        </Link>
                        {pendingInviteMap.has(member.membershipId) && (
                          <>
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
                              disabled={busyUserId === member.membershipId}
                              onClick={() => onResendInvite(member.membershipId)}
                            >
                              Resend Invite
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                              disabled={busyUserId === member.membershipId}
                              onClick={() => onRevokeInvite(member.membershipId)}
                            >
                              Revoke Invite
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                      No users match current filters.
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
