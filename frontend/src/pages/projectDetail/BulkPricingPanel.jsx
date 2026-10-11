import { useMemo, useState } from 'react'
import api from '../../api/axios'
import { formatPrice } from './shared'

const inputCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-full'

const METHODS = [
  { key: 'set', label: 'Set Price', placeholder: '1,25,00,000' },
  { key: 'perSqft', label: 'Price / Sq.Ft', placeholder: '7200' },
  { key: 'increasePct', label: 'Increase by %', placeholder: '5' },
  { key: 'increaseAmt', label: 'Increase by Amount', placeholder: '5,00,000' },
  { key: 'decreasePct', label: 'Decrease by %', placeholder: '5' },
]

const CHARGE_FIELDS = [
  ['floorRise', 'Floor Rise (₹)'],
  ['plc', 'PLC (₹)'],
  ['parkingCharges', 'Parking Charges (₹)'],
  ['clubCharges', 'Club Charges (₹)'],
  ['otherCharges', 'Other Charges (₹)'],
]

function projectedBasePrice(unit, method, value) {
  const v = Number(value)
  if (value === '' || Number.isNaN(v)) return Number(unit.basePrice) || 0
  const current = Number(unit.basePrice) || 0
  if (method === 'set') return v
  if (method === 'perSqft') return v * (Number(unit.carpetArea) || 0)
  if (method === 'increasePct') return current * (1 + v / 100)
  if (method === 'decreasePct') return current * (1 - v / 100)
  if (method === 'increaseAmt') return current + v
  return current
}

function currentTotal(unit) {
  return Number(unit.totalPrice) || (Number(unit.basePrice) || 0) + (Number(unit.plc) || 0) + (Number(unit.floorRise) || 0) +
    (Number(unit.parkingCharges) || 0) + (Number(unit.clubCharges) || 0) + (Number(unit.otherCharges) || 0)
}

// Always used inside a Modal (InventoryTab.jsx) — this is the modal's content, not a standalone card.
export default function BulkPricingPanel({ towers, bhkTypes, units, onUpdated, initialScope, selectedUnitIds = [] }) {
  const [step, setStep] = useState('config')
  const [scope, setScope] = useState(initialScope || 'tower')
  const [tower, setTower] = useState(towers[0] || '')
  const [floorFrom, setFloorFrom] = useState('')
  const [floorTo, setFloorTo] = useState('')
  const [bhk, setBhk] = useState(bhkTypes[0] || '')
  const [method, setMethod] = useState('increasePct')
  const [value, setValue] = useState('')
  const [charges, setCharges] = useState({ floorRise: '', plc: '', parkingCharges: '', clubCharges: '', otherCharges: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const matchingUnits = useMemo(() => {
    if (scope === 'selection') return units.filter((u) => selectedUnitIds.includes(u._id))
    if (scope === 'tower') return units.filter((u) => u.block === tower)
    if (scope === 'floorRange') {
      const from = Number(floorFrom)
      const to = Number(floorTo)
      if (!from || !to) return []
      return units.filter((u) => u.floor >= from && u.floor <= to)
    }
    if (scope === 'bhk') return units.filter((u) => u.bhkType === bhk)
    return []
  }, [scope, tower, floorFrom, floorTo, bhk, units, selectedUnitIds])

  const hasAnyField = value !== '' || Object.values(charges).some((v) => v !== '')

  const projectedTotal = (unit) => {
    const base = projectedBasePrice(unit, method, value)
    const chargeValue = (key) => (charges[key] !== '' ? Number(charges[key]) : (Number(unit[key]) || 0))
    return base + CHARGE_FIELDS.reduce((sum, [key]) => sum + chargeValue(key), 0)
  }

  const submit = async () => {
    if (matchingUnits.length === 0 || !hasAnyField || busy) return
    setBusy(true)
    setMessage('')
    try {
      const payload = { unitIds: matchingUnits.map((u) => u._id) }
      if (value !== '') {
        if (method === 'set') payload.basePrice = value
        else { payload.priceMethod = method; payload.priceValue = value }
      }
      Object.entries(charges).forEach(([key, v]) => { if (v !== '') payload[key] = v })
      const res = await api.post('/units/bulk-update', payload)
      setMessage(res.data?.message || 'Prices updated')
      onUpdated?.()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply pricing')
    } finally {
      setBusy(false)
    }
  }

  const scopeOptions = [
    ...(selectedUnitIds.length > 0 ? [['selection', `Selected (${selectedUnitIds.length})`]] : []),
    ['tower', 'Tower'],
    ['floorRange', 'Floor Range'],
    ['bhk', 'BHK Type'],
  ]

  if (step === 'preview') {
    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-500">{matchingUnits.length} unit{matchingUnits.length !== 1 ? 's' : ''} affected</p>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-slate-50 sticky top-0">
                <th className="px-3 py-2 font-semibold">Unit</th>
                <th className="px-3 py-2 font-semibold">Current</th>
                <th className="px-3 py-2 font-semibold">New</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {matchingUnits.map((u) => {
                const before = currentTotal(u)
                const after = projectedTotal(u)
                return (
                  <tr key={u._id}>
                    <td className="px-3 py-1.5 font-medium text-gray-800">{u.block}-{u.unitNo}</td>
                    <td className="px-3 py-1.5 text-gray-600">{formatPrice(before) || '—'}</td>
                    <td className={`px-3 py-1.5 font-medium ${after > before ? 'text-green-600' : after < before ? 'text-red-500' : 'text-gray-600'}`}>{formatPrice(after) || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {message && <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{message}</div>}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={matchingUnits.length === 0 || !hasAnyField || busy}
            onClick={submit}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {busy ? 'Applying...' : `Apply Pricing`}
          </button>
          <button type="button" onClick={() => setStep('config')} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Apply To</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {scopeOptions.map(([key, label]) => (
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

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pricing Method</label>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <label key={m.key} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="priceMethod" checked={method === m.key} onChange={() => setMethod(m.key)} className="accent-primary-600" />
              <span className="text-sm text-gray-700 w-40 shrink-0">{m.label}</span>
              {method === m.key && (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={m.placeholder}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white w-40"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Charges</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CHARGE_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
              <input type="number" value={charges[key]} onChange={(e) => setCharges((c) => ({ ...c, [key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">{matchingUnits.length} unit{matchingUnits.length !== 1 ? 's' : ''} match this scope.</p>

      <button
        type="button"
        disabled={matchingUnits.length === 0 || !hasAnyField}
        onClick={() => setStep('preview')}
        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
      >
        Preview {matchingUnits.length} Unit{matchingUnits.length !== 1 ? 's' : ''} →
      </button>
    </div>
  )
}
