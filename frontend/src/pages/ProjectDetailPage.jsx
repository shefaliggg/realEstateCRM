import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

const PROFILE_TYPE_CONFIG = {
  Apartments: {
    showBlocksTab: true,
    showBlocksDetails: true,
    showBhkDetails: true,
    totalLabel: 'Total Units',
    blockUnitLabel: 'flats',
    amenitiesTitle: 'Amenities',
    descriptionTitle: 'Description',
  },
  Villas: {
    showBlocksTab: true,
    showBlocksDetails: true,
    showBhkDetails: true,
    totalLabel: 'Total Villas',
    blockUnitLabel: 'villas',
    amenitiesTitle: 'Amenities',
    descriptionTitle: 'Description',
  },
  Plots: {
    showBlocksTab: false,
    showBlocksDetails: false,
    showBhkDetails: false,
    totalLabel: 'Total Plots',
    blockUnitLabel: 'plots',
    amenitiesTitle: 'Layout Amenities',
    descriptionTitle: 'Layout Description',
  },
  Commercial: {
    showBlocksTab: false,
    showBlocksDetails: false,
    showBhkDetails: false,
    totalLabel: 'Total Spaces',
    blockUnitLabel: 'spaces',
    amenitiesTitle: 'Commercial Amenities',
    descriptionTitle: 'Commercial Description',
  },
  'Mixed Use': {
    showBlocksTab: true,
    showBlocksDetails: true,
    showBhkDetails: true,
    totalLabel: 'Total Units/Spaces',
    blockUnitLabel: 'units',
    amenitiesTitle: 'Amenities',
    descriptionTitle: 'Project Description',
  },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [newBlock, setNewBlock] = useState('')
  const [addingBlock, setAddingBlock] = useState(false)
  const [selectedManagers, setSelectedManagers] = useState([])
  const [assigningManager, setAssigningManager] = useState(false)
  const [assignMessage, setAssignMessage] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [managerSearch, setManagerSearch] = useState('')
  const dropdownRef = useRef(null)
  const projectType = project?.type || 'Apartments'
  const profileTypeConfig = PROFILE_TYPE_CONFIG[projectType] || PROFILE_TYPE_CONFIG.Apartments

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/units`),
    ])
      .then(([pRes, uRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data)
        const assignedIds = Array.isArray(pRes.data?.managedBy)
          ? pRes.data.managedBy.map((u) => (typeof u === 'string' ? u : u._id)).filter(Boolean)
          : []
        setSelectedManagers(assignedIds)
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]))
  }, [])

  useEffect(() => {
    if ((tab === 'blocks' && !profileTypeConfig.showBlocksTab) || (tab === 'plots' && projectType !== 'Plots')) {
      setTab('overview')
    }
  }, [tab, profileTypeConfig.showBlocksTab, projectType])

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

  const handleAddBlock = async () => {
    const value = newBlock.trim()
    if (!value || addingBlock) return
    if (blocks.some(b => b.toLowerCase() === value.toLowerCase())) return

    setAddingBlock(true)
    try {
      const updatedBlocks = [...blocks, value]
      const res = await api.put(`/projects/${id}`, { blocks: updatedBlocks })
      setProject(prev => ({ ...prev, ...res.data }))
      setNewBlock('')
    } catch {
      setError('Failed to add block')
    } finally {
      setAddingBlock(false)
    }
  }

  const handleAssignManager = async () => {
    if (assigningManager) return
    setAssigningManager(true)
    setAssignMessage('')
    try {
      const payload = { managedBy: selectedManagers }
      const res = await api.put(`/projects/${id}`, payload)
      setProject((prev) => ({ ...prev, ...res.data }))
      const assignedIds = Array.isArray(res.data?.managedBy)
        ? res.data.managedBy.map((u) => (typeof u === 'string' ? u : u._id)).filter(Boolean)
        : []
      setSelectedManagers(assignedIds)
      setAssignMessage(assignedIds.length ? 'Managers assigned successfully.' : 'Assignment cleared.')
    } catch {
      setAssignMessage('Failed to assign manager.')
    } finally {
      setAssigningManager(false)
    }
  }

  const toggleManager = (userId) => {
    setSelectedManagers((prev) => (
      prev.includes(userId) ? prev.filter((idVal) => idVal !== userId) : [...prev, userId]
    ))
  }

  const assignedUsers = Array.isArray(project?.managedBy) ? project.managedBy : []
  const filteredUsers = users.filter((u) => {
    const query = managerSearch.trim().toLowerCase()
    if (!query) return true
    return [u.name, u.email, u.phone, u.role].some((value) => value?.toLowerCase().includes(query))
  })
  const selectedUsers = users.filter((u) => selectedManagers.includes(u._id))
  const displayAssignedUsers = selectedManagers
    .map((userId) => users.find((u) => u._id === userId) || assignedUsers.find((u) => u?._id === userId))
    .filter(Boolean)
  const projectImages = Array.isArray(project?.images) ? project.images.filter(Boolean) : []
  const projectVideos = Array.isArray(project?.videos) ? project.videos.filter(Boolean) : []
  const galleryMedia = [
    ...projectImages.map((src, index) => ({ id: `image-${index}`, src, type: 'image' })),
    ...projectVideos.map((src, index) => ({ id: `video-${index}`, src, type: 'video' })),
  ]
  const locationParts = [
    project.location?.address,
    project.location?.locality,
    project.location?.city,
    project.location?.state,
    project.location?.pincode,
  ].filter(Boolean)
  const locationText = locationParts.join(', ')
  const googleMapLink = project.location?.googleMapLink || ''
  const mapSrc = locationText
    ? `https://www.google.com/maps?q=${encodeURIComponent(locationText)}&z=15&output=embed`
    : ''
  const mapActionLink = googleMapLink || (locationText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}` : '')
  const formatDate = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const getInitials = (name) => (
    name
      ? name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
      : 'U'
  )

  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(profileTypeConfig.showBlocksTab ? [{ key: 'blocks', label: 'Blocks' }] : []),
    ...(projectType === 'Plots' ? [{ key: 'plots', label: 'Plots' }] : []),
    { key: 'managedBy', label: 'Managed By' },
  ]

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
          </div>
          {projectType === 'Plots' && (
            <Link
              to={`/projects/${id}/units/add`}
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              + Add Plot
            </Link>
          )}
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
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'blocks' && (
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={newBlock}
                  onChange={e => setNewBlock(e.target.value)}
                  placeholder="Add block name (e.g. B, Tower-1, Podium)"
                  className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                  type="button"
                  onClick={handleAddBlock}
                  disabled={addingBlock || !newBlock.trim()}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {addingBlock ? 'Adding...' : '+ Add Block'}
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No blocks configured.{' '}
                <Link to={`/projects/edit/${id}`} className="text-primary-600 hover:underline">Edit project</Link> to add blocks.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {blocks.map(b => {
                  const bu = units.filter(u => u.block === b)
                  const bTotal = bu.length || 1
                  const bAvail = bu.filter(u => u.status === 'Available').length
                  const bReserved = bu.filter(u => u.status === 'Reserved').length
                  const bBooked = bu.filter(u => u.status === 'Booked').length
                  const bReg = bu.filter(u => u.status === 'Registered').length
                  return (
                    <Link
                      key={b}
                      to={`/projects/${id}/blocks/${encodeURIComponent(b)}`}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-primary-700 font-bold text-xs">Blk {b}</span>
                        </div>
                        <span className="text-xs text-gray-400">{bu.length} {profileTypeConfig.blockUnitLabel}</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden mb-3">
                        <div className="bg-green-400" style={{ width: `${(bAvail / bTotal) * 100}%` }} />
                        <div className="bg-yellow-400" style={{ width: `${(bReserved / bTotal) * 100}%` }} />
                        <div className="bg-orange-400" style={{ width: `${(bBooked / bTotal) * 100}%` }} />
                        <div className="bg-blue-400" style={{ width: `${(bReg / bTotal) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600 font-medium">{bAvail} avail</span>
                        <span className="text-orange-600 font-medium">{bBooked} booked</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'plots' && projectType === 'Plots' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div>
                <h3 className="font-semibold text-gray-800">📍 Plot Inventory</h3>
                <p className="text-sm text-gray-500">Manage all plots created under this land project.</p>
              </div>
              <Link
                to={`/projects/${id}/units/add`}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                + Add Plot
              </Link>
            </div>

            {units.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                No plots added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {units.map((plot) => (
                  <Link
                    key={plot._id}
                    to={`/units/${plot._id}`}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Plot No.</p>
                        <h4 className="mt-1 text-base font-semibold text-gray-900">{plot.unitNo || '—'}</h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {plot.status || 'Available'}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Facing</dt>
                        <dd className="font-medium text-gray-800">{plot.facing || '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Plot Area</dt>
                        <dd className="font-medium text-gray-800">
                          {plot.carpetArea ? `${plot.carpetArea} sqyd` : '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Base Price</dt>
                        <dd className="font-medium text-gray-800">
                          {plot.basePrice ? `₹${plot.basePrice.toLocaleString('en-IN')}` : '—'}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-800">Project Gallery</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {galleryMedia.length} media
                </span>
              </div>

              {galleryMedia.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {galleryMedia.map((media, index) => (
                    <div key={media.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50">
                      {media.type === 'image' ? (
                        <img
                          src={media.src}
                          alt={`${project.name} ${index + 1}`}
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.src}
                          controls
                          preload="metadata"
                          className="h-56 w-full bg-black object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-4 py-12 text-center text-sm text-gray-500">
                  No project media added yet.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Project Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Developer</dt><dd className="font-medium text-right">{project.developerName || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium">{project.type}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{project.status}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">RERA No.</dt><dd className="font-medium">{project.reraNo || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-500">Location</dt><dd className="font-medium text-right">{locationText || '—'}</dd></div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Map Link</dt>
                  <dd className="font-medium text-right break-all">
                    {googleMapLink ? (
                      <a href={googleMapLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700">
                        Open Link
                      </a>
                    ) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between"><dt className="text-gray-500">Launch Date</dt><dd className="font-medium">{formatDate(project.launchDate)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Possession Date</dt><dd className="font-medium">{formatDate(project.possessionDate)}</dd></div>
                {project.totalUnits ? (
                  <div className="flex justify-between"><dt className="text-gray-500">{profileTypeConfig.totalLabel}</dt><dd className="font-medium">{project.totalUnits}</dd></div>
                ) : null}
                {profileTypeConfig.showBlocksDetails ? (
                  <div className="flex justify-between"><dt className="text-gray-500">Blocks</dt><dd className="font-medium">{project.blocks?.join(', ') || '—'}</dd></div>
                ) : null}
                {profileTypeConfig.showBhkDetails ? (
                  <div className="flex justify-between"><dt className="text-gray-500">BHK Types</dt><dd className="font-medium">{project.bhkTypes?.join(', ') || '—'}</dd></div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Managed By</dt>
                  <dd className="font-medium text-right">
                    {assignedUsers.length ? assignedUsers.map((u) => u.name).join(', ') : 'Unassigned'}
                  </dd>
                </div>
              </dl>
            </div>
            {project.amenities?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🏊 {profileTypeConfig.amenitiesTitle}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map(a => (
                    <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-semibold text-gray-800">📍 Map</h3>
                {mapActionLink && (
                  <a
                    href={mapActionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>

              {mapSrc ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <iframe
                    title={`${project.name} map`}
                    src={mapSrc}
                    className="h-80 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-4 py-10 text-center text-sm text-gray-500">
                  Add project address details to show the map.
                </div>
              )}
            </div>
            {project.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">📝 {profileTypeConfig.descriptionTitle}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{project.description}</p>
              </div>
            )}
            </div>
          </div>
        )}

        {tab === 'managedBy' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assign Team Members</h3>
                    <p className="mt-1 text-sm text-gray-500">Pick one or more members to manage this project.</p>
                  </div>
                  <div className="flex items-center gap-2 self-start rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary-500" />
                    {selectedManagers.length} selected
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {users.length > 0 ? (
                  <div className="space-y-4">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-primary-300 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Team Picker</p>
                            <p className="mt-1 truncate text-sm font-medium text-gray-800">
                              {selectedUsers.length === 0
                                ? 'Select team members'
                                : selectedUsers.map((u) => u.name).join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              {selectedUsers.length}
                            </span>
                            <svg
                              className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {dropdownOpen && (
                        <div className="absolute left-0 top-full z-10 mt-3 w-full rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
                          <div className="border-b border-gray-100 p-3">
                            <input
                              value={managerSearch}
                              onChange={(e) => setManagerSearch(e.target.value)}
                              placeholder="Search by name, email, phone or role"
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                          </div>

                          <div className="max-h-72 overflow-y-auto p-3">
                            {filteredUsers.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                                No team members match this search.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filteredUsers.map((u) => {
                                  const checked = selectedManagers.includes(u._id)
                                  return (
                                    <label
                                      key={u._id}
                                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer transition ${
                                        checked
                                          ? 'border-primary-300 bg-primary-50/70'
                                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleManager(u._id)}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                      />
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                        {getInitials(u.name)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                            {u.role}
                                          </span>
                                        </div>
                                        <p className="truncate text-xs text-gray-500">{u.email || 'No email available'}</p>
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAssignManager}
                        disabled={assigningManager}
                        className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                      >
                        {assigningManager ? 'Saving...' : 'Save Assignment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No users available to assign, or you may not have permission to fetch users.</p>
                )}

                {assignMessage && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {assignMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800">Assigned Members</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {displayAssignedUsers.length} total
                </span>
              </div>

              {displayAssignedUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                  No users assigned yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {displayAssignedUsers.map((u) => {
                    return (
                      <div key={u._id} className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-4">
                        <div className="flex items-start gap-3">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold border border-primary-200">
                            {getInitials(u.name)}
                          </div>
                        )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {u.role || 'User'}
                              </span>
                            </div>
                            <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                              <p className="truncate">{u.email || 'No email'}</p>
                              <p className="truncate">{u.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )
}
