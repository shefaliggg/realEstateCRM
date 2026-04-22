import { useMemo, useState } from 'react'
import { createLeadList, getLeadLists } from '../utils/leadGenerationStore'

export default function LeadGenerationListsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const leadLists = useMemo(() => getLeadLists(), [refreshKey])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [activeListId, setActiveListId] = useState(leadLists[0]?.id ?? '')

  const activeList = leadLists.find((list) => list.id === activeListId) ?? leadLists[0]

  function addList() {
    if (!name.trim()) return
    const created = createLeadList({ name, description })
    setName('')
    setDescription('')
    setActiveListId(created.id)
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lead Lists</h1>
        <p className="text-sm text-gray-500 mt-1">Store leads under different lists for each campaign or segment.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Create New Lead List</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="List name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button type="button" onClick={addList} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
            Create List
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">All Lists</h2>
          <div className="space-y-2">
            {leadLists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setActiveListId(list.id)}
                className={`w-full text-left border rounded-lg px-3 py-2 transition ${activeList?.id === list.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <p className="text-sm font-medium text-gray-800">{list.name}</p>
                <p className="text-xs text-gray-500 mt-1">{list.leads.length} leads</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">{activeList?.name || 'Lead List'}</h2>
          <p className="text-xs text-gray-500 mb-3">{activeList?.description || 'No description'}</p>

          {activeList?.leads?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Phone</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Address</th>
                    <th className="px-3 py-2 text-left font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeList.leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-3 py-2 text-gray-800">{lead.name || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{lead.phone || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{lead.email || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{lead.address || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{lead.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-8">No leads in this list yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
