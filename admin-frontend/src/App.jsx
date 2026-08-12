import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrganizationsPage from './pages/OrganizationsPage'
import TeamsPage from './pages/TeamsPage'
import BillingPage from './pages/BillingPage'
import IntegrationsPage from './pages/IntegrationsPage'
import AuditLogsPage from './pages/AuditLogsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/organizations" element={<PrivateRoute><OrganizationsPage /></PrivateRoute>} />
          <Route path="/team" element={<PrivateRoute><TeamsPage /></PrivateRoute>} />
          <Route path="/billing" element={<PrivateRoute><BillingPage /></PrivateRoute>} />
          <Route path="/integrations" element={<PrivateRoute><IntegrationsPage /></PrivateRoute>} />
          <Route path="/audit-logs" element={<PrivateRoute><AuditLogsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
