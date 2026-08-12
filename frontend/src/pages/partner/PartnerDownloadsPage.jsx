import { useEffect, useState } from 'react'
import { getPartnerDownloads } from '../../api/partnerApi'

const DOC_LABELS = {
  brochure: 'Brochure',
  priceSheet: 'Price Sheet',
  paymentPlan: 'Payment Plan',
  reraCertificate: 'RERA Certificate',
}

export default function PartnerDownloadsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartnerDownloads().then(setProjects).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
        <p className="text-sm text-gray-500 mt-1">Brochures, price sheets and payment plans by project.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400 text-sm">No documents available yet.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const docs = Object.entries(DOC_LABELS).filter(([key]) => p[key])
            return (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="font-semibold text-gray-900 mb-2">{p.name}</p>
                {docs.length === 0 ? (
                  <p className="text-xs text-gray-400">No documents uploaded yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {docs.map(([key, label]) => (
                      <a
                        key={key}
                        href={p[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
