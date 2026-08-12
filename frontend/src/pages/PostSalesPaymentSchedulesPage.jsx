import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { getSchedules, createSchedule, updateSchedule, getBookings } from '../api/postSalesApi'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700',
}

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function PostSalesPaymentSchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [bookings, setBookings] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const [bookingFilter, setBookingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ booking: '', label: '', dueDate: '', amount: '' })

  const projectById = useMemo(() => new Map(projects.map((p) => [p._id, p])), [projects])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [schedulesData, bookingsData, projectsRes] = await Promise.all([
        getSchedules(),
        getBookings(),
        api.get('/projects'),
      ])
      setSchedules(schedulesData)
      setBookings(bookingsData)
      setProjects(projectsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment schedules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  // The real getSchedules already returns effective status (Pending past its
  // due date comes back as Overdue) — see backend/controllers/paymentScheduleController.js.
  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      if (bookingFilter && (s.booking?._id || s.booking) !== bookingFilter) return false
      if (statusFilter !== 'All' && s.status !== statusFilter) return false
      return true
    })
  }, [schedules, bookingFilter, statusFilter])

  const totalAmount = filtered.reduce((a, s) => a + Number(s.amount || 0), 0)
  const paidAmount = filtered.filter((s) => s.status === 'Paid').reduce((a, s) => a + Number(s.amount || 0), 0)

  const bookingLabel = (b) => `${b.customer?.name || 'Unknown'} — ${b.unit?.block || ''} ${b.unit?.unitNo || ''}`.trim()

  const markPaid = async (id) => {
    setBusyId(id)
    setError('')
    try {
      await updateSchedule(id, { status: 'Paid' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone')
    } finally {
      setBusyId(null)
    }
  }

  const addSchedule = async (e) => {
    e.preventDefault()
    setError('')
    const booking = bookings.find((b) => b._id === form.booking)
    if (!booking || !form.label || !form.dueDate || !form.amount) {
      setError('Booking, label, due date and amount are required')
      return
    }
    setSaving(true)
    try {
      await createSchedule({
        booking: booking._id,
        project: booking.project?._id || booking.project,
        label: form.label,
        dueDate: form.dueDate,
        amount: Number(form.amount),
      })
      setShowAdd(false)
      setForm({ booking: '', label: '', dueDate: '', amount: '' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add milestone')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Manage payment milestones for each booking.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Milestone
        </button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Milestones', value: schedules.length, color: 'text-gray-800' },
          { label: 'Paid', value: schedules.filter((s) => s.status === 'Paid').length, color: 'text-green-600' },
          { label: 'Pending', value: schedules.filter((s) => s.status === 'Pending').length, color: 'text-yellow-600' },
          { label: 'Overdue', value: schedules.filter((s) => s.status === 'Overdue').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none flex-1 min-w-[180px]"
          value={bookingFilter}
          onChange={(e) => setBookingFilter(e.target.value)}
        >
          <option value="">All Bookings</option>
          {bookings.map((b) => (
            <option key={b._id} value={b._id}>{bookingLabel(b)}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {['All', 'Paid', 'Pending', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
        </select>
        {(bookingFilter || statusFilter !== 'All') && (
          <button onClick={() => { setBookingFilter(''); setStatusFilter('All') }} className="px-3 py-2 text-sm text-red-500 hover:text-red-700">Clear</button>
        )}
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
          <span>Showing: <strong className="text-gray-800">{fmt(totalAmount)}</strong></span>
          <span>Paid: <strong className="text-green-700">{fmt(paidAmount)}</strong></span>
          <span>Balance: <strong className="text-orange-600">{fmt(totalAmount - paidAmount)}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Customer', 'Project', 'Milestone', 'Due Date', 'Amount', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No milestones found.</td></tr>
              )}
              {!loading && filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.booking?.customer?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{projectById.get(s.project)?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.label}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{fmt(s.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status !== 'Paid' && (
                      <button
                        disabled={busyId === s._id}
                        onClick={() => markPaid(s._id)}
                        className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add Payment Milestone</h2>
            <form onSubmit={addSchedule} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Booking *</label>
                <select className={inputClass} required value={form.booking} onChange={(e) => setForm({ ...form, booking: e.target.value })}>
                  <option value="">Select booking…</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>{bookingLabel(b)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Milestone Label *</label>
                <input className={inputClass} required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. On Foundation (25%)" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Due Date *</label>
                <input type="date" className={inputClass} required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (₹) *</label>
                <input type="number" className={inputClass} required min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="950000" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
