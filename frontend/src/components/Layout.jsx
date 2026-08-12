import { createContext, useContext, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import GlobalAssistantPanel from './GlobalAssistantPanel'

const LayoutDepthContext = createContext(false)

export default function Layout({ children }) {
  const isNestedLayout = useContext(LayoutDepthContext)
  if (isNestedLayout) return children

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
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

        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <TopBar onOpenSidebar={() => setSidebarOpen(true)} onOpenAssistant={() => setAssistantOpen(true)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        <GlobalAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      </div>
    </LayoutDepthContext.Provider>
  )
}
