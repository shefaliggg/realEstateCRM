import { useEffect, useState } from 'react'
import { getCustomerPaymentSchedule } from '../../api/customerPortalApi'

const STATUS_COLORS = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700',
}

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function CustomerPaymentSchedulePage() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerPaymentSchedule().then(setSchedule).finally(() => setLoading(false))
  }, [])

  const totalAmount = schedule.reduce((a, s) => a + Number(s.amount || 0), 0)
  const paidAmount = schedule.filter((s) => s.status === 'Paid').reduce((a, s) => a + Number(s.amount || 0), 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Your payment milestones and due dates.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', val: fmt(totalAmount), color: 'text-gray-800' },
          { label: 'Paid', val: fmt(paidAmount), color: 'text-green-600' },
          { label: 'Balance', val: fmt(totalAmount - paidAmount), color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Milestone', 'Due Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!loading && schedule.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No payment milestones yet.</td></tr>
              )}
              {!loading && schedule.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-700">{s.label}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{fmt(s.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
