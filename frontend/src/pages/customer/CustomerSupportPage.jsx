import { useEffect, useState } from 'react'
import { getSupportInfo } from '../../api/customerPortalApi'

export default function CustomerSupportPage() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupportInfo().then(setInfo).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-sm text-gray-500 mt-1">Get in touch with {info?.builderName || 'us'} for any questions.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{info?.contactEmail || 'Not available — contact your sales executive.'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{info?.contactPhone || 'Not available — contact your sales executive.'}</p>
          </div>
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Ticketed support isn't available yet — reach out directly using the details above.
          </p>
        </div>
      )}
    </div>
  )
}
