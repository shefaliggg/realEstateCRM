import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMe, getPartnerLeads, getPartnerBookings, getPartnerCommissions, getPartnerTeam } from '../../api/partnerApi'
import Panel from '../../components/dashboard/Panel'
import TeamPerformanceTable from '../../components/dashboard/TeamPerformanceTable'

function inr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`
}

export default function PartnerDashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'partner_admin'
  const [partner, setPartner] = useState(null)
  const [notLinked, setNotLinked] = useState(false)
  const [leads, setLeads] = useState([])
  const [bookings, setBookings] = useState([])
  const [commissions, setCommissions] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getMe(),
      getPartnerLeads(),
      getPartnerBookings(),
      getPartnerCommissions(),
      isAdmin ? getPartnerTeam() : Promise.resolve([]),
    ])
      .then(([p, l, b, c, t]) => {
        if (p.status === 'fulfilled') setPartner(p.value)
        else setNotLinked(true)
        if (l.status === 'fulfilled') setLeads(l.value)
        if (b.status === 'fulfilled') setBookings(b.value)
        if (c.status === 'fulfilled') setCommissions(c.value)
        if (t.status === 'fulfilled') setTeam(t.value)
      })
      .finally(() => setLoading(false))
  }, [isAdmin])

  // Bookings/deals don't carry a per-agent field in this data model — only
  // Lead.assignedTo does — so the team table is scoped to leads + site visits.
  const teamRows = team
    .filter((m) => m.role === 'partner_agent')
    .map((m) => {
      const agentLeads = leads.filter((l) => l.assignedTo === m.user?._id)
      const visits = agentLeads.reduce(
        (count, l) => count + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length,
        0
      )
      return { id: m.membershipId, name: m.user?.name || '—', leads: agentLeads.length, visits }
    })
    .sort((a, b) => b.leads - a.leads)

  const pendingCommission = commissions
    .filter((c) => c.commissionStatus !== 'Paid')
    .reduce((a, c) => a + Number(c.commission || 0), 0)

  const stats = [
    ...(isAdmin ? [{ label: 'Team Members', val: loading ? '…' : teamRows.length, color: 'bg-purple-50 border-purple-200 text-purple-700' }] : []),
    { label: isAdmin ? 'Org Leads' : 'My Leads', val: loading ? '…' : leads.length, color: 'bg-gray-50 border-gray-200 text-gray-700' },
    { label: 'Bookings', val: loading ? '…' : bookings.length, color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Pending Commission', val: loading ? '…' : inr(pendingCommission), color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { label: 'Commission Rate', val: partner ? `${partner.commissionRate}%` : '—', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  ]

  const links = [
    { label: 'Register a Lead', path: '/partner/leads/register', icon: '📝' },
    { label: 'Browse Inventory', path: '/partner/inventory', icon: '🏢' },
    { label: 'My Commissions', path: '/partner/commissions', icon: '💰' },
    { label: 'Downloads', path: '/partner/downloads', icon: '📄' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{partner?.name}</p>
      </div>

      {notLinked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
          You're previewing this as admin — no channel partner company is linked to your account, so partner-specific data isn't shown.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl sm:text-2xl font-bold leading-tight">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition flex items-center gap-3"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-semibold text-gray-900">{link.label}</span>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <Panel title="👥 Team Performance" viewAllLink="/partner/team" loading={loading} empty={!teamRows.length} emptyText="No agents on your team yet">
          <TeamPerformanceTable
            columns={[{ key: 'leads', label: 'Leads' }, { key: 'visits', label: 'Site Visits' }]}
            rows={teamRows}
          />
        </Panel>
      )}
    </div>
  )
}
