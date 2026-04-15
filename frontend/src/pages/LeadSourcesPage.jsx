import { useState } from 'react'

const MOCK_SOURCES = [
  { id: 1, name: 'Website', totalLeads: 124, lastMonth: 42, avgBudget: 6200000, active: true },
  { id: 2, name: 'Referral', totalLeads: 89, lastMonth: 28, avgBudget: 8500000, active: true },
  { id: 3, name: '99acres', totalLeads: 156, lastMonth: 51, avgBudget: 5800000, active: true },
  { id: 4, name: 'Facebook', totalLeads: 67, lastMonth: 12, avgBudget: 4200000, active: true },
  { id: 5, name: 'Google Ads', totalLeads: 203, lastMonth: 68, avgBudget: 7100000, active: true },
  { id: 6, name: 'Instagram', totalLeads: 45, lastMonth: 8, avgBudget: 3500000, active: false },
  { id: 7, name: 'LinkedIn', totalLeads: 21, lastMonth: 2, avgBudget: 12500000, active: false },
  { id: 8, name: 'Walk-in', totalLeads: 34, lastMonth: 5, avgBudget: 5600000, active: true },
]

export default function LeadSourcesPage() {
  const [sources, setSources] = useState(MOCK_SOURCES)
  const [editingId, setEditingId] = useState(null)
  const [showAddSource, setShowAddSource] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', active: true })

  function toggleActive(id) {
    setSources((s) => s.map((src) => (src.id === id ? { ...src, active: !src.active } : src)))
  }

  function addSource() {
    if (newSource.name.trim()) {
      setSources((s) => [
        ...s,
        {
          id: Math.max(...s.map((x) => x.id), 0) + 1,
          name: newSource.name,
          totalLeads: 0,
          lastMonth: 0,
          avgBudget: 0,
          active: newSource.active,
        },
      ])
      setNewSource({ name: '', active: true })
      setShowAddSource(false)
    }
  }

  const totalLeads = sources.reduce((a, s) => a + s.totalLeads, 0)
  const activeLeadsMonth = sources.reduce((a, s) => a + s.lastMonth, 0)
  const avgBudgetOverall = Math.round(
    sources.reduce((a, s) => a + s.avgBudget * s.totalLeads, 0) / (totalLeads || 1)
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Sources</h2>
        </div>
        <button
          onClick={() => setShowAddSource(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Source
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: totalLeads, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
          { label: 'This Month', value: activeLeadsMonth, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
          { label: 'Avg Budget', value: `INR ${(avgBudgetOverall / 1000000).toFixed(1)} Cr`, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
          { label: 'Active Sources', value: sources.filter((s) => s.active).length, color: 'bg-primary-50 border-primary-200 text-primary-700', dot: 'bg-primary-500' },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-lg font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add source modal */}
      {showAddSource && (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Source</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Source Name</label>
                <input
                  value={newSource.name}
                  onChange={(e) => setNewSource((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. YouTube"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newSource.active}
                  onChange={(e) => setNewSource((s) => ({ ...s, active: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-gray-600">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddSource(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addSource}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Source Name</th>
                <th className="px-5 py-3 text-right">Total Leads</th>
                <th className="px-5 py-3 text-right">Last Month</th>
                <th className="px-5 py-3 text-right">Avg Budget</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-medium text-gray-900">{src.name}</td>
                  <td className="px-5 py-4 text-right text-gray-900 font-semibold">{src.totalLeads}</td>
                  <td className="px-5 py-4 text-right text-gray-600">{src.lastMonth}</td>
                  <td className="px-5 py-4 text-right text-gray-600 font-medium">
                    INR {(src.avgBudget / 1000000).toFixed(1)} Cr
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(src.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                        src.active
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {src.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion chart info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900">Tip:</p>
            <p className="text-sm text-blue-700 mt-1">
              Track which channels bring the highest quality leads. Focus marketing efforts on sources with better conversion rates and higher average budgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
