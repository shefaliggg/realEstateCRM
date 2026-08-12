import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatTile from '../../components/dashboard/StatTile'
import Panel from '../../components/dashboard/Panel'
import TeamPerformanceTable from '../../components/dashboard/TeamPerformanceTable'

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

function withEffectiveStatus(schedule) {
  if (schedule.status === 'Pending' && schedule.dueDate && new Date(schedule.dueDate) < new Date()) {
    return { ...schedule, status: 'Overdue' }
  }
  return schedule
}

function isToday(date) {
  if (!date) return false
  return new Date(date).toDateString() === new Date().toDateString()
}

// Shared by crm_manager and crm_executive — `scope` adds the team roll-up for managers.
export default function CrmDashboard({ scope = 'executive' }) {
  const [customers, setCustomers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/customers'),
      api.get('/schedules'),
      api.get('/bookings'),
    ])
      .then(([cRes, sRes, bRes]) => {
        setCustomers(cRes.data)
        setSchedules(sRes.data.map(withEffectiveStatus))
        setBookings(bRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pendingSchedules = schedules.filter((s) => s.status === 'Pending')
  const overdueSchedules = schedules.filter((s) => s.status === 'Overdue')
  const agreementsPending = customers.filter((c) => c.agreementStatus !== 'Signed')
  const todaysFollowUps = schedules.filter((s) => s.status !== 'Paid' && isToday(s.dueDate))

  const teamRows = (() => {
    const map = new Map()
    bookings.forEach((b) => {
      if (!b.bookedBy?._id) return
      if (!map.has(b.bookedBy._id)) {
        map.set(b.bookedBy._id, { id: b.bookedBy._id, name: b.bookedBy.name, bookings: 0, collected: fmt(0), _collected: 0 })
      }
      const row = map.get(b.bookedBy._id)
      row.bookings += 1
      row._collected += Number(b.paidAmount || 0)
      row.collected = fmt(row._collected)
    })
    return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings)
  })()

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatTile icon="👥" label="Active Customers" val={customers.length} color="bg-blue-50 text-blue-600" loading={loading} link="/post-sales/customers" />
        <StatTile icon="⏳" label="Pending Payments" val={pendingSchedules.length} color="bg-orange-50 text-orange-600" loading={loading} link="/post-sales/payment-schedules" />
        <StatTile icon="🔴" label="Overdue Payments" val={overdueSchedules.length} color="bg-red-50 text-red-600" loading={loading} link="/post-sales/payment-schedules" />
        <StatTile icon="📝" label="Agreements Pending" val={agreementsPending.length} color="bg-purple-50 text-purple-600" loading={loading} link="/post-sales/customers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {scope === 'manager' && (
            <Panel title="👥 Team Performance" loading={loading} empty={!teamRows.length} emptyText="No booking activity yet">
              <TeamPerformanceTable
                columns={[{ key: 'bookings', label: 'Bookings' }, { key: 'collected', label: 'Collected' }]}
                rows={teamRows}
              />
            </Panel>
          )}

          <Panel title="⏰ Today's Follow-ups" viewAllLink="/post-sales/payment-schedules" loading={loading} empty={!todaysFollowUps.length} emptyText="Nothing due today">
            <div className="divide-y divide-gray-50">
              {todaysFollowUps.map((s) => (
                <Link key={s._id} to="/post-sales/payment-schedules" className="flex items-center justify-between py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.booking?.customer?.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{fmt(s.amount)}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="📝 Pending Agreements" viewAllLink="/post-sales/customers" loading={loading} empty={!agreementsPending.length} emptyText="All agreements signed ✅">
            <div className="space-y-2">
              {agreementsPending.slice(0, 8).map((c) => (
                <div key={c._id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-900 truncate">{c.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{c.agreementStatus}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="🔴 Overdue Payments" viewAllLink="/post-sales/payment-schedules" loading={loading} empty={!overdueSchedules.length} emptyText="No overdue payments">
            <div className="space-y-2">
              {overdueSchedules.slice(0, 8).map((s) => (
                <div key={s._id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-900 truncate">{s.booking?.customer?.name || s.label}</span>
                  <span className="text-xs font-semibold text-red-600">{fmt(s.amount)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
