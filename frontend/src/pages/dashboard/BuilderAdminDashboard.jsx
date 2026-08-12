import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatTile from '../../components/dashboard/StatTile'
import Panel from '../../components/dashboard/Panel'
import TeamPerformanceTable from '../../components/dashboard/TeamPerformanceTable'
import { D3DonutChart } from '../../components/reports/D3Charts'

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
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

export default function BuilderAdminDashboard() {
  const [projects, setProjects] = useState([])
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [partners, setPartners] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/leads'),
      api.get('/deals'),
      api.get('/channel-partners'),
      api.get('/dashboard/admin-summary'),
    ])
      .then(([pRes, lRes, dRes, cpRes, sRes]) => {
        setProjects(pRes.data)
        setLeads(lRes.data)
        setDeals(dRes.data)
        setPartners(cpRes.data)
        setSummary(sRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totals = projects.reduce(
    (acc, p) => {
      const s = p.inventoryStats || {}
      acc.total += s.total || 0
      acc.available += s.available || 0
      acc.booked += (s.booked || 0) + (s.reserved || 0)
      acc.sold += s.registered || 0
      return acc
    },
    { total: 0, available: 0, booked: 0, sold: 0 }
  )

  const sourceCounts = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1
      return acc
    }, {})
  ).map(([source, count]) => ({ source, count }))

  const activeDeals = deals.filter((d) => !['Won', 'Lost'].includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === 'Won')

  const partnerStats = partners
    .map((p) => {
      const partnerDeals = deals.filter((d) => d.channelPartner === p._id)
      const wonValue = partnerDeals.filter((d) => d.stage === 'Won').reduce((s, d) => s + Number(d.value || 0), 0)
      return { id: p._id, name: p.name, deals: partnerDeals.length, won: partnerDeals.filter((d) => d.stage === 'Won').length, value: fmt(wonValue) }
    })
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 6)

  const recentActivity = [
    ...leads.map((l) => ({ id: `lead-${l._id}`, type: 'Lead', label: l.name, at: l.createdAt, link: `/leads/${l._id}` })),
    ...deals.map((d) => ({ id: `deal-${d._id}`, type: 'Deal', label: d.dealName, at: d.createdAt, link: `/deals/${d._id}` })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8)

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatTile icon="🏗️" label="Projects" val={projects.length} loading={loading} link="/projects" />
        <StatTile icon="📦" label="Total Units" val={totals.total} sub={`${totals.available} available`} color="bg-green-50 text-green-600" loading={loading} link="/inventory" />
        <StatTile icon="🏠" label="Booked" val={totals.booked} color="bg-yellow-50 text-yellow-600" loading={loading} link="/inventory" />
        <StatTile icon="✅" label="Sold" val={totals.sold} color="bg-blue-50 text-blue-600" loading={loading} link="/inventory" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatTile icon="💰" label="Revenue" val={fmt(summary?.revenue)} color="bg-primary-50 text-primary-600" loading={loading} />
        <StatTile icon="🧾" label="Collected" val={fmt(summary?.collected)} color="bg-green-50 text-green-600" loading={loading} link="/post-sales/payments" />
        <StatTile icon="⏳" label="Pending" val={fmt(summary?.pending)} color="bg-orange-50 text-orange-600" loading={loading} link="/post-sales/payment-schedules" />
        <StatTile icon="📈" label="Conversion" val={`${summary?.conversionRate ?? 0}%`} sub={`${summary?.leadsThisMonth ?? 0} leads this month`} color="bg-purple-50 text-purple-600" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Panel title="🤝 Sales Performance" loading={loading} empty={!deals.length} emptyText="No deals yet">
            <div className="flex gap-6 mb-4 text-sm">
              <div><span className="text-gray-400">Active deals</span> <span className="font-semibold text-gray-900">{activeDeals.length}</span></div>
              <div><span className="text-gray-400">Won</span> <span className="font-semibold text-gray-900">{wonDeals.length}</span></div>
              <div><span className="text-gray-400">Bookings this month</span> <span className="font-semibold text-gray-900">{summary?.bookingsThisMonth ?? 0}</span></div>
              <div><span className="text-gray-400">Site visits this month</span> <span className="font-semibold text-gray-900">{summary?.siteVisitsThisMonth ?? 0}</span></div>
            </div>
            <div className="divide-y divide-gray-50">
              {activeDeals.slice(0, 5).map((d) => (
                <Link key={d._id} to={`/deals/${d._id}`} className="flex items-center justify-between py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900 truncate">{d.dealName}</span>
                  <span className="text-xs text-gray-400">{d.stage}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="🏢 Inventory Overview" viewAllLink="/projects" loading={loading} empty={!projects.length} emptyText="No projects yet">
            <div className="space-y-4">
              {projects.slice(0, 5).map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-2 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.location?.city}</span>
                  </div>
                  <InventoryMiniBar stats={p.inventoryStats || { total: 0, available: 0, reserved: 0, booked: 0, registered: 0 }} />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="🤝 Channel Partner Performance" viewAllLink="/partners" loading={loading} empty={!partnerStats.length} emptyText="No channel partners yet">
            <TeamPerformanceTable
              columns={[{ key: 'deals', label: 'Deals' }, { key: 'won', label: 'Won' }, { key: 'value', label: 'Won Value' }]}
              rows={partnerStats}
            />
          </Panel>
        </div>

        <div className="space-y-5">
          {!loading && sourceCounts.length > 0 && (
            <D3DonutChart title="📢 Marketing Performance" subtitle="Leads by source" data={sourceCounts} labelKey="source" valueKey="count" />
          )}

          <Panel title="💵 Collections" loading={loading}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Collected</span>
                <span className="font-semibold text-gray-900">{fmt(summary?.collected)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-semibold text-orange-600">{fmt(summary?.pending)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      (summary?.collected || 0) + (summary?.pending || 0)
                        ? (summary.collected / (summary.collected + summary.pending)) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </Panel>

          <Panel title="🕒 Recent Activity" loading={loading} empty={!recentActivity.length} emptyText="No recent activity">
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <Link key={a.id} to={a.link} className="flex items-center justify-between py-1.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400 mr-1.5">{a.type}</span>
                    <span className="text-sm text-gray-800 truncate">{a.label}</span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(a.at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
