import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import UsersRolesPage from './pages/UsersRolesPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import AddProjectPage from './pages/AddProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import InventoryPage from './pages/InventoryPage'
import BlockPage from './pages/BlockPage'
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
import SiteVisitSchedulePage from './pages/SiteVisitSchedulePage'
import SiteVisitCalendarPage from './pages/SiteVisitCalendarPage'
import ChannelPartnersPage from './pages/ChannelPartnersPage'
import PartnerLeadsPage from './pages/PartnerLeadsPage'
import PartnerPayoutsPage from './pages/PartnerPayoutsPage'
import PartnerProfilePage from './pages/PartnerProfilePage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import PermissionsPage from './pages/PermissionsPage'
import UserProfilePage from './pages/UserProfilePage'
import PostSalesCustomersPage from './pages/PostSalesCustomersPage'
import PostSalesBookingsPage from './pages/PostSalesBookingsPage'
import PostSalesPaymentSchedulesPage from './pages/PostSalesPaymentSchedulesPage'
import PostSalesPaymentsPage from './pages/PostSalesPaymentsPage'
import PostSalesDocumentsPage from './pages/PostSalesDocumentsPage'
import PostSalesReferralsPage from './pages/PostSalesReferralsPage'
import SalesReportsPage from './pages/SalesReportsPage'
import MarketingReportsPage from './pages/MarketingReportsPage'
import PerformanceReportsPage from './pages/PerformanceReportsPage'
import MarketingCampaignsPage from './pages/MarketingCampaignsPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import CampaignWorkspacePage from './pages/CampaignWorkspacePage'
import MarketingSettingsPage from './pages/MarketingSettingsPage'
import LeadGenerationListsPage from './pages/LeadGenerationListsPage'
import LeadGenerationGoogleMapsPage from './pages/LeadGenerationGoogleMapsPage'
import LeadGenerationImportPage from './pages/LeadGenerationImportPage'
import EmailCampaignsPage from './pages/EmailCampaignsPage'
import EmailSettingsPage from './pages/EmailSettingsPage'
import EmailTemplatesPage from './pages/EmailTemplatesPage'
import EmailCampaignDetailPage from './pages/EmailCampaignDetailPage'

function PR({ children, allowedRoles }) {
  return <PrivateRoute allowedRoles={allowedRoles}>{children}</PrivateRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          <Route path="/dashboard" element={<PR><DashboardPage /></PR>} />

          {/* Projects + Inventory */}
          <Route path="/projects" element={<PR><ProjectsPage /></PR>} />
          <Route path="/projects/add" element={<PR><AddProjectPage /></PR>} />
          <Route path="/projects/:id" element={<PR><ProjectDetailPage /></PR>} />
          <Route path="/inventory" element={<PR><InventoryPage /></PR>} />
          <Route path="/projects/:projectId/blocks/:block" element={<PR><BlockPage /></PR>} />
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

          {/* Site Visits */}
          <Route path="/visits/schedule" element={<PR><SiteVisitSchedulePage /></PR>} />
          <Route path="/visits/calendar" element={<PR><SiteVisitCalendarPage /></PR>} />

          {/* Channel Partners */}
          <Route path="/partners" element={<PR><ChannelPartnersPage /></PR>} />
          <Route path="/partners/:id" element={<PR><PartnerProfilePage /></PR>} />
          <Route path="/partners/leads" element={<PR><PartnerLeadsPage /></PR>} />
          <Route path="/partners/payouts" element={<PR><PartnerPayoutsPage /></PR>} />

          {/* Post-Sales */}
          <Route path="/post-sales/customers" element={<PR><PostSalesCustomersPage /></PR>} />
          <Route path="/post-sales/bookings" element={<PR><PostSalesBookingsPage /></PR>} />
          <Route path="/post-sales/payment-schedules" element={<PR><PostSalesPaymentSchedulesPage /></PR>} />
          <Route path="/post-sales/payments" element={<PR><PostSalesPaymentsPage /></PR>} />
          <Route path="/post-sales/documents" element={<PR><PostSalesDocumentsPage /></PR>} />
          <Route path="/post-sales/referrals" element={<PR><PostSalesReferralsPage /></PR>} />

          {/* Reports */}
          <Route path="/reports/sales" element={<PR><SalesReportsPage /></PR>} />
          <Route path="/reports/marketing" element={<PR><MarketingReportsPage /></PR>} />
          <Route path="/reports/performance" element={<PR><PerformanceReportsPage /></PR>} />

          {/* AI Marketing Campaigns */}
          <Route path="/marketing/campaigns" element={<PR><MarketingCampaignsPage /></PR>} />
          <Route path="/marketing/campaigns/create" element={<PR><CreateCampaignPage /></PR>} />
          <Route path="/marketing/campaigns/:id" element={<PR><CampaignWorkspacePage /></PR>} />
          <Route path="/marketing/campaigns/:id/settings" element={<PR><CampaignWorkspacePage forcedTab="settings" /></PR>} />
          <Route path="/marketing/campaigns/:id/analytics" element={<PR><CampaignWorkspacePage forcedTab="analytics" /></PR>} />
          <Route path="/marketing/settings" element={<Navigate to="/marketing/settings/company-knowledge" replace />} />
          <Route path="/marketing/settings/company-knowledge" element={<PR><MarketingSettingsPage /></PR>} />
          <Route path="/marketing/lead-generation" element={<Navigate to="/marketing/lead-generation/lists" replace />} />
          <Route path="/marketing/lead-generation/lists" element={<PR><LeadGenerationListsPage /></PR>} />
          <Route path="/marketing/lead-generation/google-maps" element={<PR><LeadGenerationGoogleMapsPage /></PR>} />
          <Route path="/marketing/lead-generation/import" element={<PR><LeadGenerationImportPage /></PR>} />
          <Route path="/marketing/email" element={<PR><EmailCampaignsPage /></PR>} />
          <Route path="/marketing/email/:id" element={<PR><EmailCampaignDetailPage /></PR>} />
          <Route path="/marketing/email/settings" element={<PR><EmailSettingsPage /></PR>} />
          <Route path="/marketing/email/templates" element={<PR><EmailTemplatesPage /></PR>} />

          {/* Users and Roles */}
          <Route path="/users" element={<PR allowedRoles={['admin']}><UsersRolesPage /></PR>} />
          <Route path="/users/:id" element={<PR allowedRoles={['admin']}><UserProfilePage /></PR>} />
          <Route path="/permissions" element={<PR allowedRoles={['admin']}><PermissionsPage /></PR>} />
          <Route path="/profile" element={<PR><ProfilePage /></PR>} />
          <Route path="/settings" element={<PR><SettingsPage /></PR>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
