import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import BuilderAdminDashboard from './dashboard/BuilderAdminDashboard'
import SalesManagerDashboard from './dashboard/SalesManagerDashboard'
import SalesExecutiveDashboard from './dashboard/SalesExecutiveDashboard'
import CrmDashboard from './dashboard/CrmDashboard'
import MarketingDashboard from './dashboard/MarketingDashboard'

const NURTURE_STAGE_COLORS = {
  Cold: 'bg-slate-100 text-slate-600',
  Warm: 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-orange-100 text-orange-700',
  'Very Interested': 'bg-red-100 text-red-700',
  Nurtured: 'bg-green-100 text-green-700',
}

const DEAL_STAGE_STYLES = {
  'Lead Qualification': 'bg-blue-100 text-blue-700',
  'Needs Analysis': 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-yellow-100 text-yellow-700',
  Negotiation: 'bg-orange-100 text-orange-700',
  'Contract Review': 'bg-pink-100 text-pink-700',
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-500',
}

function InventoryMiniBar({ stats }) {
  const total = stats.total || 1
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden mb-1">
        <div className="bg-green-400" style={{ width: `${(stats.available / total) * 100}%` }} />
        <div className="bg-yellow-400" style={{ width: `${(stats.reserved / total) * 100}%` }} />
        <div className="bg-orange-500" style={{ width: `${(stats.booked / total) * 100}%` }} />
        <div className="bg-blue-400" style={{ width: `${(stats.registered / total) * 100}%` }} />
      </div>
      <div className="flex gap-2 text-xs text-gray-400">
        <span>{stats.available} avail</span>
        <span>{stats.booked + stats.reserved} prog</span>
        <span>{stats.registered} reg</span>
      </div>
    </div>
  )
}

// Fallback for any role without a dedicated dashboard below.
function GenericDashboard() {
  const [projects, setProjects] = useState([])
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/leads'),
      api.get('/deals'),
    ])
      .then(([pRes, lRes, dRes]) => {
        setProjects(pRes.data)
        setLeads(lRes.data)
        setDeals(dRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const nurtureCounts = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured'].map(s => ({
    stage: s,
    count: leads.filter(l => l.nurtureStage === s).length,
  }))

  const activeDeals = deals.filter(d => !['Won', 'Lost'].includes(d.stage))
  const wonDeals = deals.filter(d => d.stage === 'Won')

  const followUpsDue = leads.filter(l =>
    l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()
  )

  const totalInventory = projects.reduce((s, p) => s + (p.inventoryStats?.total || 0), 0)
  const totalAvailable = projects.reduce((s, p) => s + (p.inventoryStats?.available || 0), 0)

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '🏗️', label: 'Projects', val: projects.length, color: 'bg-blue-50 text-blue-600', link: '/projects' },
          { icon: '📦', label: 'Total Units', val: totalInventory, sub: `${totalAvailable} available`, color: 'bg-green-50 text-green-600', link: '/inventory' },
          { icon: '👥', label: 'Total Leads', val: leads.length, sub: `${followUpsDue.length} follow-ups due`, color: 'bg-orange-50 text-orange-600', link: '/leads' },
          { icon: '🤝', label: 'Active Deals', val: activeDeals.length, sub: `${wonDeals.length} won`, color: 'bg-primary-50 text-primary-600', link: '/deals' },
        ].map(s => (
          <Link key={s.label} to={s.link}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '-' : s.val}</p>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-0.5">{loading ? '' : s.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">🏗️ Project Inventory</h2>
              <Link to="/projects" className="text-xs text-primary-600 hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="text-gray-300 text-sm py-4">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No projects yet.{' '}
                <Link to="/projects/add" className="text-primary-600 hover:underline">Add one →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(p => (
                  <Link key={p._id} to={`/projects/${p._id}`}
                    className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-2 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                      <span className="text-xs text-gray-400">{p.location?.city}</span>
                    </div>
                    <InventoryMiniBar stats={p.inventoryStats || { total: 0, available: 0, reserved: 0, booked: 0, registered: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">🤝 Active Deals</h2>
              <Link to="/deals" className="text-xs text-primary-600 hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="text-gray-300 text-sm py-4">Loading...</div>
            ) : activeDeals.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No active deals</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activeDeals.slice(0, 5).map(d => (
                  <Link key={d._id} to={`/deals/${d._id}`}
                    className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-5 px-5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.dealName}</p>
                      <p className="text-xs text-gray-400">
                        {d.unit ? `Block ${d.unit.block}-${d.unit.unitNo}` : ''}{d.lead?.name ? ` | ${d.lead.name}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DEAL_STAGE_STYLES[d.stage] || 'bg-gray-100'}`}>
                        {d.stage}
                      </span>
                      {d.value && <p className="text-xs text-gray-500 mt-0.5">₹{(d.value / 100000).toFixed(0)}L</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">📈 Lead Funnel</h2>
              <Link to="/leads/nurture" className="text-xs text-primary-600 hover:underline">Nurture Board →</Link>
            </div>
            {loading ? (
              <div className="text-gray-300 text-sm py-4">Loading...</div>
            ) : (
              <div className="space-y-2">
                {nurtureCounts.map(({ stage, count }) => (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="text-xs w-24 text-gray-500 truncate">{stage}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stage === 'Cold' ? 'bg-slate-300' :
                          stage === 'Warm' ? 'bg-yellow-400' :
                          stage === 'Interested' ? 'bg-orange-400' :
                          stage === 'Very Interested' ? 'bg-red-400' : 'bg-green-500'
                        }`}
                        style={{ width: leads.length ? `${(count / leads.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">⏰ Follow-ups Due</h2>
              <Link to="/leads" className="text-xs text-primary-600 hover:underline">All leads →</Link>
            </div>
            {loading ? (
              <div className="text-gray-300 text-sm py-4">Loading...</div>
            ) : followUpsDue.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">All caught up! ✅</div>
            ) : (
              <div className="space-y-2">
                {followUpsDue.slice(0, 6).map(l => (
                  <Link key={l._id} to={`/leads/${l._id}`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${NURTURE_STAGE_COLORS[l.nurtureStage] || 'bg-gray-100'}`}>
                        {l.nurtureStage}
                      </span>
                    </div>
                    <span className="text-xs text-red-500">
                      {new Date(l.nextFollowUpDate).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ROLE_DASHBOARDS = {
  builder_admin: BuilderAdminDashboard,
  sales_manager: SalesManagerDashboard,
  sales_executive: SalesExecutiveDashboard,
  crm_manager: () => <CrmDashboard scope="manager" />,
  crm_executive: () => <CrmDashboard scope="executive" />,
  marketing_manager: MarketingDashboard,
  marketing_executive: MarketingDashboard,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const RoleDashboard = ROLE_DASHBOARDS[user?.role] || GenericDashboard

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
      </div>
      <RoleDashboard />
    </div>
  )
}
