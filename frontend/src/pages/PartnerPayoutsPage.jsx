import { useMemo, useState } from 'react'
import { getPartnerPayouts, getPartners, savePartnerPayouts } from '../utils/channelPartnerStore'

const statusStyle = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
}

export default function PartnerPayoutsPage() {
  const [partners] = useState(getPartners())
  const [payouts, setPayouts] = useState(getPartnerPayouts())
  const [status, setStatus] = useState('All')
  const [partnerId, setPartnerId] = useState('All')

  const rows = useMemo(() => {
    return payouts
      .map((p) => ({
        ...p,
        partnerName: partners.find((x) => x.id === p.partnerId)?.name || 'Unknown Partner',
      }))
      .filter((p) => (status === 'All' ? true : p.status === status))
      .filter((p) => (partnerId === 'All' ? true : p.partnerId === partnerId))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [payouts, partners, status, partnerId])

  const stats = {
    total: payouts.reduce((a, p) => a + p.amount, 0),
    pending: payouts.filter((p) => p.status === 'Pending').reduce((a, p) => a + p.amount, 0),
    processing: payouts.filter((p) => p.status === 'Processing').reduce((a, p) => a + p.amount, 0),
    paid: payouts.filter((p) => p.status === 'Paid').reduce((a, p) => a + p.amount, 0),
  }

  const markAsPaid = (id) => {
    const today = new Date().toISOString().slice(0, 10)
    const next = payouts.map((p) => (p.id === id ? { ...p, status: 'Paid', paidDate: today } : p))
    setPayouts(next)
    savePartnerPayouts(next)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Payouts</h1>
        <p className="text-sm text-gray-500 mt-1">Track commissions payable to channel partners.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Pending', val: stats.pending, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Processing', val: stats.processing, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Paid', val: stats.paid, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl sm:text-2xl font-bold leading-tight">INR {s.val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="All">All Partners</option>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Paid</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Deal Ref</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payouts found</td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{p.partnerName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.dealRef}</td>
                    <td className="px-4 py-3 text-gray-600">{p.projectName}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">INR {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{p.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status !== 'Paid' ? (
                        <button
                          onClick={() => markAsPaid(p.id)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Paid on {p.paidDate || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
