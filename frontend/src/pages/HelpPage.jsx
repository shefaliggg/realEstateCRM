import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProductForPath } from '../config/products'

// In-app user manual. Content mirrors the real permission model —
// backend/utils/permissions.js (default role modules), authMiddleware.js
// (manage_inventory / manage_users / portal guards) — so keep it in sync
// when those change.

const ROLES = [
  {
    key: 'builder_admin',
    name: 'Builder Admin',
    track: 'Admin',
    summary: 'Owner of the company workspace. Full access to every module and setting.',
    can: [
      'Everything in the Workspace, always (cannot be locked out by permission changes)',
      'Create, edit and delete projects, towers and units',
      'Invite and deactivate users, change their roles',
      'Turn modules on/off for every other role (Roles & Permissions)',
      'Edit the Company Profile and view the audit log',
      'Preview the Channel Partner and Customer portals',
    ],
  },
  {
    key: 'sales_manager',
    name: 'Sales Manager',
    track: 'Sales',
    summary: 'Runs the sales team: leads, deals, site visits, partners and post-sales.',
    can: ['Dashboard, Projects (view), Leads, Deals, Site Visits, Channel Partners, Post-Sales, Reports'],
  },
  {
    key: 'sales_executive',
    name: 'Sales Executive',
    track: 'Sales',
    summary: 'Works leads and deals day to day; uses My Leads / My Deals for their own queue.',
    can: ['Same modules as Sales Manager by default'],
  },
  {
    key: 'crm_manager',
    name: 'CRM Manager',
    track: 'Sales',
    summary: 'Owns the customer relationship after booking: payments, documents, referrals.',
    can: ['Same modules as Sales Manager by default'],
  },
  {
    key: 'crm_executive',
    name: 'CRM Executive',
    track: 'Sales',
    summary: 'Handles day-to-day post-sales work: payment schedules, receipts, customer queries.',
    can: ['Same modules as Sales Manager by default'],
  },
  {
    key: 'marketing_manager',
    name: 'Marketing Manager',
    track: 'Marketing',
    summary: 'Plans campaigns and lead generation; sees leads to track marketing attribution.',
    can: ['Dashboard, Projects (view), Leads, Reports, Campaigns, Lead Generation, Company Knowledge, Email Marketing'],
  },
  {
    key: 'marketing_executive',
    name: 'Marketing Executive',
    track: 'Marketing',
    summary: 'Executes campaigns, builds lead lists and email sends.',
    can: ['Same modules as Marketing Manager by default'],
  },
  {
    key: 'partner_admin',
    name: 'Partner Admin',
    track: 'Channel Partner',
    summary: 'The broker / agency account, created when a builder adds a channel partner.',
    can: [
      'Partner Portal only — projects, inventory, register leads, bookings, commissions',
      'Invite and manage their own agents (Team)',
      'Assign their agency\'s leads to agents',
    ],
  },
  {
    key: 'partner_agent',
    name: 'Partner Agent',
    track: 'Channel Partner',
    summary: 'An individual agent working under a partner agency.',
    can: [
      'Partner Portal — register leads (auto-assigned to themselves), view their leads and site visits',
      'Cannot invite agents or reassign leads',
    ],
  },
  {
    key: 'customer',
    name: 'Customer',
    track: 'Customer',
    summary: 'A buyer, invited from Post-Sales → Customers once they have a booking.',
    can: [
      'Customer Portal only — their property, payment schedule, receipts, documents, construction updates',
      'Read-only: customers cannot change bookings or payments',
    ],
  },
]

// Default module matrix for the 7 internal roles (permissions.js
// SALES_TRACK_MODULES / MARKETING_TRACK_MODULES). Admins can change any
// of these per role under Settings → Roles & Permissions.
const MATRIX_MODULES = [
  'Dashboard', 'Projects', 'Leads', 'Deals', 'Site Visits', 'Channel Partners',
  'Post-Sales', 'Reports', 'Campaigns', 'Lead Generation', 'Email Marketing', 'Settings',
]
const SALES_DEFAULT = ['Dashboard', 'Projects', 'Leads', 'Deals', 'Site Visits', 'Channel Partners', 'Post-Sales', 'Reports']
const MARKETING_DEFAULT = ['Dashboard', 'Projects', 'Leads', 'Reports', 'Campaigns', 'Lead Generation', 'Settings', 'Email Marketing']
const MATRIX_COLUMNS = [
  { label: 'Admin', modules: MATRIX_MODULES },
  { label: 'Sales / CRM', modules: SALES_DEFAULT },
  { label: 'Marketing', modules: MARKETING_DEFAULT },
]

const STAFF_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'workflow', label: 'How a sale flows' },
  { id: 'modules', label: 'Modules' },
  { id: 'portals', label: 'Partner & customer portals' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'faq', label: 'FAQ' },
]
const PARTNER_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'partner-portal', label: 'Using the portal' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'faq', label: 'FAQ' },
]
const CUSTOMER_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting started' },
  { id: 'customer-portal', label: 'Using the portal' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'faq', label: 'FAQ' },
]

function Section({ id, title, children }) {
  return (
    <section id={id} className="bg-white border border-gray-200 rounded-xl p-6 scroll-mt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  )
}

function Steps({ items }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

function Bullets({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Pill({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-50 text-primary-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }
  return <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>{children}</span>
}

function StatusFlow({ steps }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <Pill tone={s.tone}>{s.label}</Pill>
          {i < steps.length - 1 && <span className="text-gray-300">→</span>}
        </span>
      ))}
    </div>
  )
}

function Faq({ items }) {
  const [openIdx, setOpenIdx] = useState(null)
  return (
    <div className="divide-y divide-gray-100 -my-2">
      {items.map((item, i) => (
        <div key={i} className="py-2">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 text-left font-medium text-gray-800 py-1"
          >
            {item.q}
            <svg
              className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIdx === i && <p className="mt-1 text-gray-600">{item.a}</p>}
        </div>
      ))}
    </div>
  )
}

function RolesSection({ roles }) {
  return (
    <Section id="roles" title="Roles">
      <p>
        Every person has <strong>one role per company</strong>. If you belong to more than one builder
        organisation, your role can differ in each — switch organisations from the user menu at the
        bottom of the sidebar.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((r) => (
          <div key={r.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-900">{r.name}</p>
              <Pill tone={r.track === 'Admin' ? 'primary' : r.track === 'Sales' ? 'green' : r.track === 'Marketing' ? 'amber' : 'gray'}>
                {r.track}
              </Pill>
            </div>
            <p className="text-gray-500 mb-2">{r.summary}</p>
            <Bullets items={r.can} />
          </div>
        ))}
      </div>
    </Section>
  )
}

function PermissionsSection() {
  return (
    <Section id="permissions" title="Permissions">
      <p>
        Access is controlled per <strong>module</strong> (a sidebar section) for each internal role. If a
        module is switched off for your role, it disappears from your sidebar and the server rejects its
        requests. The table shows the <strong>defaults</strong> — your admin may have changed them under
        Settings → Roles &amp; Permissions.
      </p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-1 font-semibold">Module</th>
              {MATRIX_COLUMNS.map((c) => (
                <th key={c.label} className="py-2 px-1 font-semibold text-center">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_MODULES.map((m) => (
              <tr key={m} className="border-b border-gray-100">
                <td className="py-1.5 px-1 text-gray-800">{m}</td>
                {MATRIX_COLUMNS.map((c) => (
                  <td key={c.label} className="py-1.5 px-1 text-center">
                    {c.modules.includes(m)
                      ? <span className="text-green-600 font-semibold">✓</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-medium text-gray-800 pt-1">Two actions are admin-only by default, separate from modules:</p>
      <Bullets
        items={[
          <><strong>Manage inventory</strong> — creating, editing or deleting projects, towers and units (including bulk create/update). Everyone with the Projects module can <em>view</em> inventory.</>,
          <><strong>Manage users</strong> — inviting users, changing roles, editing Roles &amp; Permissions and the Company Profile.</>,
        ]}
      />
      <p>
        The Builder Admin always has every permission, so an admin can never lock themselves out by
        misconfiguring roles.
      </p>
    </Section>
  )
}

function WorkflowSection() {
  return (
    <Section id="workflow" title="How a sale flows through PropVault">
      <Steps
        items={[
          <><strong>Set up inventory.</strong> An admin creates a project (Building, Villa, Plot, Commercial or Mixed Use), adds towers/blocks and units with pricing.</>,
          <><strong>Capture leads.</strong> Leads come in manually, from Lead Generation lists/imports, from campaigns, or are registered by channel partners.</>,
          <><strong>Nurture.</strong> Move leads across the Nurture Board and log follow-ups (call, WhatsApp, email, meeting).</>,
          <><strong>Site visit.</strong> Schedule visits and track them on the calendar.</>,
          <><strong>Deal.</strong> Convert a serious lead into a deal and move it through the pipeline until Won or Lost.</>,
          <><strong>Booking.</strong> Create a customer and a booking against a unit. The unit becomes <em>Booked</em> automatically.</>,
          <><strong>Post-sales.</strong> Set up the payment schedule, record payments, share documents and invite the customer to their portal.</>,
          <><strong>Registration.</strong> Mark the booking Completed — the unit becomes <em>Registered</em>. If cancelled instead, the unit returns to <em>Available</em>.</>,
        ]}
      />
      <div className="grid gap-3 pt-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lead nurture stages</p>
          <StatusFlow steps={[
            { label: 'Cold', tone: 'gray' }, { label: 'Warm', tone: 'amber' }, { label: 'Interested', tone: 'amber' },
            { label: 'Very Interested', tone: 'green' }, { label: 'Nurtured', tone: 'green' },
          ]} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deal stages</p>
          <StatusFlow steps={[
            { label: 'Lead Qualification', tone: 'gray' }, { label: 'Needs Analysis', tone: 'gray' },
            { label: 'Proposal Sent', tone: 'amber' }, { label: 'Negotiation', tone: 'amber' },
            { label: 'Contract Review', tone: 'amber' }, { label: 'Won / Lost', tone: 'green' },
          ]} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Unit status</p>
          <StatusFlow steps={[
            { label: 'Available', tone: 'green' }, { label: 'Reserved', tone: 'amber' },
            { label: 'Booked', tone: 'primary' }, { label: 'Registered', tone: 'primary' },
          ]} />
          <p className="mt-1.5 text-xs text-gray-500">A unit can also be marked <em>Cancelled</em>. Cancelling a booking puts its unit back to Available.</p>
        </div>
      </div>
    </Section>
  )
}

const MODULES = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    body: 'Snapshot of leads, deals, inventory and collections for your company.',
  },
  {
    name: 'Projects & Inventory',
    path: '/inventory',
    body: 'Projects are grouped by type (Buildings, Villas, Plots, Commercial, Mixed Use). Open a project to see its towers/blocks, unit grid, media and team. Inventory lists every unit across projects with status filters. Only users with "manage inventory" can add or edit.',
  },
  {
    name: 'Leads',
    path: '/leads',
    body: 'All Leads is the full list; My Leads shows only those assigned to you. The Nurture Board is a drag-style view by nurture stage. Lead Sources breaks down where leads come from (Website, 99acres, MagicBricks, referrals, ads, walk-ins…).',
  },
  {
    name: 'Deals',
    path: '/deals/pipeline',
    body: 'Track deal value, stage and commission. Pipeline shows deals by stage; My Deals filters to your own. Deals linked to a channel partner carry the partner\'s commission status (Pending → Processing → Paid).',
  },
  {
    name: 'Site Visits',
    path: '/visits/calendar',
    body: 'Schedule visits for leads and see them on a calendar.',
  },
  {
    name: 'Channel Partners',
    path: '/partners',
    body: 'Add brokers/agencies with a commission rate. Adding a partner emails their contact person a Partner Portal login. Partner Leads shows leads they registered; Payouts tracks commissions owed.',
  },
  {
    name: 'Post-Sales',
    path: '/post-sales/bookings',
    body: 'Customers, bookings, payment schedules, payments (Online, Cheque, NEFT, IMPS, Cash), documents and referrals. Invite a customer to the Customer Portal from the Customers page — they need an email address on file first.',
  },
  {
    name: 'Marketing',
    path: '/marketing/campaigns',
    body: 'AI-assisted campaigns, lead generation (lists, Google Maps search, CSV import), Company Knowledge used to ground AI content, and email campaigns with templates and sender settings.',
  },
  {
    name: 'Reports',
    path: '/reports/sales',
    body: 'Sales, marketing and team performance reports.',
  },
  {
    name: 'Settings',
    path: '/settings',
    body: 'Admins see Company Profile, Users, Roles & Permissions and more. Other users see their general settings only.',
  },
]

function ModulesSection() {
  return (
    <Section id="modules" title="Modules">
      <p>You only see the modules your role has access to.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <div key={m.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-900">{m.name}</p>
              <Link to={m.path} className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0">Open →</Link>
            </div>
            <p className="text-gray-500">{m.body}</p>
          </div>
        ))}
      </div>
      <p>
        The <strong>AI assistant</strong> is available from the top bar on any page for quick questions and
        drafting help.
      </p>
    </Section>
  )
}

function PortalsSection() {
  return (
    <Section id="portals" title="Partner & customer portals">
      <p>
        PropVault has two external portals. People using them never see your internal Workspace — the
        server blocks every internal endpoint for them.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-1">Channel Partner Portal</p>
          <Bullets items={[
            'Created automatically when you add a channel partner',
            'Partners see your projects and inventory, register leads, track their bookings and commissions',
            'Partner admins can invite their own agents',
            'Leads they register appear in your Leads module with source "Referral"',
          ]} />
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-1">Customer Portal</p>
          <Bullets items={[
            'Invite from Post-Sales → Customers (email required)',
            'Customers see their property, payment schedule, receipts, documents and construction updates',
            'Everything is read-only for the customer',
          ]} />
        </div>
      </div>
      <p>Builder Admins can open either portal directly to preview what partners and customers see.</p>
    </Section>
  )
}

function PartnerPortalSection({ isPartnerAdmin }) {
  return (
    <Section id="partner-portal" title="Using the Channel Partner Portal">
      <Steps items={[
        <><strong>Browse projects &amp; inventory</strong> to see what the builder currently has available.</>,
        <><strong>Register a lead</strong> with at least a name and phone. Add the project they are interested in so the builder routes it correctly.</>,
        <><strong>Track your leads</strong> under My Leads and their visits under Site Visits.</>,
        <><strong>Bookings</strong> shows deals that converted from your leads.</>,
        <><strong>Commissions</strong> shows what you have earned and its status: Pending → Processing → Paid.</>,
        <><strong>Downloads</strong> has brochures and marketing material shared by the builder.</>,
      ]} />
      <p className="font-medium text-gray-800 pt-1">Partner Admin vs Partner Agent</p>
      <Bullets items={[
        'Partner Admins can invite agents under Team, deactivate them, and assign leads to agents.',
        'Partner Agents see leads assigned to them. A lead an agent registers is assigned to that agent automatically.',
      ]} />
      {!isPartnerAdmin && (
        <p className="text-gray-500">You are signed in as an agent — ask your partner admin if you need a lead reassigned.</p>
      )}
    </Section>
  )
}

function CustomerPortalSection() {
  return (
    <Section id="customer-portal" title="Using the Customer Portal">
      <Bullets items={[
        <><strong>My Property</strong> — your booked unit, its project and booking details.</>,
        <><strong>Payment Schedule</strong> — every instalment with its due date and status (Pending, Paid, Overdue).</>,
        <><strong>Receipts</strong> — payments the builder has recorded against your booking.</>,
        <><strong>Documents</strong> — agreements and other files shared with you.</>,
        <><strong>Construction Updates</strong> — progress on your project.</>,
        <><strong>Support</strong> — contact details for your builder's team.</>,
      ]} />
    </Section>
  )
}

const STAFF_LIMITATIONS = [
  'Lead, deal and site-visit lists are visible to everyone with that module — "My Leads" / "My Deals" filter to your own but do not hide other people\'s records.',
  'Only Builder Admins (or roles granted "manage inventory") can change projects, towers and units. Others get a "permission denied" error.',
  'Several Settings pages — Teams, Lead/Deal/Site Visit Settings, Notifications, Integrations — are not built yet and show a placeholder.',
  'WhatsApp, SMS, Social Media, Content & SEO, Paid Ads, AI Calling and Marketing Analytics exist as permission toggles but have no pages yet.',
  'Which products your company can use (Product Access) is managed by PropVault — contact support to change it.',
  'Invitation emails need email to be configured on the server; if not, the invite is created but no email is sent.',
  'Customers can only be invited to the portal if they have an email address.',
  'Sessions expire after 7 days by default; password-reset links expire after 15 minutes.',
]
const PARTNER_LIMITATIONS = [
  'You only see your own agency\'s leads, bookings and commissions — never the builder\'s internal data or other partners.',
  'You cannot edit inventory, pricing or bookings; contact the builder\'s sales team for changes.',
  'Commission amounts and payout status are set by the builder.',
  'Partner Agents cannot invite team members or reassign leads.',
  'Password-reset links expire after 15 minutes.',
]
const CUSTOMER_LIMITATIONS = [
  'The portal is read-only — to change a booking, payment or document, contact the builder via Support.',
  'Payments shown are the ones the builder has recorded; online payment from the portal is not available.',
  'Password-reset links expire after 15 minutes.',
]

const STAFF_FAQ = [
  { q: 'A module is missing from my sidebar.', a: 'Your role does not have that module enabled. Ask your Builder Admin to turn it on under Settings → Roles & Permissions.' },
  { q: 'I get "Access denied" when saving a unit or project.', a: 'Editing inventory needs the "manage inventory" permission, which only admins have by default.' },
  { q: 'How do I add a team member?', a: 'Builder Admins go to Settings → Users and invite them with a role. They receive an email to set their password.' },
  { q: 'I work for two builders. How do I switch?', a: 'Click your name at the bottom of the sidebar and pick the organisation under "Switch Organization".' },
  { q: 'Why did a unit change to Booked by itself?', a: 'Creating a booking marks the unit Booked. Completing the booking marks it Registered; cancelling returns it to Available.' },
  { q: 'I forgot my password.', a: 'Use "Forgot password" on the login page. The reset link is valid for 15 minutes.' },
]
const PARTNER_FAQ = [
  { q: 'I registered a lead but cannot find it.', a: 'Check My Leads. If you are an agent and the lead was registered by your admin, it shows once they assign it to you.' },
  { q: 'When is my commission paid?', a: 'Status moves from Pending to Processing to Paid as the builder processes it. Contact the builder\'s team for timelines.' },
  { q: 'How do I add an agent?', a: 'Partner Admins can invite agents from the Team page.' },
  { q: 'I forgot my password.', a: 'Use "Forgot password" on the login page. The reset link is valid for 15 minutes.' },
]
const CUSTOMER_FAQ = [
  { q: 'A payment I made is not showing.', a: 'Receipts appear once the builder records the payment. If it is still missing after a few days, contact them via Support.' },
  { q: 'How do I get a copy of my agreement?', a: 'Check Documents. If it is not there, request it through Support.' },
  { q: 'I forgot my password.', a: 'Use "Forgot password" on the login page. The reset link is valid for 15 minutes.' },
]

// Mounted at /help, /partner/help and /customer-portal/help — the path (not
// the role) picks the guide, so a builder_admin previewing a portal sees
// that portal's guide.
function audienceFor(pathname) {
  const productId = getProductForPath(pathname).id
  return productId === 'crm' ? 'staff' : productId
}

export default function HelpPage() {
  const { user } = useAuth()
  const location = useLocation()
  const audience = audienceFor(location.pathname)
  const roleName = ROLES.find((r) => r.key === user?.role)?.name ?? user?.role?.replace(/_/g, ' ')

  const sections = audience === 'partner' ? PARTNER_SECTIONS : audience === 'customer' ? CUSTOMER_SECTIONS : STAFF_SECTIONS
  const limitations = audience === 'partner' ? PARTNER_LIMITATIONS : audience === 'customer' ? CUSTOMER_LIMITATIONS : STAFF_LIMITATIONS
  const faq = audience === 'partner' ? PARTNER_FAQ : audience === 'customer' ? CUSTOMER_FAQ : STAFF_FAQ

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help &amp; User Guide</h1>
        <p className="text-sm text-gray-500 mt-1">
          How PropVault works, what each role can do, and current limitations.
          {roleName && <> You are signed in as <span className="font-medium text-gray-700 capitalize">{roleName}</span>.</>}
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="hidden lg:block w-48 shrink-0 sticky top-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">On this page</p>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="block w-full text-left px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition"
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 space-y-4">
          <Section id="overview" title="Overview">
            {audience === 'staff' && (
              <p>
                PropVault is a CRM for real-estate developers. It covers the full journey of a property sale —
                from inventory and lead capture, through site visits and deals, to bookings, payment collection
                and handover — plus marketing tools and portals for channel partners and buyers. Each builder
                company has its own private workspace; data is never shared between companies.
              </p>
            )}
            {audience === 'partner' && (
              <p>
                The Channel Partner Portal lets your agency work with a builder on PropVault: see their projects
                and available units, register buyers you bring in, and track bookings and commissions earned.
              </p>
            )}
            {audience === 'customer' && (
              <p>
                The Customer Portal is your window into your property purchase: booking details, upcoming
                instalments, receipts, documents and construction progress — all shared by your builder.
              </p>
            )}
          </Section>

          <Section id="getting-started" title="Getting started">
            <Steps items={[
              audience === 'staff'
                ? 'Your Builder Admin invites you by email with a role.'
                : audience === 'partner'
                  ? 'The builder (or your partner admin) invites you by email.'
                  : 'Your builder invites you by email after your booking.',
              'Open the invitation, sign in, and set your own password when prompted.',
              'Use the sidebar to move between sections. On mobile, open it with the menu button at the top left.',
              <>Update your name and contact details from your <strong>Profile</strong> (user menu at the bottom of the sidebar).</>,
            ]} />
          </Section>

          {audience === 'staff' && (
            <>
              <RolesSection roles={ROLES} />
              <PermissionsSection />
              <WorkflowSection />
              <ModulesSection />
              <PortalsSection />
            </>
          )}
          {audience === 'partner' && <PartnerPortalSection isPartnerAdmin={user?.role === 'partner_admin'} />}
          {audience === 'customer' && <CustomerPortalSection />}

          <Section id="limitations" title="Limitations">
            <Bullets items={limitations} />
          </Section>

          <Section id="faq" title="FAQ">
            <Faq items={faq} />
          </Section>

          <p className="text-xs text-gray-400 text-center pt-2">
            Still stuck? {audience === 'staff' ? 'Ask your Builder Admin or contact PropVault support.' : 'Use the Support page in the sidebar.'}
          </p>
        </div>
      </div>
    </div>
  )
}
