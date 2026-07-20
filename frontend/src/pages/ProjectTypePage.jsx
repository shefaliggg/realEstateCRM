import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  'Pre-Launch': 'bg-purple-100 text-purple-700',
  'New Launch': 'bg-blue-100 text-blue-700',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  'Ready to Move': 'bg-green-100 text-green-700',
  'Completed': 'bg-gray-100 text-gray-700',
}

const TYPE_LABELS = {
  buildings: 'Buildings',
  villas: 'Villas',
  plots: 'Plots',
  commercial: 'Commercial',
  'mixed-use': 'Mixed Use',
}

const PROJECT_STATUS_OPTIONS = ['Pre-Launch', 'New Launch', 'Under Construction', 'Ready to Move', 'Completed', 'Sold Out']
const BHK_OPTIONS = ['All', '1 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', 'Penthouse']
const RERA_STATUS_OPTIONS = ['All', 'Approved', 'Pending']

function formatPrice(p) {
  const n = Number(p)
  if (!n) return ''
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function CardView({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map(project => {
        const inventory = project.inventoryStats || {}
        const totalUnits = inventory.total || project.totalUnits || 0
        const soldUnits = (inventory.booked || 0) + (inventory.registered || 0)
        const soldPct = totalUnits ? Math.round((soldUnits / totalUnits) * 100) : 0
        const pulse = {
          todayLeads: project.salesPulse?.todayLeads ?? Math.max(0, Math.round((inventory.booked || 0) / 2)),
          followUpsDue: project.salesPulse?.followUpsDue ?? Math.max(0, Math.round((inventory.available || 0) / 3)),
          siteVisits: project.salesPulse?.siteVisits ?? Math.max(0, Math.round((inventory.reserved || 0) / 2)),
        }
        const priceStart = project.pricing?.priceStart || project.startingPrice || project.price
        const priceEnd = project.pricing?.priceEnd
        const priceLabel = priceStart && priceEnd
          ? `${formatPrice(priceStart)} - ${formatPrice(priceEnd)}`
          : priceStart
            ? `From ${formatPrice(priceStart)}`
            : 'Price on request'
        const possessionDate = project.possessionDate
          ? new Date(project.possessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'TBD'
        const bhkOptions = (project.bhkTypes || []).slice(0, 4)
        const bookingOpen = project.salesInfo?.bookingOpen
        const team = project.managedBy || []
        const coverImage = project.coverImage || project.images?.[0]

        return (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
          >
            <div className="relative">
              <span className={`absolute left-3 top-3 z-10 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
              {bookingOpen !== undefined && (
                <span className={`absolute right-3 top-3 z-10 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm ${bookingOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {bookingOpen ? 'Booking Open' : 'Booking Closed'}
                </span>
              )}
              {coverImage ? (
                <img src={coverImage} alt={project.name} className="h-40 w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-gray-400 text-sm font-medium">
                  No image available
                </div>
              )}
            </div>

            <div className="p-3.5 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">{project.name}</h2>
                  {project.type && <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">{project.type}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{project.developerName || 'Developer not set'}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  📍 {project.location?.city ? `${project.location.locality ? `${project.location.locality}, ` : ''}${project.location.city}` : 'Location pending'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-900 text-sm">{priceLabel}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${project.reraNo ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {project.reraNo ? 'RERA Registered' : 'RERA Pending'}
                </span>
              </div>

              {bhkOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bhkOptions.map((bhk) => (
                    <span key={bhk} className="text-[11px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">{bhk}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-primary-50 border border-primary-100 p-2.5">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.todayLeads}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">🎯 Leads</p>
                </div>
                <div className="text-center border-x border-primary-200/60">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.followUpsDue}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">📞 Follow-ups</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.siteVisits}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">🚗 Visits</p>
                </div>
              </div>

              {totalUnits > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>Inventory sold</span>
                    <span className="font-medium text-gray-700">{soldUnits}/{totalUnits} ({soldPct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${soldPct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <p className="text-xs text-gray-500">
                  {totalUnits || '—'} units · {project.numberOfTowers || '—'} towers · Poss. {possessionDate}
                </p>
                {team.length > 0 && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {team.slice(0, 3).map((u) => (
                      <span
                        key={u._id || u}
                        title={u.name}
                        className="h-5 w-5 rounded-full bg-primary-100 text-primary-700 text-[9px] font-bold flex items-center justify-center border border-white"
                      >
                        {(u.name || '?').slice(0, 1).toUpperCase()}
                      </span>
                    ))}
                    {team.length > 3 && (
                      <span className="h-5 w-5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center border border-white">
                        +{team.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
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

export default function ProjectTypePage() {
  const { type } = useParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('card')
  const [search, setSearch] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [users, setUsers] = useState([])
  const [filterManagedBy, setFilterManagedBy] = useState('')
  const [filterReraStatus, setFilterReraStatus] = useState('')
  const [filterBhk, setFilterBhk] = useState('All')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')

  const projectType = TYPE_LABELS[type] || 'Projects'
  const isBuildingsPage = projectType === 'Buildings'

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(([projectsRes, usersRes]) => {
        setProjects(projectsRes.data || [])
        setUsers(usersRes.data || [])
      })
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
      if (p.type !== projectType) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterCity && p.location?.city !== filterCity) return false
      if (filterManagedBy) {
        const selectedUser = users.find(user => user._id === filterManagedBy)
        const selectedName = (selectedUser?.name || '').toLowerCase()
        const selectedEmail = (selectedUser?.email || '').toLowerCase()
        const managedByMatches = (p.managedBy || []).some(entry => {
          if (typeof entry === 'string') {
            return entry === filterManagedBy || entry.toLowerCase().includes(selectedName) || entry.toLowerCase().includes(selectedEmail)
          }
          if (typeof entry === 'object') {
            const id = entry._id || ''
            const name = (entry.name || '').toLowerCase()
            const email = (entry.email || '').toLowerCase()
            return id === filterManagedBy || name.includes(selectedName) || email.includes(selectedEmail)
          }
          return false
        })
        const fallbackMatch = (p.developerName || '').toLowerCase().includes(selectedName)
        if (!managedByMatches && !fallbackMatch) return false
      }
      if (filterReraStatus) {
        const hasRera = Boolean(p.reraNo && String(p.reraNo).trim())
        if (filterReraStatus === 'Approved' ? !hasRera : hasRera) return false
      }
      if (filterBhk !== 'All') {
        const matched = (p.bhkTypes || []).some((bhk) => bhk.toLowerCase().includes(filterBhk.toLowerCase().replace(' bhk', '')))
        if (!matched) return false
      }
      if (filterMinPrice || filterMaxPrice) {
        const priceValue = Number(p.startingPrice || p.price || p.priceRange || 0)
        const minValue = Number(filterMinPrice || 0)
        const maxValue = Number(filterMaxPrice || Number.MAX_SAFE_INTEGER)
        if (!Number.isFinite(priceValue) || priceValue < minValue || priceValue > maxValue) return false
      }
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
  }, [projects, projectType, filterStatus, filterCity, filterManagedBy, filterReraStatus, filterBhk, filterMinPrice, filterMaxPrice, search, users])

  const hasFilters = search || filterStatus || filterCity || filterManagedBy || filterReraStatus || filterBhk !== 'All' || filterMinPrice || filterMaxPrice

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isBuildingsPage ? 'Buildings Sales Dashboard' : `${projectType} Projects`}</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} of {projects.filter(p => p.type === projectType).length} project{projects.filter(p => p.type === projectType).length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/projects/add" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Building
          </Link>
        </div>
      </div>

      <div className="flex flex-nowrap items-center gap-2 mb-6 overflow-x-auto pb-1">
        <div className="relative flex-shrink-0">
          {!isSearchOpen ? (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Open search"
            >
              🔍
            </button>
          ) : (
            <div className="relative w-48">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isBuildingsPage ? 'Project name' : 'Search projects...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onBlur={() => {
                  if (!search.trim()) {
                    setIsSearchOpen(false)
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
        >
          <option value="">Project status</option>
          {PROJECT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>

        {isBuildingsPage && (
          <select
            value={filterManagedBy}
            onChange={e => setFilterManagedBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
          >
            <option value="">Managed by</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name || user.email || 'Unnamed user'}</option>
            ))}
          </select>
        )}

        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
          >
            <option value="">City / zone</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {isBuildingsPage && (
          <>
            <select
              value={filterReraStatus}
              onChange={e => setFilterReraStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
            >
              <option value="">RERA status</option>
              {RERA_STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>

            <select
              value={filterBhk}
              onChange={e => setFilterBhk(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
            >
              {BHK_OPTIONS.map(option => <option key={option} value={option}>{option === 'All' ? 'All BHK' : option}</option>)}
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="number"
                placeholder="Min price"
                value={filterMinPrice}
                onChange={e => setFilterMinPrice(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <span>–</span>
              <input
                type="number"
                placeholder="Max price"
                value={filterMaxPrice}
                onChange={e => setFilterMaxPrice(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
          </>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setSearch('')
              setFilterStatus('')
              setFilterCity('')
              setFilterManagedBy('')
              setFilterReraStatus('')
              setFilterBhk('All')
              setFilterMinPrice('')
              setFilterMaxPrice('')
            }}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Clear filters
          </button>
        )}

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

      {loading && <div className="text-center py-16 text-gray-400">Loading projects...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 text-lg mb-1">No {projectType.toLowerCase()} projects match your filters</p>
          <button
            onClick={() => {
              setSearch('')
              setFilterStatus('')
              setFilterCity('')
              setFilterManagedBy('')
              setFilterReraStatus('')
              setFilterBhk('All')
              setFilterMinPrice('')
              setFilterMaxPrice('')
            }}
            className="text-primary-600 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        view === 'card' ? <CardView projects={filtered} /> : <ListView projects={filtered} />
      )}
    </div>
  )
}
