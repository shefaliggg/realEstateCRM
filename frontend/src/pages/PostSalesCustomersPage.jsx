import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getCustomers, createCustomer, getBookings, inviteCustomer } from '../api/postSalesApi'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

export default function PostSalesCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [bookings, setBookings] = useState([])
  const [projects, setProjects] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [invitingId, setInvitingId] = useState(null)
  const [inviteMessage, setInviteMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', project: '', unit: '' })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [customersData, bookingsData, projectsRes] = await Promise.all([
        getCustomers(),
        getBookings(),
        api.get('/projects'),
      ])
      setCustomers(customersData)
      setBookings(bookingsData)
      setProjects(projectsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers')
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
    api.get(`/projects/${form.project}/units`).then((res) => setUnits(res.data || []))
  }, [form.project])

  const bookingCount = (id) => bookings.filter((b) => (b.customer?._id || b.customer) === id).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    )
  }, [customers, search])

  const totalBookings = bookings.length
  const activeBookings = bookings.filter((b) => b.status === 'Active').length

  const addCustomer = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.project) {
      setError('Name, phone and project are required')
      return
    }
    setSaving(true)
    try {
      await createCustomer({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone,
        address: form.address || undefined,
        project: form.project,
        unit: form.unit || undefined,
      })
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', address: '', project: '', unit: '' })
      await refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer')
    } finally {
      setSaving(false)
    }
  }

  const onInvite = async (id) => {
    setInvitingId(id)
    setError('')
    setInviteMessage('')
    try {
      const result = await inviteCustomer(id)
      setInviteMessage(
        result.invite?.tempPassword
          ? `Invite sent. Dev temp password for ${result.invite.username}: ${result.invite.tempPassword}`
          : 'Portal invite sent.'
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send portal invite')
    } finally {
      setInvitingId(null)
    }
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

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {inviteMessage && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{inviteMessage}</div>}

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
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No customers found.</td></tr>
              )}
              {!loading && filtered.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{c.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {bookingCount(c._id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/post-sales/bookings?customer=${c._id}`}
                        className="text-primary-600 hover:underline text-xs font-medium"
                      >
                        View Bookings
                      </Link>
                      <button
                        type="button"
                        disabled={!c.email || invitingId === c._id}
                        title={!c.email ? 'Add an email address first' : 'Invite to Customer Portal'}
                        onClick={() => onInvite(c._id)}
                        className="text-xs font-medium text-indigo-600 hover:underline disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {invitingId === c._id ? 'Inviting…' : 'Invite to Portal'}
                      </button>
                    </div>
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
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Project *</label>
                <select className={inputClass} required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, unit: '' })}>
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                <select className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} disabled={!form.project}>
                  <option value="">Select unit… (optional)</option>
                  {units.map((u) => <option key={u._id} value={u._id}>{u.block} {u.unitNo} — {u.bhkType}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50">
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
