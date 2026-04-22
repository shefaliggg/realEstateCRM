import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBookings, saveBookings, getCustomers } from '../utils/postSalesStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
}

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function PostSalesBookingsPage() {
  const [searchParams] = useSearchParams()
  const preCustomer = searchParams.get('customer') || ''

  const [bookings, setBookings] = useState(getBookings)
  const customers = getCustomers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [customerFilter, setCustomerFilter] = useState(preCustomer)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    customerId: '', projectName: '', unitNumber: '',
    bookingDate: new Date().toISOString().slice(0, 10),
    totalAmount: '', status: 'Active',
  })

  const uniqueProjects = [...new Set(bookings.map((b) => b.projectName))].sort()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false
      if (customerFilter && b.customerId !== customerFilter) return false
      if (!q) return true
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.projectName.toLowerCase().includes(q) ||
        b.unitNumber.toLowerCase().includes(q)
      )
    })
  }, [bookings, search, statusFilter, customerFilter])

  const totalValue = bookings.reduce((a, b) => a + Number(b.totalAmount), 0)
  const collectedValue = bookings.reduce((a, b) => a + Number(b.paidAmount), 0)

  const addBooking = (e) => {
    e.preventDefault()
    const cust = customers.find((c) => c.id === form.customerId)
    if (!cust || !form.projectName || !form.unitNumber || !form.totalAmount) return
    const next = [
      {
        id: `bk-${Date.now()}`,
        customerId: cust.id,
        customerName: cust.name,
        projectName: form.projectName,
        unitNumber: form.unitNumber,
        bookingDate: form.bookingDate,
        totalAmount: Number(form.totalAmount),
        paidAmount: 0,
        status: form.status,
      },
      ...bookings,
    ]
    setBookings(next)
    saveBookings(next)
    setShowAdd(false)
    setForm({ customerId: '', projectName: '', unitNumber: '', bookingDate: new Date().toISOString().slice(0, 10), totalAmount: '', status: 'Active' })
  }

  const changeStatus = (id, status) => {
    const next = bookings.map((b) => (b.id === id ? { ...b, status } : b))
    setBookings(next)
    saveBookings(next)
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
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No bookings found.</td></tr>
              )}
              {filtered.map((b) => {
                const balance = Number(b.totalAmount) - Number(b.paidAmount)
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.customerName}</td>
                    <td className="px-4 py-3 text-gray-700">{b.projectName}</td>
                    <td className="px-4 py-3 text-gray-700">{b.unitNumber}</td>
                    <td className="px-4 py-3 text-gray-500">{b.bookingDate}</td>
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
                            onClick={() => changeStatus(b.id, 'Completed')}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => changeStatus(b.id, 'Cancelled')}
                            className="text-xs text-red-500 hover:underline"
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
                <select className={inputClass} required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Project Name *</label>
                <input className={inputClass} required value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. VMR Azure" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit Number *</label>
                <input className={inputClass} required value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })} placeholder="e.g. A-401" />
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
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
