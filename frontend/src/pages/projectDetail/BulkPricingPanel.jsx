import { useMemo, useState } from 'react'
import api from '../../api/axios'

const inputCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-full'

export default function BulkPricingPanel({ towers, bhkTypes, units, onUpdated }) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState('tower')
  const [tower, setTower] = useState(towers[0] || '')
  const [floorFrom, setFloorFrom] = useState('')
  const [floorTo, setFloorTo] = useState('')
  const [bhk, setBhk] = useState(bhkTypes[0] || '')
  const [pricePerSqft, setPricePerSqft] = useState('')
  const [floorRise, setFloorRise] = useState('')
  const [plc, setPlc] = useState('')
  const [parkingCharges, setParkingCharges] = useState('')
  const [clubCharges, setClubCharges] = useState('')
  const [otherCharges, setOtherCharges] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const matchingUnits = useMemo(() => {
    if (scope === 'tower') return units.filter((u) => u.block === tower)
    if (scope === 'floorRange') {
      const from = Number(floorFrom)
      const to = Number(floorTo)
      if (!from || !to) return []
      return units.filter((u) => u.floor >= from && u.floor <= to)
    }
    if (scope === 'bhk') return units.filter((u) => u.bhkType === bhk)
    return []
  }, [scope, tower, floorFrom, floorTo, bhk, units])

  const fields = { pricePerSqft, floorRise, plc, parkingCharges, clubCharges, otherCharges }
  const hasAnyField = Object.values(fields).some((v) => v !== '')

  const submit = async () => {
    if (matchingUnits.length === 0 || !hasAnyField || busy) return
    setBusy(true)
    setMessage('')
    try {
      const payload = { unitIds: matchingUnits.map((u) => u._id) }
      Object.entries(fields).forEach(([key, value]) => { if (value !== '') payload[key] = value })
      const res = await api.post('/units/bulk-update', payload)
      setMessage(res.data?.message || 'Prices updated')
      onUpdated?.()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply pricing')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <h3 className="font-semibold text-gray-800">💰 Bulk Pricing</h3>
        <span className="text-xs text-primary-600 font-medium">{open ? 'Hide' : 'Open'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Apply To</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[['tower', 'A Tower'], ['floorRange', 'Floor Range'], ['bhk', 'BHK Type']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScope(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    scope === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {scope === 'tower' && (
              <select value={tower} onChange={(e) => setTower(e.target.value)} className={inputCls}>
                {towers.map((t) => <option key={t} value={t}>Tower {t}</option>)}
              </select>
            )}
            {scope === 'floorRange' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="From floor" value={floorFrom} onChange={(e) => setFloorFrom(e.target.value)} className={inputCls} />
                <input type="number" placeholder="To floor" value={floorTo} onChange={(e) => setFloorTo(e.target.value)} className={inputCls} />
              </div>
            )}
            {scope === 'bhk' && (
              <select value={bhk} onChange={(e) => setBhk(e.target.value)} className={inputCls}>
                {bhkTypes.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Price / Sq.ft (₹)</label>
              <input type="number" value={pricePerSqft} onChange={(e) => setPricePerSqft(e.target.value)} className={inputCls} placeholder="7200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Floor Rise (₹)</label>
              <input type="number" value={floorRise} onChange={(e) => setFloorRise(e.target.value)} className={inputCls} placeholder="50000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">PLC (₹)</label>
              <input type="number" value={plc} onChange={(e) => setPlc(e.target.value)} className={inputCls} placeholder="100000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Parking Charges (₹)</label>
              <input type="number" value={parkingCharges} onChange={(e) => setParkingCharges(e.target.value)} className={inputCls} placeholder="400000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Club Charges (₹)</label>
              <input type="number" value={clubCharges} onChange={(e) => setClubCharges(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Other Charges (₹)</label>
              <input type="number" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value)} className={inputCls} />
            </div>
          </div>

          <p className="text-xs text-gray-500">{matchingUnits.length} unit{matchingUnits.length !== 1 ? 's' : ''} match this scope.</p>

          {message && <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{message}</div>}

          <button
            type="button"
            disabled={matchingUnits.length === 0 || !hasAnyField || busy}
            onClick={submit}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {busy ? 'Applying...' : `Apply to ${matchingUnits.length} Unit${matchingUnits.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
