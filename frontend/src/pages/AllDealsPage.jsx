import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const STAGE_STYLES = {
  'Lead Qualification': 'bg-blue-100 text-blue-700',
  'Needs Analysis': 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-yellow-100 text-yellow-700',
  'Negotiation': 'bg-orange-100 text-orange-700',
  'Contract Review': 'bg-pink-100 text-pink-700',
  'Won': 'bg-green-100 text-green-700',
  'Lost': 'bg-red-100 text-red-500',
}

const STAGES = ['All', 'Lead Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Won', 'Lost']

export default function AllDealsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') || ''
  const [projectName, setProjectName] = useState('')
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('All')

  useEffect(() => {
    setLoading(true)
    api.get(projectFilter ? `/deals?project=${projectFilter}` : '/deals')
      .then(r => setDeals(r.data))
      .catch(() => setError('Failed to load deals'))
      .finally(() => setLoading(false))
  }, [projectFilter])

  useEffect(() => {
    if (!projectFilter) { setProjectName(''); return }
    api.get(`/projects/${projectFilter}`).then(r => setProjectName(r.data?.name || '')).catch(() => {})
  }, [projectFilter])

  const clearProjectFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('project')
    setSearchParams(next)
  }

  const filtered = deals.filter(d => {
    if (filterStage !== 'All' && d.stage !== filterStage) return false
    if (search) {
      const q = search.toLowerCase()
      const unitStr = d.unit ? `block ${d.unit.block} ${d.unit.unitNo}` : ''
      if (!`${d.dealName} ${d.lead?.name || ''} ${unitStr}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const stats = {
    total: deals.length,
    won: deals.filter(d => d.stage === 'Won').length,
    active: deals.filter(d => !['Won', 'Lost'].includes(d.stage)).length,
    totalValue: deals.filter(d => d.stage !== 'Lost').reduce((s, d) => s + (d.value || 0), 0),
  }

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Deals</h1>
          </div>
          <Link to="/deals/add"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Deal
          </Link>
        </div>

        {projectFilter && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg px-4 py-2.5 mb-4 text-sm">
            <span>Filtered by project{projectName ? `: ${projectName}` : ''}</span>
            <button onClick={clearProjectFilter} className="ml-auto text-xs font-medium underline hover:text-primary-800">Clear filter</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', val: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
            { label: 'Active', val: stats.active, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-400' },
            { label: 'Won', val: stats.won, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
            { label: 'Pipeline Value', val: `₹${(stats.totalValue / 100000).toFixed(0)}L`, color: 'bg-primary-50 border-primary-200 text-primary-700', dot: 'bg-primary-500' },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.color}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <div>
                <p className="text-xs font-medium opacity-70">{s.label}</p>
                <p className="text-xl font-bold leading-tight">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
            {STAGES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>)}
          </select>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>}
        {loading && <div className="text-center py-16 text-gray-400">Loading deals...</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">No deals found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3">Deal</th>
                      <th className="px-5 py-3">Unit</th>
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3">Stage</th>
                      <th className="px-5 py-3">Value</th>
                      <th className="px-5 py-3">Close Date</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{d.dealName}</td>
                        <td className="px-5 py-4 text-gray-600">
                          {d.unit
                            ? `Block ${d.unit.block} – ${d.unit.unitNo} (F${d.unit.floor})`
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-600">{d.lead?.name || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLES[d.stage] || 'bg-gray-100 text-gray-600'}`}>
                            {d.stage}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {d.value ? `₹${(d.value / 100000).toFixed(1)}L` : '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">
                          {d.closingDate ? new Date(d.closingDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Link to={`/deals/${d._id}`} className="text-primary-600 hover:underline text-xs font-medium">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      )
}
