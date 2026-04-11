import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
          </svg>
          RealEstate CRM
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.name} &bull;{' '}
            <span className="capitalize text-primary-500">{user?.role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
