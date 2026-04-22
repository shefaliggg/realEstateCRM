import { useMemo, useState } from 'react'
import { addLeadsToList, getLeadLists, parseGoogleMapsText } from '../utils/leadGenerationStore'

export default function LeadGenerationGoogleMapsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const leadLists = useMemo(() => getLeadLists(), [refreshKey])
  const [listId, setListId] = useState(leadLists[0]?.id ?? '')
  const [rawText, setRawText] = useState('')
  const [preview, setPreview] = useState([])
  const [notice, setNotice] = useState('')

  function previewLeads() {
    const parsed = parseGoogleMapsText(rawText)
    setPreview(parsed)
    setNotice(parsed.length ? `${parsed.length} leads parsed.` : 'No leads parsed. Check input format.')
  }

  function saveToList() {
    if (!listId) {
      setNotice('Please select a lead list.')
      return
    }
    if (!preview.length) {
      setNotice('No parsed leads to save.')
      return
    }
    const updated = addLeadsToList(listId, preview)
    if (!updated) {
      setNotice('Failed to save leads to list.')
      return
    }
    setNotice(`${preview.length} leads saved to ${updated.name}.`)
    setRawText('')
    setPreview([])
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Maps Lead Capture</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste copied Google Maps business blocks and extract lead name, phone, email, and address.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        Use this only with compliant data collection practices and applicable platform terms.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <select value={listId} onChange={(e) => setListId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {leadLists.map((list) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={previewLeads} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">Parse Leads</button>
            <button type="button" onClick={saveToList} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm">Save to List</button>
          </div>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[170px]"
          placeholder={'Paste Google Maps copied blocks here. Separate businesses with an empty line.'}
        />

        {notice && <p className="text-sm text-gray-600">{notice}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Preview</h2>
        {preview.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-3 py-2 text-gray-800">{lead.name || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.email || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{lead.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No preview leads yet.</p>
        )}
      </div>
    </div>
  )
}
