import { useState } from 'react'
import api from '../../api/axios'
import { EditModal, Field, inputCls, selectCls } from './editShared'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const BHK_TYPES = ['Studio', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Duplex', 'Penthouse']
const PRICE_KEYS = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges']

export default function AddUnitModal({ projectId, project, block, onClose, onCreated }) {
  const isPlotProject = project?.type === 'Plots'
  const [form, setForm] = useState({
    block: block || (isPlotProject ? 'PLOT' : (project?.blocks?.[0] || '')),
    floor: isPlotProject ? '0' : '', unitNo: '',
    bhkType: isPlotProject ? 'Plot' : (project?.bhkTypes?.[0] || '2 BHK'), facing: '', cornerUnit: false,
    carpetArea: '', builtUpArea: '', superBuiltUpArea: '', balconyArea: '',
    basePrice: '', pricePerSqft: '', plc: '', floorRise: '', parkingCharges: '', clubCharges: '', otherCharges: '',
    parkingIncluded: false, parkingNumber: '',
    possessionStatus: 'Under Construction', status: 'Available',
  })
  const [files, setFiles] = useState({ floorPlan: null, priceSheet: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const totalPricePreview = PRICE_KEYS.some((k) => form[k])
    ? PRICE_KEYS.reduce((sum, k) => sum + (Number(form[k]) || 0), 0)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isPlotProject && !form.unitNo) { setError('Plot number is required'); return }
    if (!isPlotProject && (!form.block || !form.floor || !form.unitNo)) { setError('Tower, floor and unit number are required'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }
      append('block', form.block)
      append('floor', isPlotProject ? 0 : form.floor)
      append('unitNo', form.unitNo)
      append('bhkType', form.bhkType)
      append('facing', form.facing)
      fd.append('cornerUnit', String(form.cornerUnit))
      append('carpetArea', form.carpetArea)
      append('builtUpArea', form.builtUpArea)
      append('superBuiltUpArea', form.superBuiltUpArea)
      append('balconyArea', form.balconyArea)
      append('basePrice', form.basePrice)
      append('pricePerSqft', form.pricePerSqft)
      append('plc', form.plc)
      append('floorRise', form.floorRise)
      append('parkingCharges', form.parkingCharges)
      append('clubCharges', form.clubCharges)
      append('otherCharges', form.otherCharges)
      fd.append('parkingIncluded', String(form.parkingIncluded))
      append('parkingNumber', form.parkingNumber)
      append('possessionStatus', form.possessionStatus)
      append('status', form.status)
      if (files.floorPlan) fd.append('floorPlan', files.floorPlan)
      if (files.priceSheet) fd.append('priceSheet', files.priceSheet)

      await api.post(`/projects/${projectId}/units`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <EditModal
      title={isPlotProject ? 'Add Plot' : `Add Flat${block ? ` — Tower ${block}` : ''}`}
      icon={isPlotProject ? '📍' : '🏠'}
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      error={error}
      wide
      submitLabel={saving ? 'Adding...' : isPlotProject ? 'Add Plot' : 'Add Unit'}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!isPlotProject && (
          <>
            <Field label="Tower">
              {block ? (
                <div className={`${inputCls} bg-gray-50 text-gray-700`}>Tower {block}</div>
              ) : project?.blocks?.length > 0 ? (
                <select value={form.block} onChange={set('block')} className={selectCls}>
                  {project.blocks.map((b) => <option key={b} value={b}>Tower {b}</option>)}
                </select>
              ) : (
                <input value={form.block} onChange={set('block')} className={inputCls} placeholder="A" />
              )}
            </Field>
            <Field label="Floor"><input type="number" value={form.floor} onChange={set('floor')} className={inputCls} placeholder="3" /></Field>
          </>
        )}
        <Field label={isPlotProject ? 'Plot No.' : 'Flat Number'}>
          <input value={form.unitNo} onChange={set('unitNo')} className={inputCls} placeholder={isPlotProject ? 'P-101' : '301'} />
        </Field>
        {!isPlotProject && (
          <Field label="Unit Type">
            <select value={form.bhkType} onChange={set('bhkType')} className={selectCls}>
              {(project?.bhkTypes?.length ? project.bhkTypes : BHK_TYPES).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
        )}
        {!isPlotProject && (
          <Field label="Facing">
            <select value={form.facing} onChange={set('facing')} className={selectCls}>
              <option value="">Select facing...</option>
              {FACING.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
        )}
      </div>

      {!isPlotProject && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.cornerUnit} onChange={(e) => setForm((f) => ({ ...f, cornerUnit: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">This is a corner unit</span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label={isPlotProject ? 'Plot Area (sqyd)' : 'Carpet Area (sqft)'}>
          <input type="number" value={form.carpetArea} onChange={set('carpetArea')} className={inputCls} />
        </Field>
        {!isPlotProject && (
          <>
            <Field label="Built-up Area (sqft)"><input type="number" value={form.builtUpArea} onChange={set('builtUpArea')} className={inputCls} /></Field>
            <Field label="Super Built-up (sqft)"><input type="number" value={form.superBuiltUpArea} onChange={set('superBuiltUpArea')} className={inputCls} /></Field>
            <Field label="Balcony Area (sqft)"><input type="number" value={form.balconyArea} onChange={set('balconyArea')} className={inputCls} /></Field>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Base Price (₹)"><input type="number" value={form.basePrice} onChange={set('basePrice')} className={inputCls} /></Field>
        <Field label="Price / Sq.ft (₹)"><input type="number" value={form.pricePerSqft} onChange={set('pricePerSqft')} className={inputCls} /></Field>
        <Field label="PLC (₹)"><input type="number" value={form.plc} onChange={set('plc')} className={inputCls} /></Field>
        <Field label="Floor Rise (₹)"><input type="number" value={form.floorRise} onChange={set('floorRise')} className={inputCls} /></Field>
        <Field label="Parking Charges (₹)"><input type="number" value={form.parkingCharges} onChange={set('parkingCharges')} className={inputCls} /></Field>
        <Field label="Club Charges (₹)"><input type="number" value={form.clubCharges} onChange={set('clubCharges')} className={inputCls} /></Field>
        <Field label="Other Charges (₹)"><input type="number" value={form.otherCharges} onChange={set('otherCharges')} className={inputCls} /></Field>
      </div>
      {totalPricePreview !== null && (
        <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-primary-700 font-medium">Total Price</span>
          <span className="text-sm font-bold text-primary-800">₹{totalPricePreview.toLocaleString('en-IN')}</span>
        </div>
      )}

      {!isPlotProject && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.parkingIncluded} onChange={(e) => setForm((f) => ({ ...f, parkingIncluded: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
            <span className="text-sm text-gray-600">Parking included with this unit</span>
          </label>
          <Field label="Parking Number"><input value={form.parkingNumber} onChange={set('parkingNumber')} className={inputCls} placeholder="P-104" /></Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sales Status">
          <select value={form.status} onChange={set('status')} className={selectCls}>
            {['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Possession">
          <select value={form.possessionStatus} onChange={set('possessionStatus')} className={selectCls}>
            <option>Under Construction</option>
            <option>Ready</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Floor Plan">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, floorPlan: e.target.files?.[0] || null }))} className="text-sm" />
        </Field>
        <Field label="Price Sheet">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, priceSheet: e.target.files?.[0] || null }))} className="text-sm" />
        </Field>
      </div>
    </EditModal>
  )
}
