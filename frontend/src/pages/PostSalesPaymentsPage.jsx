import { useMemo, useState } from 'react'
import { getPayments, savePayments, getBookings, saveBookings, getCustomers } from '../utils/postSalesStore'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

const MODE_COLORS = {
  Online: 'bg-blue-50 text-blue-700',
  NEFT: 'bg-indigo-50 text-indigo-700',
  Cheque: 'bg-purple-50 text-purple-700',
  Cash: 'bg-green-50 text-green-700',
}

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function PostSalesPaymentsPage() {
  const [payments, setPayments] = useState(getPayments)
  const bookings = getBookings()
  const customers = getCustomers()

  const [customerFilter, setCustomerFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    bookingId: '', amount: '',
    date: new Date().toISOString().slice(0, 10),
    mode: 'Online', reference: '', note: '',
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (customerFilter) {
        const bk = bookings.find((b) => b.id === p.bookingId)
        if (!bk || bk.customerId !== customerFilter) return false
      }
      if (modeFilter !== 'All' && p.mode !== modeFilter) return false
      if (!q) return true
      return (
        p.customerName.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        (p.reference || '').toLowerCase().includes(q)
      )
    })
  }, [payments, customerFilter, modeFilter, search, bookings])

  const totalCollected = payments.reduce((a, p) => a + Number(p.amount), 0)
  const filteredTotal = filtered.reduce((a, p) => a + Number(p.amount), 0)

  const addPayment = (e) => {
    e.preventDefault()
    const bk = bookings.find((b) => b.id === form.bookingId)
    if (!bk || !form.amount) return
    const next = [
      {
        id: `pmt-${Date.now()}`,
        bookingId: bk.id,
        customerName: bk.customerName,
        projectName: bk.projectName,
        amount: Number(form.amount),
        date: form.date,
        mode: form.mode,
        reference: form.reference,
        note: form.note,
      },
      ...payments,
    ]
    // Also update paidAmount in bookings
    const booksNext = bookings.map((b) =>
      b.id === form.bookingId ? { ...b, paidAmount: Number(b.paidAmount) + Number(form.amount) } : b,
    )
    saveBookings(booksNext)

    setPayments(next)
    savePayments(next)
    setShowAdd(false)
    setForm({ bookingId: '', amount: '', date: new Date().toISOString().slice(0, 10), mode: 'Online', reference: '', note: '' })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Record and track all payment transactions.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: payments.length, color: 'text-gray-800' },
          { label: 'Total Collected', value: fmt(totalCollected), color: 'text-green-600' },
          { label: 'Online / NEFT', value: payments.filter((p) => ['Online','NEFT'].includes(p.mode)).length, color: 'text-blue-600' },
          { label: 'Cheque / Cash', value: payments.filter((p) => ['Cheque','Cash'].includes(p.mode)).length, color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 flex-1 min-w-[180px]"
          placeholder="Search customer, project or reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
          <option value="">All Customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
          {['All','Online','NEFT','Cheque','Cash'].map((m) => <option key={m}>{m}</option>)}
        </select>
        {(customerFilter || modeFilter !== 'All' || search) && (
          <button onClick={() => { setCustomerFilter(''); setModeFilter('All'); setSearch('') }} className="px-3 py-2 text-sm text-red-500 hover:text-red-700">Clear</button>
        )}
        <span className="ml-auto text-sm text-gray-500">Showing total: <strong className="text-gray-800">{fmt(filteredTotal)}</strong></span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Customer', 'Project', 'Date', 'Amount', 'Mode', 'Reference', 'Note'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No payments found.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.projectName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.date}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{fmt(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MODE_COLORS[p.mode] || 'bg-gray-100 text-gray-700'}`}>
                      {p.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.reference || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{p.note || '—'}</td>
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
            <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
            <form onSubmit={addPayment} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Booking *</label>
                <select className={inputClass} required value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })}>
                  <option value="">Select booking…</option>
                  {bookings.filter((b) => b.status === 'Active').map((b) => (
                    <option key={b.id} value={b.id}>{b.customerName} — {b.projectName} {b.unitNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (₹) *</label>
                <input type="number" className={inputClass} required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="950000" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
                <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Mode</label>
                <select className={inputClass} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  {['Online','NEFT','Cheque','Cash'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Reference No.</label>
                <input className={inputClass} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UTR / Cheque no." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Note</label>
                <input className={inputClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note" />
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
