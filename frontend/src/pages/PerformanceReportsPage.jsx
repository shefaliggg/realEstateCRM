import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { D3BarChart, D3StackedBarChart } from '../components/reports/D3Charts'

function personName(userLike) {
  if (!userLike) return 'Unassigned'
  if (typeof userLike === 'string') return userLike
  if (typeof userLike === 'object') return userLike.name || userLike.email || 'Unassigned'
  return 'Unassigned'
}

function daysFromRange(range) {
  if (range === '30d') return 30
  if (range === '90d') return 90
  return 365
}

function inRange(dateValue, range) {
  if (!dateValue) return false
  const dt = new Date(dateValue)
  if (Number.isNaN(dt.getTime())) return false
  return Date.now() - dt.getTime() <= daysFromRange(range) * 24 * 60 * 60 * 1000
}

export default function PerformanceReportsPage() {
  const [range, setRange] = useState('90d')
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/leads'), api.get('/deals'), api.get('/projects')])
      .then(([lRes, dRes, pRes]) => {
        setLeads(Array.isArray(lRes.data) ? lRes.data : [])
        setDeals(Array.isArray(dRes.data) ? dRes.data : [])
        setProjects(Array.isArray(pRes.data) ? pRes.data : [])
      })
      .catch(() => setError('Unable to load performance report data'))
      .finally(() => setLoading(false))
  }, [])

  const filteredLeads = useMemo(
    () => leads.filter((l) => inRange(l.createdAt || l.updatedAt, range)),
    [leads, range],
  )
  const filteredDeals = useMemo(
    () => deals.filter((d) => inRange(d.createdAt || d.updatedAt || d.closingDate, range)),
    [deals, range],
  )

  const ownerRows = useMemo(() => {
    const map = {}

    for (const l of filteredLeads) {
      const owner = personName(l.assignedTo)
      if (!map[owner]) map[owner] = { owner, leads: 0, siteVisits: 0, dueFollowUps: 0, deals: 0, won: 0, value: 0 }
      map[owner].leads += 1
      map[owner].siteVisits += (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length
      if (l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()) map[owner].dueFollowUps += 1
    }

    for (const d of filteredDeals) {
      const owner = personName(d.assignedTo)
      if (!map[owner]) map[owner] = { owner, leads: 0, siteVisits: 0, dueFollowUps: 0, deals: 0, won: 0, value: 0 }
      map[owner].deals += 1
      map[owner].value += Number(d.value || 0)
      if (d.stage === 'Won') map[owner].won += 1
    }

    return Object.values(map)
      .map((r) => ({
        ...r,
        winRate: r.deals ? (r.won / r.deals) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredLeads, filteredDeals])

  const projectRows = useMemo(() => {
    return projects
      .map((p) => {
        const stats = p.inventoryStats || {}
        const managedBy = Array.isArray(p.managedBy) ? p.managedBy.length : 0
        const utilization = stats.total ? (((stats.booked || 0) + (stats.registered || 0)) / stats.total) * 100 : 0
        return {
          id: p._id,
          name: p.name,
          city: p.location?.city || '-',
          managedBy,
          total: Number(stats.total || 0),
          available: Number(stats.available || 0),
          booked: Number(stats.booked || 0),
          registered: Number(stats.registered || 0),
          utilization,
        }
      })
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 8)
  }, [projects])

  const totals = {
    leads: filteredLeads.length,
    deals: filteredDeals.length,
    won: filteredDeals.filter((d) => d.stage === 'Won').length,
    siteVisits: filteredLeads.reduce((sum, l) => sum + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length, 0),
  }

  const ownerValueChartData = ownerRows
    .slice(0, 8)
    .map((row) => ({ owner: row.owner, value: Number(row.value || 0) }))

  const ownerMixChartData = ownerRows
    .slice(0, 8)
    .map((row) => ({ owner: row.owner, leads: row.leads, deals: row.deals, won: row.won }))

  const projectUtilizationData = projectRows.map((row) => ({ project: row.name, utilization: Number(row.utilization || 0) }))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Team productivity and project execution performance.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last 12 months</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {loading && <div className="text-sm text-gray-400">Loading report data...</div>}

      {!loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Leads Handled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totals.leads}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Deals Worked</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{totals.deals}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Won Deals</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{totals.won}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Site Visits Logged</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{totals.siteVisits}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <D3BarChart
              title="Top Owner Deal Value"
              subtitle="Highest total deal value by owner"
              data={ownerValueChartData}
              xKey="owner"
              yKey="value"
              color="#7c3aed"
              formatY={(v) => `Rs ${(Number(v) / 100000).toFixed(1)}L`}
            />

            <D3StackedBarChart
              title="Owner Activity Mix"
              subtitle="Lead, deal, and won distribution"
              data={ownerMixChartData}
              xKey="owner"
              keys={['leads', 'deals', 'won']}
              colors={['#2563eb', '#f59e0b', '#16a34a']}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Team Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Owner</th>
                    <th className="px-4 py-3 text-left font-medium">Leads</th>
                    <th className="px-4 py-3 text-left font-medium">Site Visits</th>
                    <th className="px-4 py-3 text-left font-medium">Deals</th>
                    <th className="px-4 py-3 text-left font-medium">Won</th>
                    <th className="px-4 py-3 text-left font-medium">Win Rate</th>
                    <th className="px-4 py-3 text-left font-medium">Due Follow-ups</th>
                    <th className="px-4 py-3 text-left font-medium">Deal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ownerRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No team performance records in this range.</td>
                    </tr>
                  )}
                  {ownerRows.map((r) => (
                    <tr key={r.owner} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.owner}</td>
                      <td className="px-4 py-3 text-gray-700">{r.leads}</td>
                      <td className="px-4 py-3 text-gray-700">{r.siteVisits}</td>
                      <td className="px-4 py-3 text-gray-700">{r.deals}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{r.won}</td>
                      <td className="px-4 py-3 text-primary-700 font-medium">{r.winRate.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-amber-700">{r.dueFollowUps}</td>
                      <td className="px-4 py-3 text-gray-700">Rs {Number(r.value).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <D3BarChart
            title="Project Utilization"
            subtitle="Booked + registered share by project"
            data={projectUtilizationData}
            xKey="project"
            yKey="utilization"
            color="#14b8a6"
            formatY={(v) => `${Number(v).toFixed(1)}%`}
          />

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Project Utilization Snapshot</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Project</th>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-left font-medium">Managers</th>
                    <th className="px-4 py-3 text-left font-medium">Total Units</th>
                    <th className="px-4 py-3 text-left font-medium">Available</th>
                    <th className="px-4 py-3 text-left font-medium">Booked + Registered</th>
                    <th className="px-4 py-3 text-left font-medium">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No project inventory data available.</td>
                    </tr>
                  )}
                  {projectRows.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.city}</td>
                      <td className="px-4 py-3 text-gray-600">{p.managedBy}</td>
                      <td className="px-4 py-3 text-gray-700">{p.total}</td>
                      <td className="px-4 py-3 text-gray-700">{p.available}</td>
                      <td className="px-4 py-3 text-green-700">{p.booked + p.registered}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, p.utilization)}%` }} />
                          </div>
                          <span className="text-xs text-primary-700 font-medium">{p.utilization.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
