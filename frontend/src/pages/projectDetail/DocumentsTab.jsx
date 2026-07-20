export default function DocumentsTab({ project }) {
  const documents = project.documents || {}
  const groups = [
    { title: 'RERA', entries: [['RERA Certificate', documents.reraCertificate]] },
    { title: 'Sales Collateral', entries: [['Brochure', documents.brochure], ['Price Sheet', documents.priceSheet], ['Payment Plan', documents.paymentPlan]] },
    { title: 'Approvals', entries: [
      ['Occupancy Certificate (OC)', documents.occupancyCertificate],
      ['Completion Certificate (CC)', documents.completionCertificate],
      ...(documents.approvalDocuments || []).map((url, i) => [`Approval Letter ${i + 1}`, url]),
    ] },
    { title: 'Legal', entries: (documents.legalDocuments || []).map((url, i) => [`Legal Document ${i + 1}`, url]) },
  ]

  const hasAny = groups.some((g) => g.entries.some(([, url]) => url))

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        No documents uploaded yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {groups.map((group) => {
        const entries = group.entries.filter(([, url]) => url)
        if (entries.length === 0) return null
        return (
          <div key={group.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">{group.title}</h3>
            <div className="flex flex-wrap gap-2">
              {entries.map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  📎 {label}
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
