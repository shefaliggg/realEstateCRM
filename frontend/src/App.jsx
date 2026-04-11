import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PropertiesPage from './pages/PropertiesPage'
import AddPropertyPage from './pages/AddPropertyPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AllLeadsPage from './pages/AllLeadsPage'
import AddLeadPage from './pages/AddLeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import MyLeadsPage from './pages/MyLeadsPage'
import LeadSourcesPage from './pages/LeadSourcesPage'
import AllDealsPage from './pages/AllDealsPage'
import AddDealPage from './pages/AddDealPage'
import DealDetailPage from './pages/DealDetailPage'
import DealPipelinePage from './pages/DealPipelinePage'
import MyDealsPage from './pages/MyDealsPage'

function PR({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<PR><DashboardPage /></PR>} />
          <Route path="/properties" element={<PR><PropertiesPage /></PR>} />
          <Route path="/properties/add" element={<PR><AddPropertyPage /></PR>} />
          <Route path="/properties/:id" element={<PR><PropertyDetailPage /></PR>} />
          <Route path="/leads" element={<PR><AllLeadsPage /></PR>} />
          <Route path="/leads/add" element={<PR><AddLeadPage /></PR>} />
          <Route path="/leads/mine" element={<PR><MyLeadsPage /></PR>} />
          <Route path="/leads/sources" element={<PR><LeadSourcesPage /></PR>} />
          <Route path="/leads/:id" element={<PR><LeadDetailPage /></PR>} />
          <Route path="/deals" element={<PR><AllDealsPage /></PR>} />
          <Route path="/deals/add" element={<PR><AddDealPage /></PR>} />
          <Route path="/deals/mine" element={<PR><MyDealsPage /></PR>} />
          <Route path="/deals/pipeline" element={<PR><DealPipelinePage /></PR>} />
          <Route path="/deals/:id" element={<PR><DealDetailPage /></PR>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
