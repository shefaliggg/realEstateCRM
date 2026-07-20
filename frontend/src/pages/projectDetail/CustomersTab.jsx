import { useState } from 'react'
import api from '../../api/axios'
import { formatPrice } from './shared'

const AGREEMENT_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-600',
  Draft: 'bg-yellow-100 text-yellow-700',
  Signed: 'bg-green-100 text-green-700',
}

export default function CustomersTab({ id, customers, units, onCustomersChanged }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', unit: '', agreementStatus: 'Not Started' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      setError('Name and phone are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/customers', { ...form, project: id, unit: form.unit || undefined })
      setForm({ name: '', phone: '', email: '', address: '', unit: '', agreementStatus: 'Not Started' })
      setOpen(false)
      onCustomersChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          {open ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-sm">{error}</div>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <input placeholder="Mobile" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              <option value="">Link a unit (optional)</option>
              {units.map((u) => <option key={u._id} value={u._id}>{u.block}-{u.unitNo} ({u.bhkType})</option>)}
            </select>
            <select value={form.agreementStatus} onChange={(e) => setForm((f) => ({ ...f, agreementStatus: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2">
              {Object.keys(AGREEMENT_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Customer'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Mobile</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Agreement</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-2 py-2.5 text-gray-600">{c.unit ? `${c.unit.block}-${c.unit.unitNo}` : '—'}</td>
                  <td className="px-2 py-2.5 text-gray-600">{c.phone}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AGREEMENT_COLORS[c.agreementStatus] || 'bg-gray-100'}`}>{c.agreementStatus}</span>
                  </td>
                  <td className="px-2 py-2.5 text-gray-600">{c.balance ? formatPrice(c.balance) : '—'}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No customers added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
