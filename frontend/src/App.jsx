import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import AddProjectPage from './pages/AddProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import InventoryPage from './pages/InventoryPage'
import UnitDetailPage from './pages/UnitDetailPage'
import AddUnitPage from './pages/AddUnitPage'
import AllLeadsPage from './pages/AllLeadsPage'
import AddLeadPage from './pages/AddLeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import LeadNurturePage from './pages/LeadNurturePage'
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

          {/* Projects + Inventory */}
          <Route path="/projects" element={<PR><ProjectsPage /></PR>} />
          <Route path="/projects/add" element={<PR><AddProjectPage /></PR>} />
          <Route path="/projects/:id" element={<PR><ProjectDetailPage /></PR>} />
          <Route path="/inventory" element={<PR><InventoryPage /></PR>} />
          <Route path="/projects/:projectId/units/add" element={<PR><AddUnitPage /></PR>} />
          <Route path="/units/:id" element={<PR><UnitDetailPage /></PR>} />

          {/* Leads */}
          <Route path="/leads" element={<PR><AllLeadsPage /></PR>} />
          <Route path="/leads/add" element={<PR><AddLeadPage /></PR>} />
          <Route path="/leads/nurture" element={<PR><LeadNurturePage /></PR>} />
          <Route path="/leads/mine" element={<PR><MyLeadsPage /></PR>} />
          <Route path="/leads/sources" element={<PR><LeadSourcesPage /></PR>} />
          <Route path="/leads/:id" element={<PR><LeadDetailPage /></PR>} />

          {/* Deals */}
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
