import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: 'Dashboard', path: '/' },
  { label: 'Organizations', path: '/organizations' },
  { label: 'Platform Team', path: '/team' },
  { label: 'Subscription & Billing', path: '/billing' },
  { label: 'Integrations', path: '/integrations' },
  { label: 'Audit Logs', path: '/audit-logs' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200">
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-900 text-sm font-bold leading-tight">Platform</p>
          <p className="text-[10px] text-gray-400 leading-tight">Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
        <p className="text-[11px] text-gray-500 capitalize truncate mb-2">{user?.role?.replace(/_/g, ' ')}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
