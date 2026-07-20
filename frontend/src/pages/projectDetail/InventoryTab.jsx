import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatPrice } from './shared'
import BulkCreateFlatsPanel from './BulkCreateFlatsPanel'
import BulkPricingPanel from './BulkPricingPanel'

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-500',
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
  const [filters, setFilters] = useState({ floor: '', bhk: '', status: '', minPrice: '', maxPrice: '' })
  const [selected, setSelected] = useState(new Set())
  const [priceInput, setPriceInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedTowers, setExpandedTowers] = useState(new Set())

  const towers = useMemo(() => [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])].sort(), [units, project.blocks])
  const floors = useMemo(() => [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b), [units])
  const bhkTypes = useMemo(() => [...new Set(units.map((u) => u.bhkType))].sort(), [units])

  const matchesFilters = (u) => {
    if (filters.floor && String(u.floor) !== filters.floor) return false
    if (filters.bhk && u.bhkType !== filters.bhk) return false
    if (filters.status && u.status !== filters.status) return false
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
      onUnitsChanged?.()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Bulk update failed')
    } finally {
      setBusy(false)
    }
  }

  const clearFilters = () => setFilters({ floor: '', bhk: '', status: '', minPrice: '', maxPrice: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select value={filters.floor} onChange={(e) => setFilters((f) => ({ ...f, floor: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Floors</option>
            {floors.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filters.bhk} onChange={(e) => setFilters((f) => ({ ...f, bhk: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All BHK</option>
            {bhkTypes.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Status</option>
            {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="number" placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="w-28 text-sm border border-gray-200 rounded-lg px-3 py-2" />
          <input type="number" placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="w-28 text-sm border border-gray-200 rounded-lg px-3 py-2" />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-800 underline">Clear filters</button>
          )}
          <button onClick={() => exportCsv(filtered)} className="ml-auto text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            ⭳ Export CSV
          </button>
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
          <button disabled={busy} onClick={() => runBulkAction({ status: 'Registered', note: 'Bulk marked sold' })} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            Mark Sold
          </button>
          <button disabled={busy} onClick={() => runBulkAction({ status: 'Reserved', note: 'Bulk blocked' })} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50">
            Block Units
          </button>
          <div className="flex items-center gap-1.5">
            <input type="number" placeholder="New price" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-28 text-xs border border-gray-200 rounded-lg px-2 py-1.5" />
            <button
              disabled={busy || !priceInput}
              onClick={() => runBulkAction({ basePrice: priceInput })}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Update Price
            </button>
          </div>
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
                      <Link to={`/projects/${id}/units/add?block=${encodeURIComponent(group.tower)}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        + Add Unit to Tower {group.tower}
                      </Link>
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
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Price</th>
                              <th className="text-left px-2 py-2 font-semibold text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {group.filteredUnits.map((u) => (
                              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2"><input type="checkbox" checked={selected.has(u._id)} onChange={() => toggleSelect(u._id)} /></td>
                                <td className="px-2 py-2">
                                  <Link to={`/units/${u._id}`} className="font-medium text-gray-900 hover:text-primary-600">{u.unitNo}</Link>
                                </td>
                                <td className="px-2 py-2 text-gray-600">{u.floor}</td>
                                <td className="px-2 py-2 text-gray-600">{u.bhkType}</td>
                                <td className="px-2 py-2 text-gray-600">{u.carpetArea ? `${u.carpetArea} sqft` : '—'}</td>
                                <td className="px-2 py-2 text-gray-600">{u.basePrice ? formatPrice(u.basePrice) : '—'}</td>
                                <td className="px-2 py-2">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status] || 'bg-gray-100'}`}>{u.status}</span>
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
          to={`/projects/${id}/units/add`}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          + Add Unit
        </Link>
        <Link
          to={`/projects/${id}/towers/add`}
          className="inline-flex items-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
        >
          + Add Tower
        </Link>
      </div>

      <BulkCreateFlatsPanel id={id} towers={towers} onCreated={onUnitsChanged} />
      {towers.length > 0 && <BulkPricingPanel towers={towers} bhkTypes={bhkTypes} units={units} onUpdated={onUnitsChanged} />}
    </div>
  )
}
