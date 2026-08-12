import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { label: 'Organizations', description: 'Invite and manage builder organizations', path: '/organizations', icon: '🏢' },
  { label: 'Platform Team', description: 'PropVault staff accounts', path: '/team', icon: '👤' },
  { label: 'Subscription & Billing', description: 'Plans and billing across builders', path: '/billing', icon: '💳' },
  { label: 'Integrations', description: 'Platform-wide integrations', path: '/integrations', icon: '🔌' },
  { label: 'Audit Logs', description: 'Cross-organization activity trail', path: '/audit-logs', icon: '📜' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-500 mb-6">PropVault platform administration.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">{link.icon}</div>
            <p className="font-semibold text-gray-900">{link.label}</p>
            <p className="text-sm text-gray-500 mt-0.5">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
