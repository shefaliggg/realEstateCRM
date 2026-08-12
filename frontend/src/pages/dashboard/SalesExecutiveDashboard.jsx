import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import StatTile from '../../components/dashboard/StatTile'
import Panel from '../../components/dashboard/Panel'

const NURTURE_STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']
const TASK_ICONS = { Call: '📞', WhatsApp: '💬', Email: '✉️', 'Site Visit': '🏠', Meeting: '🤝', Other: '📌' }

function startOfDay(offsetDays = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}

export default function SalesExecutiveDashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?._id) return
    Promise.all([
      api.get('/leads', { params: { assignedTo: user._id } }),
      api.get('/deals'),
      api.get('/bookings'),
    ])
      .then(([lRes, dRes, bRes]) => {
        setLeads(lRes.data)
        setDeals(dRes.data.filter((d) => d.assignedTo?._id === user._id))
        setBookings(bRes.data.filter((b) => b.bookedBy?._id === user._id))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?._id])

  const todayStart = startOfDay()
  const todayEnd = startOfDay(1)
  const newLeads = leads.filter((l) => new Date(l.createdAt) >= todayStart).length
  const followUpsDue = leads.filter((l) => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < todayEnd)
  const activeDeals = deals.filter((d) => !['Won', 'Lost'].includes(d.stage))

  const todaysTasks = leads
    .flatMap((l) => (l.followUpTasks || []).filter((t) => !t.completed).map((t) => ({ ...t, leadName: l.name, leadId: l._id })))
    .filter((t) => t.dueDate && new Date(t.dueDate) < todayEnd)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const siteVisits = leads.reduce(
    (count, l) => count + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit' && !t.completed).length,
    0
  )

  const upcomingVisits = leads
    .flatMap((l) => (l.followUpTasks || []).filter((t) => t.type === 'Site Visit' && !t.completed).map((t) => ({ ...t, leadName: l.name, leadId: l._id })))
    .filter((t) => t.dueDate && new Date(t.dueDate) >= todayEnd)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  const stageCounts = NURTURE_STAGES.map((stage) => ({ stage, count: leads.filter((l) => l.nurtureStage === stage).length }))
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count))

  return (
    <div className="p-6">
      <Panel title="✅ Today's Tasks" viewAllLink="/leads/mine" loading={loading} empty={!todaysTasks.length} emptyText="All caught up for today! ✅">
        <div className="space-y-2">
          {todaysTasks.map((t) => (
            <Link key={t._id} to={`/leads/${t.leadId}`} className="flex items-center gap-3 py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
              <span className="text-lg">{TASK_ICONS[t.type] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{t.type} — {t.leadName}</p>
                {t.note && <p className="text-xs text-gray-400 truncate">{t.note}</p>}
              </div>
              <span className="text-xs text-red-500 shrink-0">{new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-5">
        <StatTile icon="👥" label="My Leads" val={leads.length} color="bg-blue-50 text-blue-600" loading={loading} link="/leads/mine" />
        <StatTile icon="🆕" label="New Leads" val={newLeads} color="bg-green-50 text-green-600" loading={loading} link="/leads/mine" />
        <StatTile icon="⏰" label="Follow-ups" val={followUpsDue.length} color="bg-orange-50 text-orange-600" loading={loading} link="/leads/mine" />
        <StatTile icon="🏠" label="Site Visits" val={siteVisits} color="bg-purple-50 text-purple-600" loading={loading} link="/visits/calendar" />
        <StatTile icon="🤝" label="Active Deals" val={activeDeals.length} color="bg-primary-50 text-primary-600" loading={loading} link="/deals/mine" />
        <StatTile icon="📦" label="Bookings" val={bookings.length} color="bg-yellow-50 text-yellow-600" loading={loading} link="/post-sales/bookings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Panel title="📈 My Lead Pipeline" viewAllLink="/leads/nurture" loading={loading}>
            <div className="flex items-end gap-3 h-32">
              {stageCounts.map(({ stage, count }) => (
                <div key={stage} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{count}</span>
                  <div className="w-full bg-primary-400 rounded-t-md" style={{ height: `${(count / maxStage) * 100}%`, minHeight: count ? '4px' : '0' }} />
                  <span className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight">{stage}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="👤 Recent Leads" viewAllLink="/leads/mine" loading={loading} empty={!recentLeads.length} emptyText="No leads assigned yet">
            <div className="divide-y divide-gray-50">
              {recentLeads.map((l) => (
                <Link key={l._id} to={`/leads/${l._id}`} className="flex items-center justify-between py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-400">{l.source}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{l.nurtureStage}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="🗓️ Upcoming Site Visits" viewAllLink="/visits/calendar" loading={loading} empty={!upcomingVisits.length} emptyText="No upcoming site visits">
            <div className="space-y-2">
              {upcomingVisits.map((v) => (
                <Link key={v._id} to={`/leads/${v.leadId}`} className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-sm text-gray-900 truncate">{v.leadName}</span>
                  <span className="text-xs text-gray-500">{new Date(v.dueDate).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="⏰ Pending Follow-ups" viewAllLink="/leads/mine" loading={loading} empty={!followUpsDue.length} emptyText="All caught up! ✅">
            <div className="space-y-2">
              {followUpsDue.slice(0, 6).map((l) => (
                <Link key={l._id} to={`/leads/${l._id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-sm text-gray-900 truncate">{l.name}</span>
                  <span className="text-xs text-red-500">{new Date(l.nextFollowUpDate).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
