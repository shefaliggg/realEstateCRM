import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-500',
}

export default function UnitDetailPage() {
  const { id } = useParams()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Units endpoint: GET /api/projects/:projectId/units/:id
    // We need to fetch by unit id directly — backend returns populated unit
    // Try fetching from any project's unit endpoint; use a search approach
    api.get(`/units/${id}`)
      .then(r => setUnit(r.data))
      .catch(() => setError('Failed to load unit'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!unit) return null

  const project = typeof unit.project === 'object' ? unit.project : null

  return (
          <div className="p-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/inventory" className="hover:text-primary-600">Inventory</Link>
          {project && (
            <>
              <span>/</span>
              <Link to={`/projects/${project._id}`} className="hover:text-primary-600">{project.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">Block {unit.block} – {unit.unitNo}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Block {unit.block} – Unit {unit.unitNo}
            </h1>
            <p className="text-sm text-gray-500">Floor {unit.floor} · {unit.bhkType}</p>
          </div>
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[unit.status] || 'bg-gray-100 text-gray-600'}`}>
            {unit.status}
          </span>
        </div>

        {/* Unit Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">🏠 Unit Details</h3>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div><dt className="text-gray-500">BHK Type</dt><dd className="font-medium mt-0.5">{unit.bhkType}</dd></div>
            <div><dt className="text-gray-500">Floor</dt><dd className="font-medium mt-0.5">{unit.floor}</dd></div>
            <div><dt className="text-gray-500">Block</dt><dd className="font-medium mt-0.5">{unit.block}</dd></div>
            <div><dt className="text-gray-500">Unit No.</dt><dd className="font-medium mt-0.5">{unit.unitNo}</dd></div>
            <div><dt className="text-gray-500">Carpet Area</dt><dd className="font-medium mt-0.5">{unit.carpetArea ? `${unit.carpetArea} sqft` : '—'}</dd></div>
            <div><dt className="text-gray-500">Base Price</dt><dd className="font-medium mt-0.5">{unit.basePrice ? `₹${(unit.basePrice / 100000).toFixed(2)}L` : '—'}</dd></div>
            <div><dt className="text-gray-500">Facing</dt><dd className="font-medium mt-0.5">{unit.facing || '—'}</dd></div>
            {project && <div className="col-span-2"><dt className="text-gray-500">Project</dt><dd className="font-medium mt-0.5"><Link to={`/projects/${project._id}`} className="text-primary-600 hover:underline">{project.name}</Link></dd></div>}
          </dl>
        </div>

        {/* Linked Lead */}
        {unit.currentLead && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">👤 Linked Lead</h3>
            <Link to={`/leads/${unit.currentLead._id || unit.currentLead}`} className="text-primary-600 hover:underline text-sm">
              {unit.currentLead.name || 'View Lead →'}
            </Link>
          </div>
        )}

        {/* Linked Deal */}
        {unit.currentDeal && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">🤝 Linked Deal</h3>
            <Link to={`/deals/${unit.currentDeal._id || unit.currentDeal}`} className="text-primary-600 hover:underline text-sm">
              {unit.currentDeal.dealName || 'View Deal →'}
            </Link>
          </div>
        )}

        {/* Status History */}
        {unit.statusHistory?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Status History</h3>
            <div className="space-y-2">
              {unit.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status] || 'bg-gray-100'}`}>{h.status}</span>
                  <span className="text-gray-400">{h.changedAt ? new Date(h.changedAt).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )
}
