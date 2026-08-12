import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerBookings, getCustomerPaymentSchedule } from '../../api/customerPortalApi'

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCustomerBookings(), getCustomerPaymentSchedule()])
      .then(([b, s]) => {
        setBookings(b)
        setSchedule(s)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-gray-400">Loading…</div>

  const booking = bookings[0]
  const nextDue = schedule
    .filter((s) => s.status !== 'Paid')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]

  if (!booking) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">No property found</p>
          <p className="text-sm text-gray-400 mt-1">Your booking details will appear here once available.</p>
        </div>
      </div>
    )
  }

  const balance = Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0)
  const progress = booking.totalAmount ? Math.round((booking.paidAmount / booking.totalAmount) * 100) : 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Here's a snapshot of your property and payments.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-500">Your Property</p>
        <p className="text-lg font-bold text-gray-900 mt-1">{booking.project?.name}</p>
        <p className="text-sm text-gray-600">
          {booking.unit?.block} {booking.unit?.unitNo} — {booking.unit?.bhkType}
        </p>
        <Link to="/customer-portal/property" className="text-primary-600 hover:underline text-xs font-medium mt-2 inline-block">
          View property details →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', val: fmt(booking.totalAmount), color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Paid', val: fmt(booking.paidAmount), color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Balance', val: fmt(balance), color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Progress', val: `${progress}%`, color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold leading-tight">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-500">Next Payment Due</p>
        {nextDue ? (
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{nextDue.label}</p>
              <p className="text-xs text-gray-500">{new Date(nextDue.dueDate).toLocaleDateString()}</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{fmt(nextDue.amount)}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">No pending milestones — you're all caught up.</p>
        )}
        <Link to="/customer-portal/payment-schedule" className="text-primary-600 hover:underline text-xs font-medium mt-3 inline-block">
          View full payment schedule →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/customer-portal/documents"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition flex items-center gap-3"
        >
          <span className="text-2xl">📄</span>
          <span className="font-semibold text-gray-900">Documents</span>
        </Link>
        <Link
          to="/customer-portal/construction-updates"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-sm transition flex items-center gap-3"
        >
          <span className="text-2xl">🏗️</span>
          <span className="font-semibold text-gray-900">Construction Progress</span>
        </Link>
      </div>
    </div>
  )
}
