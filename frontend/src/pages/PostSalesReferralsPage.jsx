import { useMemo, useState } from 'react'
import { getReferrals, saveReferrals, getCustomers } from '../utils/postSalesStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Converted: 'bg-green-100 text-green-700',
}

const STATUSES = ['Pending', 'Contacted', 'Converted']

export default function PostSalesReferralsPage() {
  const [referrals, setReferrals] = useState(getReferrals)
  const customers = getCustomers()

  const [statusFilter, setStatusFilter] = useState('All')
  const [referrerFilter, setReferrerFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ referrerId: '', referredName: '', referredPhone: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return referrals.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      if (referrerFilter && r.referrerId !== referrerFilter) return false
      if (!q) return true
      return (
        r.referredName.toLowerCase().includes(q) ||
        r.referrerName.toLowerCase().includes(q) ||
        r.referredPhone.includes(q)
      )
    })
  }, [referrals, statusFilter, referrerFilter, search])

  const addReferral = (e) => {
    e.preventDefault()
    const referrer = customers.find((c) => c.id === form.referrerId)
    if (!referrer || !form.referredName || !form.referredPhone) return
    const next = [
      {
        id: `ref-${Date.now()}`,
        referrerId: referrer.id,
        referrerName: referrer.name,
        referredName: form.referredName,
        referredPhone: form.referredPhone,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending',
      },
      ...referrals,
    ]
    setReferrals(next)
    saveReferrals(next)
    setShowAdd(false)
    setForm({ referrerId: '', referredName: '', referredPhone: '' })
  }

  const updateStatus = (id, status) => {
    const next = referrals.map((r) => (r.id === id ? { ...r, status } : r))
    setReferrals(next)
    saveReferrals(next)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
          <p className="text-sm text-gray-500 mt-1">Track referrals made by existing customers.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: referrals.length, color: 'text-gray-800' },
          { label: 'Converted', value: referrals.filter((r) => r.status === 'Converted').length, color: 'text-green-600' },
          { label: 'Contacted', value: referrals.filter((r) => r.status === 'Contacted').length, color: 'text-blue-600' },
          { label: 'Pending', value: referrals.filter((r) => r.status === 'Pending').length, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 flex-1 min-w-[180px]"
          placeholder="Search by referred name, phone or referrer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)}>
          <option value="">All Referrers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(statusFilter !== 'All' || referrerFilter || search) && (
          <button onClick={() => { setStatusFilter('All'); setReferrerFilter(''); setSearch('') }} className="px-3 py-2 text-sm text-red-500 hover:text-red-700">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{filtered.length} referral{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Referred By', 'Referred Person', 'Phone', 'Date', 'Status', 'Update Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No referrals found.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.referrerName}</td>
                  <td className="px-4 py-3 text-gray-700">{r.referredName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.referredPhone}</td>
                  <td className="px-4 py-3 text-gray-500">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
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
            <h2 className="text-lg font-bold text-gray-900">Add Referral</h2>
            <form onSubmit={addReferral} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Referred By (Customer) *</label>
                <select className={inputClass} required value={form.referrerId} onChange={(e) => setForm({ ...form, referrerId: e.target.value })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Referred Person Name *</label>
                <input className={inputClass} required value={form.referredName} onChange={(e) => setForm({ ...form, referredName: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                <input className={inputClass} required value={form.referredPhone} onChange={(e) => setForm({ ...form, referredPhone: e.target.value })} placeholder="+91 98000 00000" />
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
