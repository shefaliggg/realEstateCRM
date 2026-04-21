import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  'Pre-Launch': 'bg-purple-100 text-purple-700',
  'Launched': 'bg-blue-100 text-blue-700',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  'Ready to Move': 'bg-green-100 text-green-700',
  'Completed': 'bg-gray-100 text-gray-700',
}

const ALL_STATUSES = ['Pre-Launch', 'Launched', 'Under Construction', 'Ready to Move', 'Completed']
const ALL_TYPES = ['Apartments', 'Villas', 'Plots', 'Commercial', 'Mixed Use']

function CardView({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {projects.map(project => (
        <Link
          key={project._id}
          to={`/projects/${project._id}`}
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 block"
        >
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            {project.images?.[0] ? (
              <img
                src={project.images[0]}
                alt={project.name}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-gray-400 text-sm font-medium">
                No image available
              </div>
            )}
          </div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
              <p className="text-sm text-gray-500">{project.developerName}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
              {project.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {project.location?.city && (
              <span>📍 {project.location.locality ? `${project.location.locality}, ` : ''}{project.location.city}</span>
            )}
            {project.totalUnits > 0 && <span>🏢 {project.totalUnits} units</span>}
            {project.bhkTypes?.length > 0 && <span>🛏 {project.bhkTypes.join(' | ')}</span>}
            {project.type && <span>🏠 {project.type}</span>}
            {project.reraNo && <span>📋 RERA: {project.reraNo}</span>}
          </div>
        </Link>
      ))}
    </div>
  )
}

function ListView({ projects }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Project</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Developer</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Location</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Units</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">BHK</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {projects.map(project => (
            <tr key={project._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/projects/${project._id}`} className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                  {project.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{project.developerName || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{project.type || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                {project.location?.city
                  ? `${project.location.locality ? project.location.locality + ', ' : ''}${project.location.city}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{project.totalUnits || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{project.bhkTypes?.join(', ') || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('card') // 'card' | 'list'
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCity, setFilterCity] = useState('')

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  const cities = useMemo(() => {
    const seen = new Set()
    projects.forEach(p => { if (p.location?.city) seen.add(p.location.city) })
    return [...seen].sort()
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus && p.status !== filterStatus) return false
      if (filterType && p.type !== filterType) return false
      if (filterCity && p.location?.city !== filterCity) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name?.toLowerCase().includes(q) &&
          !p.developerName?.toLowerCase().includes(q) &&
          !p.location?.city?.toLowerCase().includes(q) &&
          !p.location?.locality?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [projects, filterStatus, filterType, filterCity, search])

  const hasFilters = search || filterStatus || filterType || filterCity

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          to="/projects/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Project
        </Link>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
        >
          <option value="">All Types</option>
          {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* City filter */}
        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); setFilterCity('') }}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Clear filters
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('card')}
            title="Card view"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'card' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⊞ Cards
          </button>
          <button
            onClick={() => setView('list')}
            title="List view"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'list' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ☰ List
          </button>
        </div>
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

      {!loading && !error && projects.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 text-lg mb-1">No projects match your filters</p>
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterType(''); setFilterCity('') }}
            className="text-primary-600 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        view === 'card'
          ? <CardView projects={filtered} />
          : <ListView projects={filtered} />
      )}
    </div>
  )
}
