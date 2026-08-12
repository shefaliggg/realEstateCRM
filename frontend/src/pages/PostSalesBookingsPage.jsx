import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { getBookings, createBooking, updateBooking, getCustomers } from '../api/postSalesApi'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
}

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function PostSalesBookingsPage() {
  const [searchParams] = useSearchParams()
  const preCustomer = searchParams.get('customer') || ''

  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [projects, setProjects] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [customerFilter, setCustomerFilter] = useState(preCustomer)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    customer: '', project: '', unit: '',
    bookingDate: new Date().toISOString().slice(0, 10),
    totalAmount: '',
  })

  const projectById = useMemo(() => new Map(projects.map((p) => [p._id, p])), [projects])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [bookingsData, customersData, projectsRes] = await Promise.all([
        getBookings(),
        getCustomers(),
        api.get('/projects'),
      ])
      setBookings(bookingsData)
      setCustomers(customersData)
      setProjects(projectsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!form.project) {
      setUnits([])
      return
    }
    api.get(`/projects/${form.project}/units?status=Available`).then((res) => setUnits(res.data || []))
  }, [form.project])

  const projectName = (booking) => booking.unit?.project?.name || projectById.get(booking.project)?.name || '-'
  const unitLabel = (booking) => (booking.unit ? `${booking.unit.block || ''} ${booking.unit.unitNo || ''}`.trim() : '-')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false
      if (customerFilter && (b.customer?._id || b.customer) !== customerFilter) return false
      if (!q) return true
      return (
        (b.customer?.name || '').toLowerCase().includes(q) ||
        projectName(b).toLowerCase().includes(q) ||
        unitLabel(b).toLowerCase().includes(q)
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, search, statusFilter, customerFilter, projectById])

  const totalValue = bookings.reduce((a, b) => a + Number(b.totalAmount || 0), 0)
  const collectedValue = bookings.reduce((a, b) => a + Number(b.paidAmount || 0), 0)

  const addBooking = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.customer || !form.project || !form.unit || !form.totalAmount) {
      setError('Customer, project, unit and total amount are required')
      return
    }
    setSaving(true)
    try {
      await createBooking({
        customer: form.customer,
        project: form.project,
        unit: form.unit,
        bookingDate: form.bookingDate,
        totalAmount: Number(form.totalAmount),
      })
      setShowAdd(false)
      setForm({ customer: '', project: '', unit: '', bookingDate: new Date().toISOString().slice(0, 10), totalAmount: '' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (id, status) => {
    setBusyId(id)
    setError('')
    try {
      await updateBooking(id, { status })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Track unit bookings and payment progress.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Booking
        </button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-gray-800' },
          { label: 'Active', value: bookings.filter((b) => b.status === 'Active').length, color: 'text-green-600' },
          { label: 'Total Value', value: fmt(totalValue), color: 'text-indigo-600' },
          { label: 'Collected', value: fmt(collectedValue), color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 flex-1 min-w-[180px]"
          placeholder="Search by customer, project or unit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {['All', 'Active', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
          <option value="">All Customers</option>
          {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {(statusFilter !== 'All' || customerFilter || search) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('All'); setCustomerFilter('') }}
            className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Customer', 'Project', 'Unit', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No bookings found.</td></tr>
              )}
              {!loading && filtered.map((b) => {
                const balance = Number(b.totalAmount || 0) - Number(b.paidAmount || 0)
                return (
                  <tr key={b._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{projectName(b)}</td>
                    <td className="px-4 py-3 text-gray-700">{unitLabel(b)}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{fmt(b.totalAmount)}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{fmt(b.paidAmount)}</td>
                    <td className="px-4 py-3 text-orange-600 font-medium">{fmt(balance)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'Active' && (
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === b._id}
                            onClick={() => changeStatus(b._id, 'Completed')}
                            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            disabled={busyId === b._id}
                            onClick={() => changeStatus(b._id, 'Cancelled')}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">New Booking</h2>
            <form onSubmit={addBooking} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Customer *</label>
                <select className={inputClass} required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Project *</label>
                <select className={inputClass} required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, unit: '' })}>
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit *</label>
                <select className={inputClass} required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} disabled={!form.project}>
                  <option value="">Select available unit…</option>
                  {units.map((u) => <option key={u._id} value={u._id}>{u.block} {u.unitNo} — {u.bhkType}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Booking Date</label>
                <input type="date" className={inputClass} value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Total Amount (₹) *</label>
                <input type="number" className={inputClass} required min={0} value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="9500000" />
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
