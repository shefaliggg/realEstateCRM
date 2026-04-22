import { useMemo, useState } from 'react'
import { addLeadsToList, getLeadLists, parseCsvLeads } from '../utils/leadGenerationStore'

export default function LeadGenerationImportPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const leadLists = useMemo(() => getLeadLists(), [refreshKey])
  const [listId, setListId] = useState(leadLists[0]?.id ?? '')
  const [csvText, setCsvText] = useState('name,phone,email,address,company\n')
  const [preview, setPreview] = useState([])
  const [notice, setNotice] = useState('')

  function onFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCsvText(String(reader.result || ''))
    reader.readAsText(file)
  }

  function parseImport() {
    const parsed = parseCsvLeads(csvText)
    setPreview(parsed)
    setNotice(parsed.length ? `${parsed.length} leads parsed from import.` : 'No leads found in CSV content.')
  }

  function importToList() {
    if (!listId) {
      setNotice('Please select a lead list.')
      return
    }
    if (!preview.length) {
      setNotice('No parsed leads to import.')
      return
    }
    const updated = addLeadsToList(listId, preview)
    if (!updated) {
      setNotice('Failed to import leads.')
      return
    }
    setNotice(`${preview.length} leads imported to ${updated.name}.`)
    setPreview([])
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Import leads into a selected list using CSV text or file upload.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <select value={listId} onChange={(e) => setListId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {leadLists.map((list) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>

          <label className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
            Upload CSV
            <input type="file" accept=".csv,text/csv" onChange={onFileUpload} className="hidden" />
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={parseImport} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">Parse CSV</button>
            <button type="button" onClick={importToList} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm">Import</button>
          </div>
        </div>

        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[170px]"
          placeholder="name,phone,email,address,company"
        />

        {notice && <p className="text-sm text-gray-600">{notice}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Parsed Leads Preview</h2>
        {preview.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Address</th>
                  <th className="px-3 py-2 text-left font-medium">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-3 py-2 text-gray-800">{lead.name || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.email || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.address || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.company || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No parsed leads yet.</p>
        )}
      </div>
    </div>
  )
}
