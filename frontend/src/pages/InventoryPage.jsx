import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const PROJECT_TYPES = ['Buildings', 'Villas', 'Plots', 'Commercial', 'Mixed Use']

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-500',
}

export default function InventoryPage() {
  const [units, setUnits] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeType, setActiveType] = useState('Buildings')
  const [projectFilter, setProjectFilter] = useState('All')
  const [blockFilter, setBlockFilter] = useState('All')
  const [bhkFilter, setBhkFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
    ])
      .then(([pRes]) => {
        const fetchedProjects = pRes.data || []
        setProjects(fetchedProjects)
        // Load all units for all projects
        return Promise.all(fetchedProjects.map((p) => api.get(`/projects/${p._id}/units`))).then((results) => ({
          results,
          fetchedProjects,
        }))
      })
      .then(({ results, fetchedProjects }) => {
        const projectById = new Map(fetchedProjects.map((p) => [p._id, p]))
        const all = results.flatMap((r) => r.data).map((unit) => {
          const projectId = typeof unit.project === 'object' ? unit.project?._id : unit.project
          const projectObj = (typeof unit.project === 'object' ? unit.project : null) || projectById.get(projectId)
          return {
            ...unit,
            projectMeta: projectObj || null,
          }
        })
        setUnits(all)
      })
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  const typeProjects = projects.filter((p) => (p.type || 'Buildings') === activeType)
  const typeProjectIds = new Set(typeProjects.map((p) => p._id))

  const typeUnits = units.filter((u) => {
    const projectId = typeof u.project === 'object' ? u.project?._id : u.project
    return typeProjectIds.has(projectId)
  })

  const filtered = typeUnits.filter((u) => {
    if (projectFilter !== 'All' && u.project?._id !== projectFilter && u.project !== projectFilter) return false
    if (activeType !== 'Plots' && blockFilter !== 'All' && u.block !== blockFilter) return false
    if (activeType !== 'Plots' && bhkFilter !== 'All' && u.bhkType !== bhkFilter) return false
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const projectName = u.projectMeta?.name || (typeof u.project === 'object' ? u.project?.name : '') || ''
      if (!`${u.block}-${u.unitNo} ${u.bhkType} ${projectName}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const blocks = [...new Set(typeUnits.map((u) => u.block).filter(Boolean))].sort()
  const bhkTypes = [...new Set(typeUnits.map((u) => u.bhkType).filter(Boolean))].sort()
  const totalLabel = activeType === 'Plots' ? 'plots' : 'units'

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory by Project Type</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5 border-b border-gray-200 pb-3">
          {PROJECT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type)
                setProjectFilter('All')
                setBlockFilter('All')
                setBhkFilter('All')
                setStatusFilter('All')
                setSearch('')
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeType === 'Plots' ? 'Search plot...' : 'Search unit...'}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 w-48"
          />
          <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setBlockFilter('All') }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
            <option value="All">All {activeType} Projects</option>
            {typeProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
            <option value="All">All Status</option>
            {['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {activeType !== 'Plots' && (
            <>
              <select value={blockFilter} onChange={e => setBlockFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="All">All Blocks</option>
                {blocks.map(b => <option key={b} value={b}>Block {b}</option>)}
              </select>
              <select value={bhkFilter} onChange={e => setBhkFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="All">All BHK</option>
                {bhkTypes.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          )}
          <span className="text-sm text-gray-400 self-center">{filtered.length} {totalLabel}</span>
        </div>

        {loading && <div className="text-center py-16 text-gray-400">Loading inventory...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">{activeType === 'Plots' ? 'Plot' : 'Unit'}</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Project</th>
                  {activeType !== 'Plots' && <th className="text-left px-4 py-3 text-gray-600 font-medium">BHK</th>}
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">{activeType === 'Plots' ? 'Plot Area' : 'Area'}</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Base Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={activeType === 'Plots' ? 6 : 7} className="text-center py-10 text-gray-400">No {totalLabel} found</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {activeType === 'Plots' ? (
                        <>Plot {u.unitNo}</>
                      ) : (
                        <>
                          Block {u.block} – {u.unitNo}&nbsp;
                          <span className="text-xs text-gray-400">F{u.floor}</span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.projectMeta?.name || (typeof u.project === 'object' ? u.project?.name : '—')}
                    </td>
                    {activeType !== 'Plots' && <td className="px-4 py-3 text-gray-600">{u.bhkType}</td>}
                    <td className="px-4 py-3 text-gray-600">{u.carpetArea ? `${u.carpetArea} ${activeType === 'Plots' ? 'sqyd' : 'sqft'}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.basePrice ? `₹${(u.basePrice / 100000).toFixed(1)}L` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[u.status] || ''}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/units/${u._id}`} className="text-primary-600 hover:underline text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )
}
