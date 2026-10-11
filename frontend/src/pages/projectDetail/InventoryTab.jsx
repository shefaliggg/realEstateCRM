import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatPrice, KpiCard } from './shared'
import BulkCreateFlatsPanel from './BulkCreateFlatsPanel'
import BulkPricingPanel from './BulkPricingPanel'
import { Modal } from './editShared'
import UnitDrawer from './UnitDrawer'
import AddUnitModal from './AddUnitModal'
import UnitCustomerModal from './UnitCustomerModal'

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-500',
}

const STATUS_OPTIONS = ['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled']

const STATUS_PILLS = [
  ['', 'All'],
  ['Available', 'Available'],
  ['Reserved', 'Reserved'],
  ['Sold', 'Sold'],
  ['Blocked', 'Blocked'],
]

function unitMatchesStatusPill(unit, pill) {
  if (!pill) return true
  if (pill === 'Sold') return unit.status === 'Booked' || unit.status === 'Registered'
  if (pill === 'Blocked') return unit.status === 'Cancelled'
  return unit.status === pill
}

function exportCsv(units) {
  const header = ['Unit', 'Tower', 'Floor', 'BHK', 'Area', 'Price', 'Status']
  const rows = units.map((u) => [u.unitNo, u.block, u.floor, u.bhkType, u.carpetArea || '', u.basePrice || '', u.status])
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventory.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function InventoryTab({ id, project, units, onUnitsChanged }) {
  const [filters, setFilters] = useState({ search: '', floor: '', bhk: '', status: '', minPrice: '', maxPrice: '' })
  const [selected, setSelected] = useState(new Set())
  const [statusChange, setStatusChange] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedTowers, setExpandedTowers] = useState(new Set())
  const [openModal, setOpenModal] = useState(null)
  const [pricingSelection, setPricingSelection] = useState(null)
  const [drawerUnit, setDrawerUnit] = useState(null)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [addUnitBlock, setAddUnitBlock] = useState('')
  const [statusBusyId, setStatusBusyId] = useState(null)
  const [customerPrompt, setCustomerPrompt] = useState(null)

  const towers = useMemo(() => [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])].sort(), [units, project.blocks])
  const floors = useMemo(() => [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b), [units])
  const bhkTypes = useMemo(() => [...new Set(units.map((u) => u.bhkType))].sort(), [units])

  const summary = useMemo(() => {
    const total = units.length
    const available = units.filter((u) => u.status === 'Available').length
    const reserved = units.filter((u) => u.status === 'Reserved').length
    const sold = units.filter((u) => u.status === 'Booked' || u.status === 'Registered').length
    const blocked = units.filter((u) => u.status === 'Cancelled').length
    return { total, available, reserved, sold, blocked }
  }, [units])

  const matchesFilters = (u) => {
    if (filters.search) {
      const q = filters.search.trim().toLowerCase()
      if (!u.unitNo?.toLowerCase().includes(q) && !u.block?.toLowerCase().includes(q)) return false
    }
    if (filters.floor && String(u.floor) !== filters.floor) return false
    if (filters.bhk && u.bhkType !== filters.bhk) return false
    if (!unitMatchesStatusPill(u, filters.status)) return false
    if (filters.minPrice && (u.basePrice || 0) < Number(filters.minPrice)) return false
    if (filters.maxPrice && (u.basePrice || 0) > Number(filters.maxPrice)) return false
    return true
  }

  const towerGroups = useMemo(() => {
    const map = {}
    ;(project.blocks || []).forEach((b) => { map[b] = { tower: b, allUnits: [], floors: new Set() } })
    units.forEach((u) => {
      const key = u.block || 'Unspecified'
      if (!map[key]) map[key] = { tower: key, allUnits: [], floors: new Set() }
      map[key].allUnits.push(u)
      map[key].floors.add(u.floor)
    })
    return Object.values(map)
      .map((g) => ({
        tower: g.tower,
        floors: g.floors.size,
        total: g.allUnits.length,
        available: g.allUnits.filter((u) => u.status === 'Available').length,
        filteredUnits: g.allUnits.filter(matchesFilters).sort((a, b) => a.floor - b.floor || a.unitNo.localeCompare(b.unitNo)),
      }))
      .sort((a, b) => a.tower.localeCompare(b.tower))
  }, [units, project.blocks, filters])

  const filtered = towerGroups.flatMap((g) => g.filteredUnits)
  const selectedUnits = units.filter((u) => selected.has(u._id))

  const toggleTower = (tower) => {
    setExpandedTowers((prev) => {
      const next = new Set(prev)
      next.has(tower) ? next.delete(tower) : next.add(tower)
      return next
    })
  }

  const toggleSelect = (unitId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(unitId) ? next.delete(unitId) : next.add(unitId)
      return next
    })
  }
  const toggleSelectAllFiltered = () => {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((u) => u._id))))
  }

  const runBulkAction = async (payload) => {
    if (selected.size === 0 || busy) return
    setBusy(true)
    setMessage('')
    try {
      const res = await api.post('/units/bulk-update', { unitIds: [...selected], ...payload })
      setMessage(res.data?.message || 'Updated')
      setSelected(new Set())
      setStatusChange('')
      onUnitsChanged?.()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Bulk update failed')
    } finally {
      setBusy(false)
    }
  }

  const applyUnitStatus = async (unit, status, extra = {}) => {
    setStatusBusyId(unit._id)
    try {
      await api.put(`/projects/${id}/units/${unit._id}`, { status, ...extra })
      onUnitsChanged?.()
    } finally {
      setStatusBusyId(null)
    }
  }

  const changeUnitStatus = async (unit, status) => {
    if (!status || status === unit.status || statusBusyId === unit._id) return
    if (status === 'Reserved' || status === 'Booked') {
      setCustomerPrompt({ unit, status })
      return
    }
    try {
      await applyUnitStatus(unit, status)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status')
    }
  }

  const openAddUnit = (blockName = '') => {
    setAddUnitBlock(blockName)
    setShowAddUnit(true)
  }

  const openBulkPricing = (scopeToSelection) => {
    setPricingSelection(scopeToSelection ? [...selected] : null)
    setOpenModal('pricing')
  }

  const clearFilters = () => setFilters({ search: '', floor: '', bhk: '', status: '', minPrice: '', maxPrice: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => openAddUnit('')} className="text-sm font-medium px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
            + Add Unit
          </button>
          {towers.length > 0 && (
            <button onClick={() => setOpenModal('create')} className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              ⭐ Bulk Create
            </button>
          )}
          {towers.length > 0 && (
            <button onClick={() => openBulkPricing(false)} className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              💰 Bulk Pricing
            </button>
          )}
          <button onClick={() => exportCsv(filtered)} className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            ⭳ Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiCard label="Total Units" value={summary.total} />
        <KpiCard label="Available" value={summary.available} tone="text-green-600" />
        <KpiCard label="Reserved" value={summary.reserved} tone="text-yellow-600" />
        <KpiCard label="Sold" value={summary.sold} tone="text-blue-600" />
        <KpiCard label="Blocked" value={summary.blocked} tone="text-red-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="🔍 Search unit / tower"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="flex-1 min-w-[180px] text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          />
          <select value={filters.floor} onChange={(e) => setFilters((f) => ({ ...f, floor: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Floors</option>
            {floors.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filters.bhk} onChange={(e) => setFilters((f) => ({ ...f, bhk: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All BHK</option>
            {bhkTypes.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="number" placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="w-28 text-sm border border-gray-200 rounded-lg px-3 py-2" />
          <input type="number" placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="w-28 text-sm border border-gray-200 rounded-lg px-3 py-2" />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-800 underline">Clear filters</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_PILLS.map(([key, label]) => (
            <button
              key={key || 'all'}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, status: key }))}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                filters.status === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              {label} {key === '' ? summary.total : summary[key.toLowerCase()]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleSelectAllFiltered} />
          Select all {filtered.length} matching unit{filtered.length !== 1 ? 's' : ''}
        </label>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary-50 border border-primary-100 p-3">
          <span className="text-sm font-medium text-primary-700">{selected.size} selected</span>
          <div className="flex items-center gap-1.5">
            <select value={statusChange} onChange={(e) => setStatusChange(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="">Change status to...</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              disabled={busy || !statusChange}
              onClick={() => runBulkAction({ status: statusChange, note: 'Bulk status change' })}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          <button disabled={busy} onClick={() => openBulkPricing(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            Bulk Price
          </button>
          <button onClick={() => exportCsv(selectedUnits)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            Export Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-500 hover:text-gray-800 underline">Clear selection</button>
        </div>
      )}

      {message && <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600">{message}</div>}

      {towerGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No towers added yet — add one below.
        </div>
      ) : (
        <div className="space-y-2">
          {towerGroups.map((group) => {
            const expanded = expandedTowers.has(group.tower)
            return (
              <div key={group.tower} className="rounded-lg border border-gray-100 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => toggleTower(group.tower)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium text-gray-800 truncate">Tower {group.tower}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span>{group.floors} floors</span>
                    <span>{group.total} units</span>
                    <span className="text-green-600 font-medium">{group.available} available</span>
                    {hasFilters && <span className="text-primary-600 font-medium">{group.filteredUnits.length} match</span>}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-gray-100">
                    <div className="flex items-center justify-end px-3 pt-2">
                      <button type="button" onClick={() => openAddUnit(group.tower)} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        + Add Unit to Tower {group.tower}
                      </button>
                    </div>
                    {group.filteredUnits.length === 0 ? (
                      <p className="text-xs text-gray-400 px-3 py-3">No units match{hasFilters ? ' these filters' : ''} in this tower.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                              <th className="w-10 px-3 py-2"></th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Unit</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Floor</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">BHK</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Area</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Facing</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Price</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {group.filteredUnits.map((u) => (
                              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2"><input type="checkbox" checked={selected.has(u._id)} onChange={() => toggleSelect(u._id)} /></td>
                                <td className="px-2 py-2">
                                  <button type="button" onClick={() => setDrawerUnit(u)} className="font-medium text-gray-900 hover:text-primary-600">{u.unitNo}</button>
                                </td>
                                <td className="px-2 py-2 text-gray-600">{u.floor}</td>
                                <td className="px-2 py-2 text-gray-600">{u.bhkType}</td>
                                <td className="px-2 py-2 text-gray-600">{u.carpetArea ? `${u.carpetArea} sqft` : '—'}</td>
                                <td className="px-2 py-2 text-gray-600">{u.facing || '—'}</td>
                                <td className="px-2 py-2 text-gray-600">{u.basePrice ? formatPrice(u.basePrice) : '—'}</td>
                                <td className="px-2 py-2">
                                  <select
                                    value={u.status}
                                    disabled={statusBusyId === u._id}
                                    onChange={(e) => changeUnitStatus(u, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-xs font-medium pl-2 pr-6 py-0.5 rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[u.status] || 'bg-gray-100'}`}
                                  >
                                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  {u.currentCustomer?.name && (
                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[160px]" title={`${u.currentCustomer.name} · ${u.currentCustomer.phone || ''}`}>
                                      👤 {u.currentCustomer.name}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/projects/${id}/towers/add`}
          className="inline-flex items-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add Tower
        </Link>
      </div>

      {openModal === 'create' && (
        <Modal title="Bulk Create Flats" icon="⭐" onClose={() => setOpenModal(null)} wide>
          <BulkCreateFlatsPanel id={id} towers={towers} onCreated={onUnitsChanged} />
        </Modal>
      )}
      {openModal === 'pricing' && (
        <Modal title="Bulk Pricing" icon="💰" onClose={() => { setOpenModal(null); setPricingSelection(null) }} wide>
          <BulkPricingPanel
            towers={towers}
            bhkTypes={bhkTypes}
            units={units}
            onUpdated={onUnitsChanged}
            initialScope={pricingSelection ? 'selection' : undefined}
            selectedUnitIds={pricingSelection || []}
          />
        </Modal>
      )}
      {customerPrompt && (
        <UnitCustomerModal
          projectId={id}
          unit={customerPrompt.unit}
          status={customerPrompt.status}
          onClose={() => setCustomerPrompt(null)}
          onConfirm={async (customerFields) => {
            await applyUnitStatus(customerPrompt.unit, customerPrompt.status, customerFields)
            setCustomerPrompt(null)
          }}
        />
      )}
      {drawerUnit && (
        <UnitDrawer
          unit={drawerUnit}
          projectId={id}
          bhkTypeOptions={bhkTypes}
          onClose={() => setDrawerUnit(null)}
          onChanged={onUnitsChanged}
        />
      )}
      {showAddUnit && (
        <AddUnitModal
          projectId={id}
          project={project}
          block={addUnitBlock}
          onClose={() => setShowAddUnit(false)}
          onCreated={onUnitsChanged}
        />
      )}
    </div>
  )
}
