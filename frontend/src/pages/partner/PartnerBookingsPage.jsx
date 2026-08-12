import { useEffect, useState } from 'react'
import { getPartnerBookings } from '../../api/partnerApi'

function inr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`
}

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartnerBookings().then(setBookings).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Bookings linked to your referrals.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No bookings yet</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{b.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.unit?.project?.name} {b.unit?.block ? `· ${b.unit.block}-${b.unit.unitNo}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inr(b.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{inr(b.paidAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{b.status}</span>
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
