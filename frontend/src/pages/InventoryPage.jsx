import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

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
        setProjects(pRes.data)
        // Load all units for all projects
        return Promise.all(pRes.data.map(p => api.get(`/projects/${p._id}/units`)))
      })
      .then(results => {
        const all = results.flatMap(r => r.data)
        setUnits(all)
      })
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  const selectedProject = projects.find(p => p._id === projectFilter)

  const filtered = units.filter(u => {
    if (projectFilter !== 'All' && u.project?._id !== projectFilter && u.project !== projectFilter) return false
    if (blockFilter !== 'All' && u.block !== blockFilter) return false
    if (bhkFilter !== 'All' && u.bhkType !== bhkFilter) return false
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const projectName = (typeof u.project === 'object' ? u.project?.name : '') || ''
      if (!`${u.block}-${u.unitNo} ${u.bhkType} ${projectName}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const blocks = [...new Set(units.map(u => u.block))].sort()
  const bhkTypes = [...new Set(units.map(u => u.bhkType))].sort()

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-5">
          {['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map(s => {
            const count = units.filter(u => u.status === s).length
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  statusFilter === s ? 'ring-2 ring-primary-400' : ''
                } ${STATUS_COLORS[s] || 'bg-gray-100 text-gray-700'}`}
              >
                {s}: {count}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search unit..."
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 w-48"
          />
          <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setBlockFilter('All') }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
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
          <span className="text-sm text-gray-400 self-center">{filtered.length} units</span>
        </div>

        {loading && <div className="text-center py-16 text-gray-400">Loading inventory...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Unit</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">BHK</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Area</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Base Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No units found</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      Block {u.block} – {u.unitNo}&nbsp;
                      <span className="text-xs text-gray-400">F{u.floor}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {typeof u.project === 'object' ? u.project?.name : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.bhkType}</td>
                    <td className="px-4 py-3 text-gray-600">{u.carpetArea ? `${u.carpetArea} sqft` : '—'}</td>
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
