import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const UNIT_STATUS_COLORS = {
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

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('inventory')
  const [blockFilter, setBlockFilter] = useState('All')
  const [bhkFilter, setBhkFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/units`),
    ])
      .then(([pRes, uRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data)
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  const filteredUnits = units.filter(u => {
    if (blockFilter !== 'All' && u.block !== blockFilter) return false
    if (bhkFilter !== 'All' && u.bhkType !== bhkFilter) return false
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    return true
  })

  // Group by floor for matrix view
  const floors = [...new Set(filteredUnits.map(u => u.floor))].sort((a, b) => b - a)
  const blocks = project?.blocks || []

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!project) return null

  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'Available').length,
    reserved: units.filter(u => u.status === 'Reserved').length,
    booked: units.filter(u => u.status === 'Booked').length,
    registered: units.filter(u => u.status === 'Registered').length,
  }

  return (
          <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/projects" className="hover:text-primary-600">Projects</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.developerName} · {project.location?.city}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/projects/${id}/units/add`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Unit
            </Link>
            <Link
              to={`/projects/edit/${id}`}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Stats chips */}
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {['inventory', 'overview'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'inventory' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <select
                value={blockFilter}
                onChange={e => setBlockFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="All">All Blocks</option>
                {blocks.map(b => <option key={b} value={b}>Block {b}</option>)}
              </select>
              <select
                value={bhkFilter}
                onChange={e => setBhkFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="All">All BHK</option>
                {project.bhkTypes?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {['All', 'Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-sm text-gray-400 self-center">{filteredUnits.length} units</span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {LEGEND.map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-3 h-3 rounded ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>

            {/* Unit grid */}
            {filteredUnits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No units match the selected filters.{' '}
                <Link to={`/projects/${id}/units/add`} className="text-primary-600 hover:underline">Add units</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {floors.map(floor => (
                  <div key={floor} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-gray-400 font-medium text-right">Floor {floor}</span>
                    <div className="flex flex-wrap gap-2">
                      {filteredUnits
                        .filter(u => u.floor === floor)
                        .sort((a, b) => a.unitNo - b.unitNo)
                        .map(u => (
                          <Link
                            key={u._id}
                            to={`/units/${u._id}`}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity ${UNIT_STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}
                            title={`${u.bhkType} · ${u.carpetArea} sqft · ₹${(u.basePrice / 100000).toFixed(1)}L`}
                          >
                            {u.block}-{u.unitNo}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Project Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium">{project.type}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{project.status}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">RERA No.</dt><dd className="font-medium">{project.reraNo || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd className="font-medium">{[project.location?.locality, project.location?.city].filter(Boolean).join(', ') || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Total Units</dt><dd className="font-medium">{project.totalUnits}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Blocks</dt><dd className="font-medium">{project.blocks?.join(', ') || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">BHK Types</dt><dd className="font-medium">{project.bhkTypes?.join(', ') || '—'}</dd></div>
              </dl>
            </div>
            {project.amenities?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🏊 Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map(a => (
                    <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {project.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">📝 Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{project.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
      )
}
