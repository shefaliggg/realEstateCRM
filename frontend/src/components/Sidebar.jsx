import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoleModulePermissions } from '../utils/rolePermissions'

const NAV = [
  {
    group: null,
    items: [{ label: 'Dashboard', icon: 'home', path: '/dashboard' }],
  },
  {
    group: 'CORE',
    items: [
      {
        label: 'Projects', icon: 'building', sub: [
          { label: 'All Projects', path: '/projects' },
          { label: 'Add Project', path: '/projects/add' },
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
      {
        label: 'Users & Roles', icon: 'user', adminOnly: true, sub: [
          { label: 'Manage Users', path: '/users' },
          { label: 'Permissions', path: '/permissions' },
        ],
      },
      {
        label: 'Reports', icon: 'report', sub: [
          { label: 'Sales Reports', path: '/reports/sales' },
          { label: 'Marketing Reports', path: '/reports/marketing' },
          { label: 'Performance Reports', path: '/reports/performance' },
        ],
      },
    ],
  },
  {
    group: 'MARKETING',
    items: [
      {
        label: 'Campaigns', icon: 'chart', sub: [
          { label: 'All Campaigns', path: '/marketing/campaigns' },
          { label: 'Create Campaign', path: '/marketing/campaigns/create' },
        ],
      },
      {
        label: 'Email Marketing', icon: 'email', sub: [
          { label: 'Campaigns', path: '/marketing/email' },
          { label: 'Templates', path: '/marketing/email/templates' },
        ],
      },
      {
        label: 'WhatsApp Marketing', icon: 'whatsapp', sub: [
          { label: 'Broadcasts', path: '/marketing/whatsapp' },
          { label: 'Templates', path: '/marketing/whatsapp/templates' },
        ],
      },
      {
        label: 'SMS Marketing', icon: 'sms', sub: [
          { label: 'Campaigns', path: '/marketing/sms' },
        ],
      },
      {
        label: 'Social Media', icon: 'globe', sub: [
          { label: 'All Posts', path: '/marketing/social' },
          { label: 'Create Post', path: '/marketing/social/create' },
          { label: 'Scheduler', path: '/marketing/social/scheduler' },
        ],
      },
      {
        label: 'Content & SEO', icon: 'pencil', sub: [
          { label: 'Blogs', path: '/marketing/content' },
          { label: 'Drafts', path: '/marketing/content/drafts' },
        ],
      },
      {
        label: 'Paid Ads', icon: 'target', sub: [
          { label: 'Campaigns', path: '/marketing/ads' },
          { label: 'Performance', path: '/marketing/ads/performance' },
        ],
      },
      {
        label: 'AI Calling', icon: 'phone', sub: [
          { label: 'Call Campaigns', path: '/marketing/calling' },
          { label: 'Call Logs', path: '/marketing/calling/logs' },
        ],
      },
      {
        label: 'Marketing Analytics', icon: 'analytics', sub: [
          { label: 'Overview', path: '/marketing/analytics' },
          { label: 'Channel Performance', path: '/marketing/analytics/channels' },
          { label: 'CPL / ROI', path: '/marketing/analytics/roi' },
        ],
      },
    ],
  },
]

const ICONS = {
  home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  building: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  deal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  handshake: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  receipt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
  chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  whatsapp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  sms: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  globe: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />,
  pencil: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  target: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
  phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
  analytics: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  report: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
}

function NavIcon({ name }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {ICONS[name]}
    </svg>
  )
}

function getInitialOpen(pathname) {
  const open = new Set()
  for (const { items } of NAV) {
    for (const item of items) {
      if (item.sub?.some((s) => pathname === s.path || pathname.startsWith(s.path + '/'))) {
        open.add(item.label)
      }
    }
  }
  return open
}

export default function Sidebar({ mobileOpen, onClose, user: userProp, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => getInitialOpen(location.pathname))
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sectionOpen, setSectionOpen] = useState({ CORE: false, MARKETING: false })
  const [, setPermissionsVersion] = useState(0)

  const { user: authUser } = useAuth()
  const user = userProp ?? authUser
  const roleModulePermissions = getRoleModulePermissions(user?.role)

  useEffect(() => {
    const syncPermissions = () => setPermissionsVersion((v) => v + 1)
    window.addEventListener('role-permissions-updated', syncPermissions)
    return () => window.removeEventListener('role-permissions-updated', syncPermissions)
  }, [])

  function handleLogout() {
    setUserMenuOpen(false)
    onClose?.()
    if (onLogout) {
      onLogout()
    }
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  const toggle = (label) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })

  const toggleSection = (group) => {
    setSectionOpen((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen w-60 bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200 shrink-0">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
            </svg>
          </div>
          <p className="text-gray-900 text-sm font-bold">PropVault</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 sidebar-scroll">
          {NAV.map(({ group, items }) => (
            <div
              key={group ?? '_root'}
              className={
                group === 'CORE'
                  ? 'mt-2 bg-sky-50/60 border-y border-sky-100'
                  : group === 'MARKETING'
                    ? 'mt-3 bg-emerald-50/60 border-y border-emerald-100'
                    : ''
              }
            >
              {group && (
                <button
                  onClick={() => toggleSection(group)}
                  className="w-full px-3 pt-3 pb-1.5 flex items-center justify-between text-[9px] font-bold tracking-[0.12em] text-gray-400 uppercase hover:text-gray-600 transition"
                >
                  <span>{group}</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${sectionOpen[group] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              {(!group || sectionOpen[group]) && items
                .filter((item) => (!item.adminOnly || user?.role === 'admin') && (roleModulePermissions[item.label] ?? true))
                .map((item) =>
                item.path ? (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-all
                      ${isActive(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.label}>
                    <button
                      onClick={() => toggle(item.label)}
                      style={{ width: 'calc(100% - 16px)' }}
                      className={`flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-all
                        ${open.has(item.label) || item.sub?.some((s) => isActive(s.path))
                          ? 'text-primary-700 bg-primary-50/60'
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                    >
                      <NavIcon name={item.icon} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <svg
                        className={`w-3 h-3 transition-transform shrink-0 ${open.has(item.label) ? 'rotate-180 text-primary-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open.has(item.label) && (
                      <div className="ml-9 mr-2 mb-1">
                        {item.sub.map((child) => (
                          <Link
                            key={child.label}
                            to={child.path}
                            onClick={onClose}
                            className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-xs transition-all
                              ${isActive(child.path)
                                ? 'text-primary-700 font-semibold bg-primary-50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full shrink-0 ${isActive(child.path) ? 'bg-primary-600' : 'bg-gray-300'}`}
                            />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </nav>

        <div className="relative border-t border-gray-200 p-3 shrink-0 bg-white/70">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-1.5 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[11px] text-gray-500 capitalize truncate">{user?.role ?? 'admin'}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute left-full ml-2 bottom-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
              <Link
                to="/profile"
                onClick={() => {
                  setUserMenuOpen(false)
                  onClose?.()
                }}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Profile
              </Link>

              <div className="h-px bg-gray-200" />

              <Link
                to="/settings"
                onClick={() => {
                  setUserMenuOpen(false)
                  onClose?.()
                }}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Settings
              </Link>

              <div className="h-px bg-gray-200" />

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
