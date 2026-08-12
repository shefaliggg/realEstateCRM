import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatTile from '../../components/dashboard/StatTile'
import Panel from '../../components/dashboard/Panel'
import TeamPerformanceTable from '../../components/dashboard/TeamPerformanceTable'

const NURTURE_STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']

function isToday(date) {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function startOfDay(offsetDays = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}

export default function SalesManagerDashboard() {
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [bookings, setBookings] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/leads'),
      api.get('/deals'),
      api.get('/bookings'),
      api.get('/projects'),
    ])
      .then(([lRes, dRes, bRes, pRes]) => {
        setLeads(lRes.data)
        setDeals(dRes.data)
        setBookings(bRes.data)
        setProjects(pRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const todayStart = startOfDay()
  const newLeadsToday = leads.filter((l) => new Date(l.createdAt) >= todayStart).length
  const followUpsToday = leads.filter((l) => isToday(l.nextFollowUpDate)).length
  const siteVisitsToday = leads.reduce(
    (count, l) => count + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit' && isToday(t.dueDate)).length,
    0
  )
  const activeDeals = deals.filter((d) => !['Won', 'Lost'].includes(d.stage))
  const bookingsThisMonth = bookings.filter((b) => new Date(b.createdAt) >= startOfDay(-30)).length

  // Org-wide stopgap: "my team" is everyone who shows up as an assignee on
  // leads/deals/bookings, since there's no manager->executive relationship
  // in the data model yet (see plan doc).
  const teamMap = new Map()
  const touch = (person) => {
    if (!person?._id) return
    if (!teamMap.has(person._id)) {
      teamMap.set(person._id, { id: person._id, name: person.name, leads: 0, deals: 0, bookings: 0 })
    }
    return teamMap.get(person._id)
  }
  leads.forEach((l) => {
    const row = touch(l.assignedTo)
    if (row) row.leads += 1
  })
  deals.forEach((d) => {
    const row = touch(d.assignedTo)
    if (row) row.deals += 1
  })
  bookings.forEach((b) => {
    const row = touch(b.bookedBy)
    if (row) row.bookings += 1
  })
  const teamRows = Array.from(teamMap.values()).sort((a, b) => b.leads - a.leads)

  const nurtureCounts = NURTURE_STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.nurtureStage === stage).length,
  }))

  const upcomingVisits = leads
    .flatMap((l) => (l.followUpTasks || []).filter((t) => t.type === 'Site Visit' && !t.completed).map((t) => ({ ...t, leadName: l.name, leadId: l._id })))
    .filter((t) => t.dueDate && new Date(t.dueDate) >= todayStart)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6)

  const totals = projects.reduce(
    (acc, p) => {
      const s = p.inventoryStats || {}
      acc.available += s.available || 0
      acc.total += s.total || 0
      return acc
    },
    { available: 0, total: 0 }
  )

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
        <StatTile icon="👥" label="My Team" val={teamRows.length} color="bg-purple-50 text-purple-600" loading={loading} />
        <StatTile icon="🆕" label="New Leads Today" val={newLeadsToday} color="bg-blue-50 text-blue-600" loading={loading} link="/leads" />
        <StatTile icon="⏰" label="Follow-ups Today" val={followUpsToday} color="bg-orange-50 text-orange-600" loading={loading} link="/leads" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatTile icon="🏠" label="Site Visits Today" val={siteVisitsToday} color="bg-green-50 text-green-600" loading={loading} link="/visits/calendar" />
        <StatTile icon="🤝" label="Active Deals" val={activeDeals.length} color="bg-primary-50 text-primary-600" loading={loading} link="/deals" />
        <StatTile icon="📦" label="Bookings (30d)" val={bookingsThisMonth} color="bg-yellow-50 text-yellow-600" loading={loading} link="/post-sales/bookings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Panel title="👥 Team Performance" loading={loading} empty={!teamRows.length} emptyText="No assigned activity yet">
            <TeamPerformanceTable
              columns={[{ key: 'leads', label: 'Leads' }, { key: 'deals', label: 'Deals' }, { key: 'bookings', label: 'Bookings' }]}
              rows={teamRows}
            />
          </Panel>

          <Panel title="📈 Lead Pipeline" viewAllLink="/leads/nurture" loading={loading}>
            <div className="space-y-2">
              {nurtureCounts.map(({ stage, count }) => (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-xs w-28 text-gray-500 truncate">{stage}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: leads.length ? `${(count / leads.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="🏢 Inventory" viewAllLink="/projects" loading={loading}>
            <p className="text-sm text-gray-600">{totals.available} of {totals.total} units available across {projects.length} projects</p>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="🗓️ Site Visit Pipeline" viewAllLink="/visits/calendar" loading={loading} empty={!upcomingVisits.length} emptyText="No upcoming site visits">
            <div className="space-y-2">
              {upcomingVisits.map((v) => (
                <Link key={v._id} to={`/leads/${v.leadId}`} className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-sm text-gray-900 truncate">{v.leadName}</span>
                  <span className="text-xs text-gray-500">{new Date(v.dueDate).toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="🤝 Channel Partner Deals" viewAllLink="/partners" loading={loading} empty={!deals.some((d) => d.channelPartner)} emptyText="No channel-partner deals yet">
            <p className="text-sm text-gray-600">{deals.filter((d) => d.channelPartner).length} deals sourced via channel partners</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
