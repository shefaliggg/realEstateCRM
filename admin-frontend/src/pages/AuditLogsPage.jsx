import { useEffect, useState } from 'react'
import api from '../api/axios'

const ACTION_LABELS = {
  login: 'Login',
  invite_created: 'Invite Created',
  user_updated: 'User Updated',
  user_removed: 'User Removed',
  channel_partner_created: 'Channel Partner Created',
  partner_agent_invited: 'Partner Agent Invited',
  role_permissions_updated: 'Role Permissions Updated',
  builder_invited: 'Builder Invited',
  builder_suspended: 'Builder Suspended',
  builder_reactivated: 'Builder Reactivated',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/platform/audit-logs')
      .then((res) => setLogs(res.data))
      .catch(() => setError('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Audit Logs</h1>
      <p className="text-sm text-gray-500 mb-6">Recent activity across every builder organization.</p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading…</p>
        ) : error ? (
          <p className="p-6 text-red-500 text-sm">{error}</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Organization</th>
                  <th className="px-4 py-3 text-left font-medium">Actor</th>
                  <th className="px-4 py-3 text-left font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-4 py-3 font-medium text-gray-800">{ACTION_LABELS[log.action] || log.action}</td>
                    <td className="px-4 py-3 text-gray-600">{log.builderId?.name || 'PropVault (platform)'}</td>
                    <td className="px-4 py-3 text-gray-600">{log.actor?.name || 'Unknown'} ({log.actor?.email || '—'})</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
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
