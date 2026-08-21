import { useMemo, useState } from 'react'
import { getDocuments, saveDocuments, getCustomers, getBookings } from '../utils/postSalesStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const DOC_TYPES = ['Aadhar', 'PAN', 'Agreement', 'NOC', 'Receipt', 'Other']

const TYPE_COLORS = {
  Agreement: 'bg-blue-50 text-blue-700',
  Aadhar: 'bg-yellow-50 text-yellow-700',
  PAN: 'bg-orange-50 text-orange-700',
  NOC: 'bg-green-50 text-green-700',
  Receipt: 'bg-indigo-50 text-indigo-700',
  Other: 'bg-gray-100 text-gray-600',
}

export default function PostSalesDocumentsPage() {
  const [documents, setDocuments] = useState(getDocuments)
  const customers = getCustomers()
  const bookings = getBookings()

  const [customerFilter, setCustomerFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ customerId: '', bookingId: '', type: 'Agreement', name: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return documents.filter((d) => {
      if (customerFilter && d.customerId !== customerFilter) return false
      if (typeFilter !== 'All' && d.type !== typeFilter) return false
      if (!q) return true
      return d.name.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q)
    })
  }, [documents, customerFilter, typeFilter, search])

  const customerBookings = form.customerId
    ? bookings.filter((b) => b.customerId === form.customerId)
    : []

  const addDocument = (e) => {
    e.preventDefault()
    const cust = customers.find((c) => c.id === form.customerId)
    if (!cust || !form.name) return
    const next = [
      {
        id: `doc-${Date.now()}`,
        customerId: cust.id,
        customerName: cust.name,
        bookingId: form.bookingId || null,
        type: form.type,
        name: form.name,
        uploadedAt: new Date().toISOString().slice(0, 10),
      },
      ...documents,
    ]
    setDocuments(next)
    saveDocuments(next)
    setShowAdd(false)
    setForm({ customerId: '', bookingId: '', type: 'Agreement', name: '' })
  }

  const deleteDoc = (id) => {
    if (!window.confirm('Remove this document?')) return
    const next = documents.filter((d) => d.id !== id)
    setDocuments(next)
    saveDocuments(next)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage KYC, agreements and booking documents.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: documents.length, color: 'text-gray-800' },
          { label: 'Agreements', value: documents.filter((d) => d.type === 'Agreement').length, color: 'text-blue-600' },
          { label: 'KYC Docs', value: documents.filter((d) => ['Aadhar','PAN'].includes(d.type)).length, color: 'text-yellow-600' },
          { label: 'Other', value: documents.filter((d) => !['Aadhar','PAN','Agreement'].includes(d.type)).length, color: 'text-gray-600' },
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
          placeholder="Search by document name or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
          <option value="">All Customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        {(customerFilter || typeFilter !== 'All' || search) && (
          <button onClick={() => { setCustomerFilter(''); setTypeFilter('All'); setSearch('') }} className="px-3 py-2 text-sm text-red-500 hover:text-red-700">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Customer', 'Document Name', 'Type', 'Linked Booking', 'Uploaded', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No documents found.</td></tr>
              )}
              {filtered.map((d) => {
                const bk = bookings.find((b) => b.id === d.bookingId)
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{d.customerName}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {d.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[d.type] || 'bg-gray-100 text-gray-600'}`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {bk ? `${bk.projectName} ${bk.unitNumber}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.uploadedAt}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteDoc(d.id)} className="text-xs text-red-500 hover:underline">Remove</button>
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
            <h2 className="text-lg font-bold text-gray-900">Add Document</h2>
            <form onSubmit={addDocument} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Customer *</label>
                <select className={inputClass} required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value, bookingId: '' })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {customerBookings.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Linked Booking (optional)</label>
                  <select className={inputClass} value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })}>
                    <option value="">Not linked to a booking</option>
                    {customerBookings.map((b) => <option key={b.id} value={b.id}>{b.projectName} — {b.unitNumber}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Document Type *</label>
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Document Name *</label>
                <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sale Agreement - Tower A.pdf" />
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
