import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { amenityIcon } from './projectDetail/shared'
import { EditPencilButton, Modal } from './projectDetail/editShared'
import { EditTowerAmenitiesModal, EditTowerSpecificationsModal } from './projectDetail/towerEditModals'
import { EditUnitModal } from './projectDetail/unitEditModals'
import BulkCreateFlatsPanel from './projectDetail/BulkCreateFlatsPanel'

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

function formatPrice(v) {
  const n = Number(v)
  if (!n) return ''
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function FlatCard({ unit, onEdit }) {
  const price = unit.totalPrice || unit.basePrice
  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(unit)
  }
  return (
    <Link
      to={`/units/${unit._id}`}
      className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-primary-200 transition-all p-4 block"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">Flat {unit.unitNo}</h4>
          <p className="text-xs text-gray-400">Floor {unit.floor} · {unit.bhkType}{unit.cornerUnit ? ' · Corner' : ''}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[unit.status] || 'bg-gray-100 text-gray-600'}`}>
            {unit.status}
          </span>
          <button type="button" onClick={handleEdit} title="Edit Flat" className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors">
            ✏️
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">{unit.carpetArea ? `${unit.carpetArea} Sq.ft` : '—'}</span>
        <span className="font-bold text-gray-900">{price ? formatPrice(price) : 'Price TBD'}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Facing {unit.facing || '—'}</span>
        <span>Parking {unit.parkingNumber || (unit.parkingIncluded ? 'Included' : '—')}</span>
      </div>
    </Link>
  )
}

export default function BlockPage() {
  const { projectId, block } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [tower, setTower] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [bhkFilter, setBhkFilter] = useState('All')
  const [view, setView] = useState('cards')
  const [towerModal, setTowerModal] = useState(null)
  const [tab, setTab] = useState('details')
  const [editingUnit, setEditingUnit] = useState(null)
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [confirmDeleteTower, setConfirmDeleteTower] = useState(false)
  const [deletingTower, setDeletingTower] = useState(false)

  const refetchUnits = useCallback(() => {
    api.get(`/projects/${projectId}/units`, { params: { block } }).then((res) => setUnits(res.data)).catch(() => {})
  }, [projectId, block])

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/units`, { params: { block } }),
      api.get(`/projects/${projectId}/towers`, { params: { name: block } }),
    ])
      .then(([pRes, uRes, towersRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data)
        setTower(towersRes.data[0] || null)
      })
      .catch(() => setError('Failed to load block data'))
      .finally(() => setLoading(false))
  }, [projectId, block])

  const handleUnitSaved = (updated) => {
    setUnits((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
  }

  const handleDeleteTower = async () => {
    if (!tower) return
    if (!confirmDeleteTower) { setConfirmDeleteTower(true); return }
    setDeletingTower(true)
    try {
      await api.delete(`/projects/${projectId}/towers/${tower._id}`)
      navigate(`/projects/${projectId}`)
    } catch {
      setDeletingTower(false)
      setConfirmDeleteTower(false)
    }
  }

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
        <span className="text-gray-900 font-medium">Tower {block}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tower {block}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${projectId}/units/add?block=${encodeURIComponent(block)}`}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Flat
          </Link>
          <button
            type="button"
            onClick={() => setShowBulkAdd(true)}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Bulk Add Flats
          </button>
        </div>
      </div>

      {showBulkAdd && (
        <Modal title="Bulk Add Flats" icon="⭐" onClose={() => setShowBulkAdd(false)} wide>
          <BulkCreateFlatsPanel
            id={projectId}
            towers={[block]}
            onCreated={() => { refetchUnits(); setShowBulkAdd(false) }}
            embedded
          />
        </Modal>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-5">
        {[
          { key: 'details', label: 'Details' },
          { key: 'flats', label: 'Flat List' },
        ].map(({ key, label }) => (
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

      {tab === 'details' && (
        <>
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

      {/* Tower Profile */}
      <div className="mb-6">
        {tower ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🏊 Tower Amenities</h3>
                <EditPencilButton onClick={() => setTowerModal('amenities')} />
              </div>
              {tower.amenities?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tower.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span className="leading-none">{amenityIcon(a)}</span> {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No amenities added yet.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🧱 Specifications</h3>
                <EditPencilButton onClick={() => setTowerModal('specs')} />
              </div>
              {Object.values(tower.specifications || {}).some(Boolean) ? (
                <dl className="space-y-2 text-sm">
                  {Object.entries({
                    Structure: tower.specifications?.structure, Flooring: tower.specifications?.flooring, Kitchen: tower.specifications?.kitchen,
                    Bathroom: tower.specifications?.bathroom, Doors: tower.specifications?.doors, Windows: tower.specifications?.windows,
                    Electrical: tower.specifications?.electrical, Plumbing: tower.specifications?.plumbing, Paint: tower.specifications?.paint,
                  }).filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{value}</dd></div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-gray-400">No specifications added yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">No tower profile yet for Tower {block}</p>
            <p className="text-xs text-gray-400 mb-3">Create a tower profile to set amenities and specifications for this block.</p>
            <Link
              to={`/projects/${projectId}/towers/add?name=${encodeURIComponent(block)}`}
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Create Tower Profile
            </Link>
          </div>
        )}
      </div>

      {tower && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">Tower Configuration</h3>
              <p className="text-sm text-gray-500 mt-0.5">Update name, floors, lifts, features, documents, and assigned team.</p>
            </div>
            <Link
              to={`/projects/${projectId}/towers/${tower._id}/edit`}
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shrink-0"
            >
              ✏️ Edit Tower
            </Link>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-800 mb-1">Danger Zone</h3>
            <p className="text-sm text-red-600 mb-3">Deleting a tower permanently removes it. This cannot be undone.</p>
            <button
              type="button"
              onClick={handleDeleteTower}
              disabled={deletingTower}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletingTower ? 'Deleting...' : confirmDeleteTower ? 'Click again to confirm delete' : 'Delete Tower'}
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {towerModal === 'amenities' && tower && (
        <EditTowerAmenitiesModal towerId={tower._id} tower={tower} onClose={() => setTowerModal(null)} onSaved={setTower} />
      )}
      {towerModal === 'specs' && tower && (
        <EditTowerSpecificationsModal towerId={tower._id} tower={tower} onClose={() => setTowerModal(null)} onSaved={setTower} />
      )}

      {tab === 'flats' && (
        <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
        <span className="text-sm text-gray-400">{filtered.length} flat{filtered.length !== 1 ? 's' : ''}</span>

        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'cards' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⊞ Cards
          </button>
          <button
            onClick={() => setView('compact')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'compact' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ☰ Compact
          </button>
        </div>
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

      {/* Units */}
      {units.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-600 font-medium mb-1">No flats in Tower {block} yet</p>
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
      ) : view === 'cards' ? (
        <div className="space-y-5">
          {floors.map(floor => (
            <div key={floor}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Floor {floor}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered
                  .filter(u => u.floor === floor)
                  .sort((a, b) => String(a.unitNo).localeCompare(String(b.unitNo), undefined, { numeric: true }))
                  .map(u => <FlatCard key={u._id} unit={u} onEdit={setEditingUnit} />)}
              </div>
            </div>
          ))}
        </div>
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
                      <div key={u._id} className="inline-flex items-center gap-1">
                        <Link
                          to={`/units/${u._id}`}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}
                          title={`${u.bhkType}${u.carpetArea ? ' · ' + u.carpetArea + ' sqft' : ''}${u.basePrice ? ' · ₹' + (u.basePrice / 100000).toFixed(1) + 'L' : ''}`}
                        >
                          {u.unitNo}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingUnit(u)}
                          title="Edit Flat"
                          className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                        >
                          ✏️
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {editingUnit && (
        <EditUnitModal
          projectId={projectId}
          unit={editingUnit}
          bhkTypeOptions={project?.bhkTypes}
          onClose={() => setEditingUnit(null)}
          onSaved={handleUnitSaved}
        />
      )}
    </div>
  )
}
