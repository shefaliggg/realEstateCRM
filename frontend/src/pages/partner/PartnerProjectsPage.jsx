import { useEffect, useState } from 'react'
import { getPartnerProjects } from '../../api/partnerApi'

export default function PartnerProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartnerProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-500 mt-1">All projects available for referral.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400 text-sm">No projects available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {p.coverImage && <img src={p.coverImage} alt={p.name} className="w-full h-32 object-cover" />}
              <div className="p-4">
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.location?.city || '-'} · {p.type}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">{p.status}</span>
                {p.pricing?.priceStart && (
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    From ₹{(p.pricing.priceStart / 100000).toFixed(1)}L
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
