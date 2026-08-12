import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { getChannelPartners } from '../api/channelPartnerApi'

const statusStyle = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
}

export default function PartnerPayoutsPage() {
  const [partners, setPartners] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('All')
  const [partnerId, setPartnerId] = useState('All')

  useEffect(() => {
    Promise.all([api.get('/deals?hasPartner=true'), getChannelPartners()])
      .then(([dealsRes, partnersRes]) => {
        setDeals(dealsRes.data || [])
        setPartners(partnersRes || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    return deals
      .map((d) => ({
        ...d,
        partnerName: partners.find((x) => x._id === d.channelPartner)?.name || 'Unknown Partner',
      }))
      .filter((d) => (status === 'All' ? true : d.commissionStatus === status))
      .filter((d) => (partnerId === 'All' ? true : d.channelPartner === partnerId))
      .sort((a, b) => new Date(a.commissionDueDate || 0) - new Date(b.commissionDueDate || 0))
  }, [deals, partners, status, partnerId])

  const stats = {
    total: deals.reduce((a, d) => a + Number(d.commission || 0), 0),
    pending: deals.filter((d) => d.commissionStatus === 'Pending').reduce((a, d) => a + Number(d.commission || 0), 0),
    processing: deals.filter((d) => d.commissionStatus === 'Processing').reduce((a, d) => a + Number(d.commission || 0), 0),
    paid: deals.filter((d) => d.commissionStatus === 'Paid').reduce((a, d) => a + Number(d.commission || 0), 0),
  }

  const markAsPaid = async (id) => {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await api.put(`/deals/${id}`, { commissionStatus: 'Paid', commissionPaidDate: today })
    setDeals((prev) => prev.map((d) => (d._id === id ? { ...d, ...data } : d)))
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
          {partners.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
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
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payouts found</td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{d.partnerName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.dealName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.unit?.project?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">INR {Number(d.commission || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{d.commissionDueDate ? new Date(d.commissionDueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[d.commissionStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {d.commissionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.commissionStatus !== 'Paid' ? (
                        <button
                          onClick={() => markAsPaid(d._id)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Paid on {d.commissionPaidDate ? new Date(d.commissionPaidDate).toLocaleDateString() : '-'}</span>
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
