import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  'Pre-Launch': 'bg-purple-100 text-purple-700',
  'Launched': 'bg-blue-100 text-blue-700',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  'Ready to Move': 'bg-green-100 text-green-700',
  'Completed': 'bg-gray-100 text-gray-700',
}

const UNIT_STATUS_COLORS = {
  available: 'bg-green-500',
  reserved: 'bg-yellow-400',
  booked: 'bg-orange-500',
  registered: 'bg-blue-500',
  cancelled: 'bg-red-400',
}

function InventoryBar({ stats }) {
  const total = stats?.total || 1
  const available = stats?.available || 0
  const reserved = stats?.reserved || 0
  const booked = stats?.booked || 0
  const registered = stats?.registered || 0

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden mb-2">
        <div className="bg-green-500" style={{ width: `${(available / total) * 100}%` }} title={`Available: ${available}`} />
        <div className="bg-yellow-400" style={{ width: `${(reserved / total) * 100}%` }} title={`Reserved: ${reserved}`} />
        <div className="bg-orange-500" style={{ width: `${(booked / total) * 100}%` }} title={`Booked: ${booked}`} />
        <div className="bg-blue-500" style={{ width: `${(registered / total) * 100}%` }} title={`Registered: ${registered}`} />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {Object.entries({ Available: available, Reserved: reserved, Booked: booked, Registered: registered }).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${UNIT_STATUS_COLORS[k.toLowerCase()]}`} />
            {k}: {v}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">Developer project inventory</p>
          </div>
          <Link
            to="/projects/add"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Project
          </Link>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Loading projects...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏗️</div>
            <p className="text-gray-500 text-lg mb-2">No projects yet</p>
            <Link to="/projects/add" className="text-primary-600 hover:underline text-sm">Add your first project →</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {projects.map(project => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 block"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                  <p className="text-sm text-gray-500">{project.developerName}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                {project.location?.city && (
                  <span>📍 {project.location.locality ? `${project.location.locality}, ` : ''}{project.location.city}</span>
                )}
                {project.totalUnits && <span>🏢 {project.totalUnits} units</span>}
                {project.bhkTypes?.length > 0 && <span>🛏 {project.bhkTypes.join(' | ')}</span>}
                {project.reraNo && <span>📋 RERA: {project.reraNo}</span>}
              </div>

              {/* Inventory bar */}
              <InventoryBar stats={project.inventoryStats} />
            </Link>
          ))}
        </div>
      </div>
      )
}
