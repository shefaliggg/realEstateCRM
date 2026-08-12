import { useEffect, useState } from 'react'
import { getPartnerCommissions } from '../../api/partnerApi'

const statusStyle = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
}

function inr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`
}

export default function PartnerCommissionsPage() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartnerCommissions().then(setDeals).finally(() => setLoading(false))
  }, [])

  const totals = {
    total: deals.reduce((a, d) => a + Number(d.commission || 0), 0),
    pending: deals.filter((d) => d.commissionStatus !== 'Paid').reduce((a, d) => a + Number(d.commission || 0), 0),
    paid: deals.filter((d) => d.commissionStatus === 'Paid').reduce((a, d) => a + Number(d.commission || 0), 0),
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Commissions</h1>
        <p className="text-sm text-gray-500 mt-1">Commission earned from deals linked to your referrals.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', val: totals.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Pending', val: totals.pending, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Paid', val: totals.paid, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold leading-tight">{inr(s.val)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No commissions yet</td></tr>
              ) : (
                deals.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{d.dealName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.unit?.project?.name} {d.unit?.block ? `· ${d.unit.block}-${d.unit.unitNo}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inr(d.commission)}</td>
                    <td className="px-4 py-3 text-gray-600">{d.commissionDueDate ? new Date(d.commissionDueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[d.commissionStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {d.commissionStatus}
                      </span>
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
