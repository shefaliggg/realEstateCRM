import { useEffect, useState } from 'react'
import { getCustomerDocuments } from '../../api/customerPortalApi'

const DOC_LABELS = {
  brochure: 'Brochure',
  priceSheet: 'Price Sheet',
  paymentPlan: 'Payment Plan',
  reraCertificate: 'RERA Certificate',
}

export default function CustomerDocumentsPage() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerDocuments().then(setProject).finally(() => setLoading(false))
  }, [])

  const docs = project ? Object.entries(DOC_LABELS).filter(([key]) => project[key]) : []

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Brochure, price sheet, payment plan and RERA certificate.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : !project ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">No documents available yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="font-semibold text-gray-900 mb-3">{project.name}</p>
          {docs.length === 0 ? (
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {docs.map(([key, label]) => (
                <a
                  key={key}
                  href={project[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
