import { useEffect, useState } from 'react'
import { getCustomerPayments } from '../../api/customerPortalApi'

const MODE_COLORS = {
  Online: 'bg-blue-50 text-blue-700',
  NEFT: 'bg-indigo-50 text-indigo-700',
  Cheque: 'bg-purple-50 text-purple-700',
  Cash: 'bg-green-50 text-green-700',
}

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function CustomerReceiptsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerPayments().then(setPayments).finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.reduce((a, p) => a + Number(p.amount || 0), 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
        <p className="text-sm text-gray-500 mt-1">Your payment history.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 w-fit">
        <p className="text-xs text-gray-500">Total Paid</p>
        <p className="text-xl font-bold text-green-600 mt-1">{fmt(totalPaid)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Date', 'Amount', 'Mode', 'Reference', 'Note'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!loading && payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No payments recorded yet.</td></tr>
              )}
              {!loading && payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
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
    </div>
  )
}
