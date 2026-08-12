import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const SOURCES = ['All', 'Walk-in', 'Website', 'Referral', 'Portal - 99acres', 'Portal - MagicBricks', 'Portal - Housing', 'Google Ads', 'Facebook', 'Instagram', 'Cold Call', 'Event', 'Other']
const NURTURE_STAGES = ['All', 'Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']

const STAGE_STYLES = {
  Cold: 'bg-slate-100 text-slate-700',
  Warm: 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-orange-100 text-orange-700',
  'Very Interested': 'bg-red-100 text-red-700',
  Nurtured: 'bg-green-100 text-green-700',
}

function StarRating({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

export default function AllLeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') || ''
  const [projectName, setProjectName] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('All')
  const [filterStage, setFilterStage] = useState('All')
  const [view, setView] = useState('table')

  useEffect(() => {
    setLoading(true)
    api.get(projectFilter ? `/leads?project=${projectFilter}` : '/leads')
      .then(r => setLeads(r.data))
      .catch(() => setError('Failed to load leads'))
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

  const filtered = leads.filter(l => {
    if (search) {
      const q = search.toLowerCase()
      if (!`${l.name} ${l.phone} ${l.email}`.toLowerCase().includes(q)) return false
    }
    if (filterSource !== 'All' && l.source !== filterSource) return false
    if (filterStage !== 'All' && l.nurtureStage !== filterStage) return false
    return true
  })

  const stats = {
    total: leads.length,
    nurturedCount: leads.filter(l => l.nurtureStage === 'Nurtured').length,
    hotCount: leads.filter(l => l.nurtureStage === 'Very Interested').length,
    followUpCount: leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()).length,
  }

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/leads/add"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Lead
            </Link>
          </div>
        </div>

        {projectFilter && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg px-4 py-2.5 mb-4 text-sm">
            <span>Filtered by project{projectName ? `: ${projectName}` : ''}</span>
            <button onClick={clearProjectFilter} className="ml-auto text-xs font-medium underline hover:text-primary-800">Clear filter</button>
          </div>
        )}

        {/* Stat chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', val: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
            { label: 'Very Interested', val: stats.hotCount, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-400' },
            { label: 'Nurtured', val: stats.nurturedCount, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
            { label: 'Follow-ups Due', val: stats.followUpCount, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-400' },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.color}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <div>
                <p className="text-xs font-medium opacity-70">{s.label}</p>
                <p className="text-2xl font-bold leading-tight">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
            {SOURCES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
          </select>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
            {NURTURE_STAGES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Stages' : s}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {['table', 'grid'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-2 text-sm transition-colors ${view === v ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                {v === 'table' ? '☰' : '⊞'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} found</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>}
        {loading && <div className="text-center py-16 text-gray-400">Loading leads...</div>}

        {!loading && !error && view === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Nurture Stage</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Budget</th>
                      <th className="px-5 py-3">Follow-up</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(l => (
                      <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{l.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{l.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{l.source || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLES[l.nurtureStage] || 'bg-gray-100 text-gray-600'}`}>
                            {l.nurtureStage || 'Cold'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StarRating score={l.leadScore || 0} />
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {l.budget ? `₹${(l.budget / 100000).toFixed(0)}L` : '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">
                          {l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Link to={`/leads/${l._id}`} className="text-primary-600 hover:underline text-xs font-medium">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!loading && !error && view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-gray-400">No leads found</div>
            ) : filtered.map(l => (
              <Link key={l._id} to={`/leads/${l._id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition p-5 block">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-400">{l.phone}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLES[l.nurtureStage] || 'bg-gray-100'}`}>
                    {l.nurtureStage || 'Cold'}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget</span>
                    <span className="font-medium">{l.budget ? `₹${(l.budget / 100000).toFixed(0)}L` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source</span>
                    <span className="text-gray-600">{l.source || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <StarRating score={l.leadScore || 0} />
                  {l.nextFollowUpDate && (
                    <span className="text-xs text-primary-600">📅 {new Date(l.nextFollowUpDate).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      )
}
