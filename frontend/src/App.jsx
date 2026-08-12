import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import ComingSoonCard from './components/ComingSoonCard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import UsersRolesPage from './pages/UsersRolesPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import AddBuildingPage from './pages/AddBuildingPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import EditProjectPage from './pages/EditProjectPage'
import ProjectTypePage from './pages/ProjectTypePage'
import InventoryPage from './pages/InventoryPage'
import BlockPage from './pages/BlockPage'
import UnitDetailPage from './pages/UnitDetailPage'
import AddUnitPage from './pages/AddUnitPage'
import AddTowerPage from './pages/AddTowerPage'
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
import CompanyProfilePage from './pages/CompanyProfilePage'
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
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage'
import PartnerProjectsPage from './pages/partner/PartnerProjectsPage'
import PartnerInventoryPage from './pages/partner/PartnerInventoryPage'
import PartnerRegisterLeadPage from './pages/partner/PartnerRegisterLeadPage'
import PartnerMyLeadsPage from './pages/partner/PartnerMyLeadsPage'
import PartnerSiteVisitsPage from './pages/partner/PartnerSiteVisitsPage'
import PartnerBookingsPage from './pages/partner/PartnerBookingsPage'
import PartnerCommissionsPage from './pages/partner/PartnerCommissionsPage'
import PartnerDownloadsPage from './pages/partner/PartnerDownloadsPage'
import PortalProfilePage from './pages/partner/PortalProfilePage'
import PartnerSupportPage from './pages/partner/PartnerSupportPage'
import PartnerTeamPage from './pages/partner/PartnerTeamPage'
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage'
import MyPropertyPage from './pages/customer/MyPropertyPage'
import CustomerPaymentSchedulePage from './pages/customer/CustomerPaymentSchedulePage'
import CustomerReceiptsPage from './pages/customer/CustomerReceiptsPage'
import CustomerDocumentsPage from './pages/customer/CustomerDocumentsPage'
import ConstructionUpdatesPage from './pages/customer/ConstructionUpdatesPage'
import CustomerSupportPage from './pages/customer/CustomerSupportPage'
import CustomerProfilePage from './pages/customer/CustomerProfilePage'

const STAFF_ROLES = [
  'builder_admin',
  'sales_manager', 'sales_executive', 'crm_manager', 'crm_executive',
  'marketing_manager', 'marketing_executive',
]
const PARTNER_ROLES = ['partner_admin', 'partner_agent', 'builder_admin']
const CUSTOMER_ROLES = ['customer', 'builder_admin']

function PR({ children, allowedRoles }) {
  return <PrivateRoute allowedRoles={allowedRoles}>{children}</PrivateRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<PR allowedRoles={STAFF_ROLES}><DashboardPage /></PR>} />

          {/* Projects + Inventory */}
          <Route path="/projects" element={<PR allowedRoles={STAFF_ROLES}><ProjectsPage /></PR>} />
          <Route path="/projects/add" element={<PR allowedRoles={STAFF_ROLES}><AddBuildingPage /></PR>} />
          <Route path="/projects/types/:type" element={<PR allowedRoles={STAFF_ROLES}><ProjectTypePage /></PR>} />
          <Route path="/projects/:id/edit" element={<PR allowedRoles={STAFF_ROLES}><EditProjectPage /></PR>} />
          <Route path="/projects/:id" element={<PR allowedRoles={STAFF_ROLES}><ProjectDetailPage /></PR>} />
          <Route path="/inventory" element={<PR allowedRoles={STAFF_ROLES}><InventoryPage /></PR>} />
          <Route path="/projects/:projectId/blocks/:block" element={<PR allowedRoles={STAFF_ROLES}><BlockPage /></PR>} />
          <Route path="/projects/:projectId/units/add" element={<PR allowedRoles={STAFF_ROLES}><AddUnitPage /></PR>} />
          <Route path="/projects/:projectId/towers/add" element={<PR allowedRoles={STAFF_ROLES}><AddTowerPage /></PR>} />
          <Route path="/projects/:projectId/towers/:towerId/edit" element={<PR allowedRoles={STAFF_ROLES}><AddTowerPage /></PR>} />
          <Route path="/units/:id" element={<PR allowedRoles={STAFF_ROLES}><UnitDetailPage /></PR>} />

          {/* Leads */}
          <Route path="/leads" element={<PR allowedRoles={STAFF_ROLES}><AllLeadsPage /></PR>} />
          <Route path="/leads/add" element={<PR allowedRoles={STAFF_ROLES}><AddLeadPage /></PR>} />
          <Route path="/leads/nurture" element={<PR allowedRoles={STAFF_ROLES}><LeadNurturePage /></PR>} />
          <Route path="/leads/mine" element={<PR allowedRoles={STAFF_ROLES}><MyLeadsPage /></PR>} />
          <Route path="/leads/sources" element={<PR allowedRoles={STAFF_ROLES}><LeadSourcesPage /></PR>} />
          <Route path="/leads/:id" element={<PR allowedRoles={STAFF_ROLES}><LeadDetailPage /></PR>} />

          {/* Deals */}
          <Route path="/deals" element={<PR allowedRoles={STAFF_ROLES}><AllDealsPage /></PR>} />
          <Route path="/deals/add" element={<PR allowedRoles={STAFF_ROLES}><AddDealPage /></PR>} />
          <Route path="/deals/mine" element={<PR allowedRoles={STAFF_ROLES}><MyDealsPage /></PR>} />
          <Route path="/deals/pipeline" element={<PR allowedRoles={STAFF_ROLES}><DealPipelinePage /></PR>} />
          <Route path="/deals/:id" element={<PR allowedRoles={STAFF_ROLES}><DealDetailPage /></PR>} />

          {/* Site Visits */}
          <Route path="/visits/schedule" element={<PR allowedRoles={STAFF_ROLES}><SiteVisitSchedulePage /></PR>} />
          <Route path="/visits/calendar" element={<PR allowedRoles={STAFF_ROLES}><SiteVisitCalendarPage /></PR>} />

          {/* Channel Partners */}
          <Route path="/partners" element={<PR allowedRoles={STAFF_ROLES}><ChannelPartnersPage /></PR>} />
          <Route path="/partners/:id" element={<PR allowedRoles={STAFF_ROLES}><PartnerProfilePage /></PR>} />
          <Route path="/partners/leads" element={<PR allowedRoles={STAFF_ROLES}><PartnerLeadsPage /></PR>} />
          <Route path="/partners/payouts" element={<PR allowedRoles={STAFF_ROLES}><PartnerPayoutsPage /></PR>} />

          {/* Post-Sales */}
          <Route path="/post-sales/customers" element={<PR allowedRoles={STAFF_ROLES}><PostSalesCustomersPage /></PR>} />
          <Route path="/post-sales/bookings" element={<PR allowedRoles={STAFF_ROLES}><PostSalesBookingsPage /></PR>} />
          <Route path="/post-sales/payment-schedules" element={<PR allowedRoles={STAFF_ROLES}><PostSalesPaymentSchedulesPage /></PR>} />
          <Route path="/post-sales/payments" element={<PR allowedRoles={STAFF_ROLES}><PostSalesPaymentsPage /></PR>} />
          <Route path="/post-sales/documents" element={<PR allowedRoles={STAFF_ROLES}><PostSalesDocumentsPage /></PR>} />
          <Route path="/post-sales/referrals" element={<PR allowedRoles={STAFF_ROLES}><PostSalesReferralsPage /></PR>} />

          {/* Reports */}
          <Route path="/reports/sales" element={<PR allowedRoles={STAFF_ROLES}><SalesReportsPage /></PR>} />
          <Route path="/reports/marketing" element={<PR allowedRoles={STAFF_ROLES}><MarketingReportsPage /></PR>} />
          <Route path="/reports/performance" element={<PR allowedRoles={STAFF_ROLES}><PerformanceReportsPage /></PR>} />

          {/* AI Marketing Campaigns */}
          <Route path="/marketing/campaigns" element={<PR allowedRoles={STAFF_ROLES}><MarketingCampaignsPage /></PR>} />
          <Route path="/marketing/campaigns/create" element={<PR allowedRoles={STAFF_ROLES}><CreateCampaignPage /></PR>} />
          <Route path="/marketing/campaigns/:id" element={<PR allowedRoles={STAFF_ROLES}><CampaignWorkspacePage /></PR>} />
          <Route path="/marketing/campaigns/:id/settings" element={<PR allowedRoles={STAFF_ROLES}><CampaignWorkspacePage forcedTab="settings" /></PR>} />
          <Route path="/marketing/campaigns/:id/analytics" element={<PR allowedRoles={STAFF_ROLES}><CampaignWorkspacePage forcedTab="analytics" /></PR>} />
          <Route path="/marketing/settings" element={<Navigate to="/marketing/settings/company-knowledge" replace />} />
          <Route path="/marketing/settings/company-knowledge" element={<PR allowedRoles={STAFF_ROLES}><MarketingSettingsPage /></PR>} />
          <Route path="/marketing/lead-generation" element={<Navigate to="/marketing/lead-generation/lists" replace />} />
          <Route path="/marketing/lead-generation/lists" element={<PR allowedRoles={STAFF_ROLES}><LeadGenerationListsPage /></PR>} />
          <Route path="/marketing/lead-generation/google-maps" element={<PR allowedRoles={STAFF_ROLES}><LeadGenerationGoogleMapsPage /></PR>} />
          <Route path="/marketing/lead-generation/import" element={<PR allowedRoles={STAFF_ROLES}><LeadGenerationImportPage /></PR>} />
          <Route path="/marketing/email" element={<PR allowedRoles={STAFF_ROLES}><EmailCampaignsPage /></PR>} />
          <Route path="/marketing/email/settings" element={<PR allowedRoles={STAFF_ROLES}><EmailSettingsPage /></PR>} />
          <Route path="/marketing/email/templates" element={<PR allowedRoles={STAFF_ROLES}><EmailTemplatesPage /></PR>} />

          {/* Users and Roles */}
          <Route path="/users" element={<PR allowedRoles={['builder_admin']}><UsersRolesPage /></PR>} />
          <Route path="/users/:id" element={<PR allowedRoles={['builder_admin']}><UserProfilePage /></PR>} />
          <Route path="/permissions" element={<PR allowedRoles={['builder_admin']}><PermissionsPage /></PR>} />
          <Route path="/profile" element={<PR><ProfilePage /></PR>} />
          <Route path="/settings" element={<PR allowedRoles={STAFF_ROLES}><SettingsPage /></PR>} />
          <Route path="/settings/company-profile" element={<PR allowedRoles={STAFF_ROLES}><CompanyProfilePage /></PR>} />
          <Route path="/settings/teams" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Teams" description="Team management is planned for a future phase." /></PR>} />
          <Route path="/settings/leads" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Lead Settings" description="Lead configuration (statuses, scoring, sources) is planned for a future phase." /></PR>} />
          <Route path="/settings/deals" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Deal Settings" description="Deal pipeline configuration is planned for a future phase." /></PR>} />
          <Route path="/settings/site-visits" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Site Visit Settings" description="Site visit configuration is planned for a future phase." /></PR>} />
          <Route path="/settings/notifications" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Notifications" description="Notification preferences are planned for a future phase." /></PR>} />
          <Route path="/settings/integrations" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Integrations" description="Third-party integrations are planned for a future phase." /></PR>} />
          <Route path="/settings/product-access" element={<PR allowedRoles={STAFF_ROLES}><ComingSoonCard title="Product Access" description="Per-product entitlements are managed by PropVault — contact support to change what's enabled for your company." /></PR>} />

          {/* Channel Partner Portal */}
          <Route path="/partner" element={<PR allowedRoles={PARTNER_ROLES}><PartnerDashboardPage /></PR>} />
          <Route path="/partner/projects" element={<PR allowedRoles={PARTNER_ROLES}><PartnerProjectsPage /></PR>} />
          <Route path="/partner/inventory" element={<PR allowedRoles={PARTNER_ROLES}><PartnerInventoryPage /></PR>} />
          <Route path="/partner/leads/register" element={<PR allowedRoles={PARTNER_ROLES}><PartnerRegisterLeadPage /></PR>} />
          <Route path="/partner/leads" element={<PR allowedRoles={PARTNER_ROLES}><PartnerMyLeadsPage /></PR>} />
          <Route path="/partner/site-visits" element={<PR allowedRoles={PARTNER_ROLES}><PartnerSiteVisitsPage /></PR>} />
          <Route path="/partner/team" element={<PR allowedRoles={PARTNER_ROLES}><PartnerTeamPage /></PR>} />
          <Route path="/partner/bookings" element={<PR allowedRoles={PARTNER_ROLES}><PartnerBookingsPage /></PR>} />
          <Route path="/partner/commissions" element={<PR allowedRoles={PARTNER_ROLES}><PartnerCommissionsPage /></PR>} />
          <Route path="/partner/downloads" element={<PR allowedRoles={PARTNER_ROLES}><PartnerDownloadsPage /></PR>} />
          <Route path="/partner/support" element={<PR allowedRoles={PARTNER_ROLES}><PartnerSupportPage /></PR>} />
          <Route path="/partner/profile" element={<PR allowedRoles={PARTNER_ROLES}><PortalProfilePage /></PR>} />

          {/* Customer Portal */}
          <Route path="/customer-portal" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerDashboardPage /></PR>} />
          <Route path="/customer-portal/property" element={<PR allowedRoles={CUSTOMER_ROLES}><MyPropertyPage /></PR>} />
          <Route path="/customer-portal/payment-schedule" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerPaymentSchedulePage /></PR>} />
          <Route path="/customer-portal/receipts" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerReceiptsPage /></PR>} />
          <Route path="/customer-portal/documents" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerDocumentsPage /></PR>} />
          <Route path="/customer-portal/construction-updates" element={<PR allowedRoles={CUSTOMER_ROLES}><ConstructionUpdatesPage /></PR>} />
          <Route path="/customer-portal/support" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerSupportPage /></PR>} />
          <Route path="/customer-portal/profile" element={<PR allowedRoles={CUSTOMER_ROLES}><CustomerProfilePage /></PR>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
