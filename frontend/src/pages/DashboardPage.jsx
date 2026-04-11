import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const statCards = [
  { label: 'Total Users', icon: '👥', color: 'bg-primary-50 text-primary-600', key: 'users' },
  { label: 'Active Agents', icon: '🏠', color: 'bg-amber-50 text-amber-600', key: 'agents' },
  { label: 'Clients', icon: '🤝', color: 'bg-orange-50 text-orange-500', key: 'clients' },
  { label: 'Admins', icon: '🛡️', color: 'bg-red-50 text-red-500', key: 'admins' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ users: 0, agents: 0, clients: 0, admins: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      api
        .get('/users')
        .then(({ data }) => {
          setStats({
            users: data.length,
            agents: data.filter((u) => u.role === 'agent').length,
            clients: data.filter((u) => u.role === 'client').length,
            admins: data.filter((u) => u.role === 'admin').length,
          })
          setRecentUsers(data.slice(0, 5))
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Here&apos;s what&apos;s happening in your CRM today.
          </p>
        </div>

        {/* Stats */}
        {user?.role === 'admin' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.key}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '—' : stats[card.key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Recent Users</h3>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-3 font-medium text-gray-800">{u.name}</td>
                          <td className="px-6 py-3 text-gray-500">{u.email}</td>
                          <td className="px-6 py-3">
                            <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                u.isActive
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-red-50 text-red-500'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Non-admin view */}
        {user?.role !== 'admin' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-800">Your Dashboard</h3>
            <p className="text-gray-500 text-sm mt-2">
              You are logged in as a{' '}
              <span className="text-primary-600 font-medium capitalize">{user?.role}</span>.
              More features coming soon!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
