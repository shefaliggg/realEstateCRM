import { useState } from 'react'
import { EditModal, EditPencilButton, SingleFileField, FileCollectionField, useFileCollection, useProjectSave, buildFormData } from './editShared'

const SINGLE_DOC_FIELDS = [
  ['reraCertificate', 'RERA Certificate'],
  ['brochure', 'Brochure (PDF)'],
  ['priceSheet', 'Price Sheet'],
  ['paymentPlan', 'Payment Plan'],
  ['occupancyCertificate', 'Occupancy Certificate (OC)'],
  ['completionCertificate', 'Completion Certificate (CC)'],
]

function EditDocumentsModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const documents = project.documents || {}
  const [singleFiles, setSingleFiles] = useState({})
  const legalCollection = useFileCollection(documents.legalDocuments || [])
  const approvalCollection = useFileCollection(documents.approvalDocuments || [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = buildFormData(
      {
        legalDocuments: JSON.stringify(legalCollection.kept),
        approvalDocuments: JSON.stringify(approvalCollection.kept),
      },
      {
        ...singleFiles,
        legalDocuments: legalCollection.added.map((item) => item.file),
        approvalDocuments: approvalCollection.added.map((item) => item.file),
      }
    )
    const ok = await save(fd, { multipart: true })
    if (ok) onClose()
  }

  return (
    <EditModal title="Documents" icon="📄" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SINGLE_DOC_FIELDS.map(([key, label]) => (
          <SingleFileField
            key={key}
            label={label}
            currentUrl={documents[key]}
            file={singleFiles[key]}
            onPick={(file) => setSingleFiles((f) => ({ ...f, [key]: file }))}
            accept="application/pdf,image/*"
            previewAs="file"
          />
        ))}
      </div>
      <FileCollectionField label="Legal Documents" collection={legalCollection} accept="application/pdf,image/*" hint="Up to 5 files" previewAs="file" />
      <FileCollectionField label="Approval Documents" collection={approvalCollection} accept="application/pdf,image/*" hint="Up to 5 files" previewAs="file" />
    </EditModal>
  )
}

export default function DocumentsTab({ id, project, onProjectChanged }) {
  const [editing, setEditing] = useState(false)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EditPencilButton onClick={() => setEditing(true)} label="Edit Documents" />
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No documents uploaded yet.
        </div>
      ) : (
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
      )}

      {editing && <EditDocumentsModal id={id} project={project} onClose={() => setEditing(false)} onSaved={onProjectChanged} />}
    </div>
  )
}
