import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers, saveCustomers, getBookings } from '../utils/postSalesStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

export default function PostSalesCustomersPage() {
  const [customers, setCustomers] = useState(getCustomers)
  const bookings = getBookings()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  const bookingCount = (id) => bookings.filter((b) => b.customerId === id).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    )
  }, [customers, search])

  const totalBookings = bookings.length
  const activeBookings = bookings.filter((b) => b.status === 'Active').length

  const addCustomer = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    const next = [
      { id: `cust-${Date.now()}`, ...form, createdAt: new Date().toISOString().slice(0, 10) },
      ...customers,
    ]
    setCustomers(next)
    saveCustomers(next)
    setShowAdd(false)
    setForm({ name: '', email: '', phone: '', address: '' })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage post-sale customer records.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-blue-600' },
          { label: 'Total Bookings', value: totalBookings, color: 'text-indigo-600' },
          { label: 'Active Bookings', value: activeBookings, color: 'text-green-600' },
          { label: 'Completed', value: bookings.filter((b) => b.status === 'Completed').length, color: 'text-gray-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input
          className={inputClass}
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Name', 'Email', 'Phone', 'Address', 'Bookings', 'Added', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No customers found.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{c.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {bookingCount(c.id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.createdAt}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/post-sales/bookings?customer=${c.id}`}
                      className="text-primary-600 hover:underline text-xs font-medium"
                    >
                      View Bookings
                    </Link>
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
            <h2 className="text-lg font-bold text-gray-900">Add Customer</h2>
            <form onSubmit={addCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                <input className={inputClass} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98000 00000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Address</label>
                <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
