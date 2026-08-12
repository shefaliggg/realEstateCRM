import { useEffect, useState } from 'react'
import { getCustomerBookings } from '../../api/customerPortalApi'

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

export default function MyPropertyPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerBookings().then(setBookings).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-gray-400">Loading…</div>

  if (bookings.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">No property found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Property</h1>

      {bookings.map((b) => (
        <div key={b._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {b.project?.coverImage && (
            <img src={b.project.coverImage} alt={b.project.name} className="w-full h-48 object-cover" />
          )}
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{b.project?.name}</h2>
              <p className="text-sm text-gray-500">{b.project?.location?.address || b.project?.location?.city || ''}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Unit</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{b.unit?.block} {b.unit?.unitNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Configuration</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{b.unit?.bhkType || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Carpet Area</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{b.unit?.carpetArea ? `${b.unit.carpetArea} sq.ft` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Booking Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{new Date(b.bookingDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{fmt(b.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{b.status}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
