import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPartners, savePartners } from '../utils/channelPartnerStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

export default function ChannelPartnersPage() {
  const [partners, setPartners] = useState(getPartners())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    commissionRate: 1,
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return partners.filter((p) => {
      if (status === 'Active' && !p.active) return false
      if (status === 'Inactive' && p.active) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q)
        || p.contactPerson.toLowerCase().includes(q)
        || p.phone.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || p.city.toLowerCase().includes(q)
      )
    })
  }, [partners, search, status])

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.active).length,
    inactive: partners.filter((p) => !p.active).length,
    avgCommission: partners.length
      ? (partners.reduce((a, p) => a + Number(p.commissionRate || 0), 0) / partners.length).toFixed(2)
      : '0.00',
  }

  const addPartner = (e) => {
    e.preventDefault()
    if (!form.name || !form.contactPerson || !form.phone || !form.email) return
    const next = [
      {
        id: `cp-${Date.now()}`,
        ...form,
        commissionRate: Number(form.commissionRate || 0),
        active: true,
        joinedAt: new Date().toISOString().slice(0, 10),
      },
      ...partners,
    ]
    setPartners(next)
    savePartners(next)
    setShowAdd(false)
    setForm({ name: '', contactPerson: '', phone: '', email: '', city: '', commissionRate: 1 })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Channel Partners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage broker and partner network details.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Partner
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Active', val: stats.active, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Inactive', val: stats.inactive, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Avg Commission', val: `${stats.avgCommission}%`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold leading-tight">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partner, contact, city..."
          className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.contactPerson}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{p.phone}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.city || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.commissionRate}%</td>
                  <td className="px-4 py-3 text-gray-600">{p.joinedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/partners/${p.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No partners found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center px-4">
          <form onSubmit={addPartner} className="w-full max-w-lg bg-white rounded-xl shadow-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Channel Partner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person</label>
                <input className={inputClass} value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input className={inputClass} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Commission %</label>
                <input type="number" step="0.01" min="0" className={inputClass} value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm">Save Partner</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
