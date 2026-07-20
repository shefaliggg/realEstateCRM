import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate, formatPrice } from './shared'

const STATUS_COLORS = {
  Active: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-500',
}

export default function BookingsTab({ id, bookings, customers, units, onBookingsChanged, onUnitsChanged }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customer: '', unit: '', totalAmount: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const availableUnits = units.filter((u) => u.status === 'Available')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.customer || !form.unit || !form.totalAmount) {
      setError('Customer, unit and total amount are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/bookings', { project: id, customer: form.customer, unit: form.unit, totalAmount: Number(form.totalAmount) })
      setForm({ customer: '', unit: '', totalAmount: '' })
      setOpen(false)
      onBookingsChanged?.()
      onUnitsChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          {open ? 'Cancel' : '+ Add Booking'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-sm">{error}</div>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option value="">Select available unit</option>
              {availableUnits.map((u) => <option key={u._id} value={u._id}>{u.block}-{u.unitNo} ({u.bhkType})</option>)}
            </select>
            <input type="number" placeholder="Total amount (₹)" value={form.totalAmount} onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
          </div>
          {customers.length === 0 && <p className="text-xs text-gray-400">No customers yet — add one from the Customers tab first.</p>}
          <button type="submit" disabled={saving} className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{b.customer?.name || '—'}</td>
                  <td className="px-2 py-2.5">
                    {b.unit ? <Link to={`/units/${b.unit._id}`} className="text-gray-600 hover:text-primary-600">{b.unit.block}-{b.unit.unitNo}</Link> : '—'}
                  </td>
                  <td className="px-2 py-2.5 text-gray-600">{formatDate(b.bookingDate)}</td>
                  <td className="px-2 py-2.5 text-gray-600">{formatPrice(b.totalAmount)}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No bookings recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
