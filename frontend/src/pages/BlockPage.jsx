import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700 border-green-200',
  Reserved: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Booked: 'bg-orange-100 text-orange-700 border-orange-200',
  Registered: 'bg-blue-100 text-blue-700 border-blue-200',
  Cancelled: 'bg-red-100 text-red-500 border-red-200',
}

const LEGEND = [
  { label: 'Available', color: 'bg-green-400' },
  { label: 'Reserved', color: 'bg-yellow-400' },
  { label: 'Booked', color: 'bg-orange-400' },
  { label: 'Registered', color: 'bg-blue-400' },
  { label: 'Cancelled', color: 'bg-red-300' },
]

export default function BlockPage() {
  const { projectId, block } = useParams()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [bhkFilter, setBhkFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/units`),
    ])
      .then(([pRes, uRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data.filter(u => u.block === block))
      })
      .catch(() => setError('Failed to load block data'))
      .finally(() => setLoading(false))
  }, [projectId, block])

  const filtered = units.filter(u => {
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    if (bhkFilter !== 'All' && u.bhkType !== bhkFilter) return false
    return true
  })

  const floors = [...new Set(filtered.map(u => u.floor))].sort((a, b) => b - a)

  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'Available').length,
    reserved: units.filter(u => u.status === 'Reserved').length,
    booked: units.filter(u => u.status === 'Booked').length,
    registered: units.filter(u => u.status === 'Registered').length,
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/projects" className="hover:text-primary-600">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project?.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Block {block}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Block {block}</h1>
        </div>
        <Link
          to={`/projects/${projectId}/units/add?block=${encodeURIComponent(block)}`}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Flat
        </Link>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Total', val: stats.total, color: 'bg-gray-100 text-gray-700' },
          { label: 'Available', val: stats.available, color: 'bg-green-100 text-green-700' },
          { label: 'Reserved', val: stats.reserved, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Booked', val: stats.booked, color: 'bg-orange-100 text-orange-700' },
          { label: 'Registered', val: stats.registered, color: 'bg-blue-100 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${s.color}`}>
            {s.label}: <span className="font-bold">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {['All', 'Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={bhkFilter}
          onChange={e => setBhkFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="All">All BHK</option>
          {project?.bhkTypes?.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="text-sm text-gray-400 self-center">{filtered.length} flat{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {LEGEND.map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-3 h-3 rounded ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Floor grid */}
      {units.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-600 font-medium mb-1">No flats in Block {block} yet</p>
          <p className="text-sm text-gray-400 mb-5">Start adding flats to build your inventory</p>
          <Link
            to={`/projects/${projectId}/units/add?block=${encodeURIComponent(block)}`}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
          >
            + Add First Flat
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No flats match the selected filters.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="space-y-3">
            {floors.map(floor => (
              <div key={floor} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-400 font-medium text-right shrink-0">Floor {floor}</span>
                <div className="flex flex-wrap gap-2">
                  {filtered
                    .filter(u => u.floor === floor)
                    .sort((a, b) => String(a.unitNo).localeCompare(String(b.unitNo), undefined, { numeric: true }))
                    .map(u => (
                      <Link
                        key={u._id}
                        to={`/units/${u._id}`}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}
                        title={`${u.bhkType}${u.carpetArea ? ' · ' + u.carpetArea + ' sqft' : ''}${u.basePrice ? ' · ₹' + (u.basePrice / 100000).toFixed(1) + 'L' : ''}`}
                      >
                        {u.unitNo}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
