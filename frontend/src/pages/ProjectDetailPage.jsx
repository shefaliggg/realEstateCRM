import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { formatPrice, formatDate, getInitials } from './projectDetail/shared'
import OverviewTab from './projectDetail/OverviewTab'
import ProfileTab from './projectDetail/ProfileTab'
import TowersTab from './projectDetail/TowersTab'
import InventoryTab from './projectDetail/InventoryTab'
import DocumentsTab from './projectDetail/DocumentsTab'
import GalleryTab from './projectDetail/GalleryTab'
import ActivityTab from './projectDetail/ActivityTab'
import TeamTab from './projectDetail/TeamTab'
import SettingsTab from './projectDetail/SettingsTab'

const PROFILE_TYPE_CONFIG = {
  Buildings: { totalLabel: 'Total Units', amenitiesTitle: 'Amenities', descriptionTitle: 'Description' },
  Villas: { totalLabel: 'Total Villas', amenitiesTitle: 'Amenities', descriptionTitle: 'Description' },
  Plots: { totalLabel: 'Total Plots', amenitiesTitle: 'Layout Amenities', descriptionTitle: 'Layout Description' },
  Commercial: { totalLabel: 'Total Spaces', amenitiesTitle: 'Commercial Amenities', descriptionTitle: 'Commercial Description' },
  'Mixed Use': { totalLabel: 'Total Units/Spaces', amenitiesTitle: 'Amenities', descriptionTitle: 'Project Description' },
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Profile' },
  { key: 'towers', label: 'Towers' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'documents', label: 'Documents' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'activity', label: 'Activity' },
  { key: 'team', label: 'Team' },
  { key: 'settings', label: 'Settings' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [towers, setTowers] = useState([])
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')

  const refetchUnits = useCallback(() => {
    api.get(`/projects/${id}/units`).then((res) => setUnits(res.data)).catch(() => {})
  }, [id])
  const refetchTowers = useCallback(() => {
    api.get(`/projects/${id}/towers`).then((res) => setTowers(res.data)).catch(() => {})
  }, [id])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/units`),
      api.get(`/projects/${id}/towers`),
      api.get(`/leads?project=${id}`),
      api.get(`/deals?project=${id}`),
      api.get(`/bookings?project=${id}`),
      api.get(`/payments?project=${id}`),
      api.get('/users'),
    ])
      .then(([pRes, uRes, towersRes, lRes, dRes, bRes, payRes, usersRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data)
        setTowers(towersRes.data)
        setLeads(lRes.data)
        setDeals(dRes.data)
        setBookings(bRes.data)
        setPayments(payRes.data)
        setUsers(usersRes.data || [])
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!project) return null

  const projectType = project.type || 'Buildings'
  const profileTypeConfig = PROFILE_TYPE_CONFIG[projectType] || PROFILE_TYPE_CONFIG.Buildings
  const userById = new Map(users.map((u) => [u._id, u]))

  const locationParts = [
    project.location?.address, project.location?.landmark, project.location?.locality, project.location?.city,
    project.location?.state, project.location?.pincode, project.location?.country,
  ].filter(Boolean)
  const locationText = locationParts.join(', ')
  const googleMapLink = project.location?.googleMapLink || ''
  const mapSrc = locationText ? `https://www.google.com/maps?q=${encodeURIComponent(locationText)}&z=15&output=embed` : ''
  const mapActionLink = googleMapLink || (locationText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}` : '')

  const pricing = project.pricing || {}
  const priceLabel = pricing.priceStart && pricing.priceEnd
    ? `${formatPrice(pricing.priceStart)} - ${formatPrice(pricing.priceEnd)}`
    : pricing.priceStart ? `From ${formatPrice(pricing.priceStart)}` : 'Price on request'

  const assignedUsers = Array.isArray(project.managedBy) ? project.managedBy : []
  const heroImage = project.coverImage || (project.images || [])[0] || ''

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/projects" className="hover:text-primary-600">Projects</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative w-full overflow-hidden">
          {heroImage ? (
            <img src={heroImage} alt={project.name} className="absolute inset-0 h-full w-full scale-110 object-cover blur-md" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-200/85 via-gray-100/70 to-gray-50/50" />

          <div className="relative flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {project.logo ? (
                  <img src={project.logo} alt="" className="h-14 w-14 rounded-xl border-2 border-white bg-white object-cover shadow-md shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-xl border-2 border-white bg-gray-100 shadow-md shrink-0 flex items-center justify-center text-gray-700 font-bold text-lg">
                    {getInitials(project.name)}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${project.salesInfo?.bookingOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {project.salesInfo?.bookingOpen ? 'Booking Open' : 'Booking Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {project.type} · {project.status} · {locationText || 'Location pending'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    RERA: {project.reraNo || '—'} · Sales Manager: {assignedUsers[0]?.name || 'Unassigned'} · Possession: {formatDate(project.possessionDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Price</p>
                <p className="font-bold text-gray-900">{priceLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to={`/projects/${id}/edit`} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">✏️ Edit</Link>
              <Link to={`/projects/${id}/units/add`} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">🏠 Add Unit</Link>
              <Link to={`/projects/${id}/towers/add`} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">🏢 Add Tower</Link>
              <Link to={`/leads/add?project=${id}`} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">👤 Add Lead</Link>
              {project.documents?.brochure && (
                <a href={project.documents.brochure} target="_blank" rel="noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">⭳ Brochure</a>
              )}
              <button onClick={handleShare} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">🔗 Share</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-5">
          {TABS.map(({ key, label }) => (
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

        {tab === 'overview' && (
          <OverviewTab
            id={id} project={project} units={units} towers={towers} leads={leads} deals={deals}
            bookings={bookings} payments={payments} userById={userById} onNavigateTab={setTab}
          />
        )}
        {tab === 'profile' && (
          <ProfileTab project={project} profileTypeConfig={profileTypeConfig} locationText={locationText} mapSrc={mapSrc} mapActionLink={mapActionLink} />
        )}
        {tab === 'towers' && <TowersTab id={id} project={project} units={units} towers={towers} onTowersChanged={refetchTowers} />}
        {tab === 'inventory' && <InventoryTab id={id} project={project} units={units} onUnitsChanged={refetchUnits} />}
        {tab === 'documents' && <DocumentsTab project={project} />}
        {tab === 'gallery' && <GalleryTab project={project} />}
        {tab === 'activity' && <ActivityTab units={units} bookings={bookings} payments={payments} userById={userById} />}
        {tab === 'team' && (
          <TeamTab id={id} project={project} users={users} onProjectChanged={(p) => setProject((prev) => ({ ...prev, ...p }))} />
        )}
        {tab === 'settings' && <SettingsTab id={id} project={project} />}
      </div>
    </div>
  )
}
