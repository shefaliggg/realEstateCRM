import { createContext, useContext, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

const LayoutDepthContext = createContext(false)

export default function Layout({ children }) {
  const isNestedLayout = useContext(LayoutDepthContext)
  if (isNestedLayout) return children

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <LayoutDepthContext.Provider value>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={logout}
        />

        <div className="flex-1 min-w-0 overflow-hidden relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden absolute top-3 left-3 z-10 p-2 rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <main className="h-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </LayoutDepthContext.Provider>
  )
}
