import { useMemo, useState } from 'react'
import api from '../../api/axios'

const FORMATS = [
  { key: 'plain', label: '101, 102, 103...', example: (t, f, n) => `${f}${String(n).padStart(2, '0')}` },
  { key: 'tower-dash', label: 'A-101, A-102...', example: (t, f, n) => `${t}-${f}${String(n).padStart(2, '0')}` },
  { key: 'tower-padded', label: 'A0101, A0102...', example: (t, f, n) => `${t}${String(f).padStart(2, '0')}${String(n).padStart(2, '0')}` },
]

const BHK_TYPES = ['Studio', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', 'Penthouse']

const inputCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white'

export default function BulkCreateFlatsPanel({ id, towers, onCreated, embedded = false }) {
  const [open, setOpen] = useState(embedded)
  const [tower, setTower] = useState(towers[0] || '')
  const [startFloor, setStartFloor] = useState('1')
  const [endFloor, setEndFloor] = useState('1')
  const [unitsPerFloor, setUnitsPerFloor] = useState('6')
  const [format, setFormat] = useState('tower-dash')
  const [bhkType, setBhkType] = useState('2 BHK')
  const [carpetArea, setCarpetArea] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const formatFn = FORMATS.find((f) => f.key === format)?.example || FORMATS[0].example

  const generated = useMemo(() => {
    const list = []
    const sFloor = Number(startFloor) || 0
    const eFloor = Number(endFloor) || 0
    const perFloor = Number(unitsPerFloor) || 0
    if (!tower || sFloor <= 0 || eFloor < sFloor || perFloor <= 0) return list
    for (let floor = sFloor; floor <= eFloor; floor++) {
      for (let n = 1; n <= perFloor; n++) {
        list.push({
          block: tower,
          floor,
          unitNo: formatFn(tower, floor, n),
          bhkType,
          carpetArea: carpetArea ? Number(carpetArea) : undefined,
          basePrice: basePrice ? Number(basePrice) : undefined,
          status: 'Available',
        })
      }
    }
    return list.slice(0, 1000)
  }, [tower, startFloor, endFloor, unitsPerFloor, format, bhkType, carpetArea, basePrice])

  const submit = async () => {
    if (generated.length === 0 || busy) return
    setBusy(true)
    setMessage('')
    try {
      const res = await api.post(`/projects/${id}/units/bulk-create`, { units: generated })
      setMessage(res.data?.message || `${generated.length} units created`)
      onCreated?.()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate units')
    } finally {
      setBusy(false)
    }
  }

  if (towers.length === 0) {
    return null
  }

  const form = (
    <div className={embedded ? 'space-y-4' : 'mt-4 space-y-4'}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tower</label>
              <select value={tower} onChange={(e) => setTower(e.target.value)} className={`${inputCls} w-full`}>
                {towers.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Starting Floor</label>
              <input type="number" value={startFloor} onChange={(e) => setStartFloor(e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ending Floor</label>
              <input type="number" value={endFloor} onChange={(e) => setEndFloor(e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Units Per Floor</label>
              <input type="number" value={unitsPerFloor} onChange={(e) => setUnitsPerFloor(e.target.value)} className={`${inputCls} w-full`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Flat Number Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormat(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    format === f.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Default BHK Type</label>
              <select value={bhkType} onChange={(e) => setBhkType(e.target.value)} className={`${inputCls} w-full`}>
                {BHK_TYPES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Default Carpet Area (sqft)</label>
              <input type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} className={`${inputCls} w-full`} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Default Base Price (₹)</label>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={`${inputCls} w-full`} placeholder="Optional" />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Preview ({generated.length} unit{generated.length !== 1 ? 's' : ''} will be created)</p>
            {generated.length === 0 ? (
              <p className="text-xs text-gray-400">Fill in tower, floor range, and units per floor to preview.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {generated.slice(0, 12).map((u) => (
                  <span key={u.unitNo} className="text-[11px] font-medium px-2 py-1 rounded bg-white border border-gray-200 text-gray-700">{u.unitNo}</span>
                ))}
                {generated.length > 12 && <span className="text-[11px] text-gray-400 self-center">+{generated.length - 12} more</span>}
              </div>
            )}
          </div>

          {message && <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">{message}</div>}

          <button
            type="button"
            disabled={generated.length === 0 || busy}
            onClick={submit}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {busy ? 'Generating...' : `Generate ${generated.length} Unit${generated.length !== 1 ? 's' : ''}`}
          </button>
    </div>
  )

  if (embedded) return form

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <h3 className="font-semibold text-gray-800">⭐ Bulk Create Flats</h3>
        <span className="text-xs text-primary-600 font-medium">{open ? 'Hide' : 'Open'}</span>
      </button>
      {open && form}
    </div>
  )
}
