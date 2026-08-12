// builder_admin only (see Sidebar.jsx) — these are company-level
// configuration, most of them admin-gated on the backend too
// (requirePermission('manage_users') for Company Profile/Users/Roles).
export const SETTINGS_NAV_ITEM = {
  label: 'Settings', icon: 'user', sub: [
    { label: 'Company Profile', path: '/settings/company-profile' },
    { label: 'Users', path: '/users' },
    { label: 'Roles & Permissions', path: '/permissions' },
    { label: 'Teams', path: '/settings/teams' },
    { label: 'Lead Settings', path: '/settings/leads' },
    { label: 'Deal Settings', path: '/settings/deals' },
    { label: 'Site Visit Settings', path: '/settings/site-visits' },
    { label: 'Notifications', path: '/settings/notifications' },
    { label: 'Integrations', path: '/settings/integrations' },
    { label: 'Product Access', path: '/settings/product-access' },
  ],
}

export const STAFF_NAV = [
  { label: 'Dashboard', icon: 'home', path: '/dashboard' },
  {
    label: 'Projects', icon: 'building', sub: [
      { label: 'Buildings', path: '/projects/types/buildings' },
      { label: 'Villas', path: '/projects/types/villas' },
      { label: 'Plots', path: '/projects/types/plots' },
      { label: 'Commercial', path: '/projects/types/commercial' },
      { label: 'Mixed Use', path: '/projects/types/mixed-use' },
      { label: 'Inventory', path: '/inventory' },
    ],
  },
  {
    label: 'Leads', icon: 'users', sub: [
      { label: 'All Leads', path: '/leads' },
      { label: 'Nurture Board', path: '/leads/nurture' },
      { label: 'My Leads', path: '/leads/mine' },
      { label: 'Lead Sources', path: '/leads/sources' },
    ],
  },
  {
    label: 'Deals', icon: 'deal', sub: [
      { label: 'All Deals', path: '/deals' },
      { label: 'Pipeline', path: '/deals/pipeline' },
      { label: 'My Deals', path: '/deals/mine' },
    ],
  },
  {
    label: 'Site Visits', icon: 'calendar', sub: [
      { label: 'Schedule Visit', path: '/visits/schedule' },
      { label: 'Calendar', path: '/visits/calendar' },
    ],
  },
  {
    label: 'Channel Partners', icon: 'handshake', sub: [
      { label: 'All Partners', path: '/partners' },
      { label: 'Partner Leads', path: '/partners/leads' },
      { label: 'Payouts', path: '/partners/payouts' },
    ],
  },
  {
    label: 'Post-Sales', icon: 'receipt', sub: [
      { label: 'Customers', path: '/post-sales/customers' },
      { label: 'Bookings', path: '/post-sales/bookings' },
      { label: 'Payment Schedules', path: '/post-sales/payment-schedules' },
      { label: 'Payments', path: '/post-sales/payments' },
      { label: 'Documents', path: '/post-sales/documents' },
      { label: 'Referrals', path: '/post-sales/referrals' },
    ],
  },
  // Only the 4 sub-links below have a real page (see App.jsx) — the other
  // marketing categories (WhatsApp/SMS/Social/Content/Paid Ads/AI
  // Calling/Analytics) don't have routes built yet, so they're deliberately
  // left out rather than linking to a 404.
  {
    label: 'Marketing', icon: 'chart', sub: [
      { label: 'Campaigns', path: '/marketing/campaigns' },
      { label: 'Lead Generation', path: '/marketing/lead-generation/lists' },
      { label: 'Company Knowledge', path: '/marketing/settings/company-knowledge' },
      { label: 'Email Marketing', path: '/marketing/email' },
    ],
  },
  {
    label: 'Reports', icon: 'report', sub: [
      { label: 'Sales Reports', path: '/reports/sales' },
      { label: 'Marketing Reports', path: '/reports/marketing' },
      { label: 'Performance Reports', path: '/reports/performance' },
    ],
  },
]

export const PARTNER_NAV = [
  { label: 'Dashboard', icon: 'home', path: '/partner' },
  { label: 'Projects', icon: 'building', path: '/partner/projects' },
  { label: 'Inventory', icon: 'building', path: '/partner/inventory' },
  { label: 'Register Lead', icon: 'users', path: '/partner/leads/register' },
  { label: 'My Leads', icon: 'users', path: '/partner/leads' },
  { label: 'Site Visits', icon: 'calendar', path: '/partner/site-visits' },
  { label: 'Bookings', icon: 'receipt', path: '/partner/bookings' },
  { label: 'Commissions', icon: 'chart', path: '/partner/commissions' },
  { label: 'Team', icon: 'users', path: '/partner/team' },
  { label: 'Downloads', icon: 'pencil', path: '/partner/downloads' },
  { label: 'Support', icon: 'phone', path: '/partner/support' },
  { label: 'Profile', icon: 'user', path: '/partner/profile' },
]

export const CUSTOMER_NAV = [
  { label: 'Dashboard', icon: 'home', path: '/customer-portal' },
  { label: 'My Property', icon: 'building', path: '/customer-portal/property' },
  { label: 'Payment Schedule', icon: 'calendar', path: '/customer-portal/payment-schedule' },
  { label: 'Receipts', icon: 'receipt', path: '/customer-portal/receipts' },
  { label: 'Documents', icon: 'pencil', path: '/customer-portal/documents' },
  { label: 'Construction Updates', icon: 'chart', path: '/customer-portal/construction-updates' },
  { label: 'Support', icon: 'phone', path: '/customer-portal/support' },
  { label: 'Profile', icon: 'user', path: '/customer-portal/profile' },
]

export function getNavForProduct(productId) {
  if (productId === 'partner') return PARTNER_NAV
  if (productId === 'customer') return CUSTOMER_NAV
  return STAFF_NAV
}
