import { useState } from 'react'
import api from '../../api/axios'
import { EditModal, Field, inputCls, selectCls } from './editShared'
import { COMMERCIAL_UNIT_TYPES } from './shared'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const FURNISHING_OPTIONS = ['Bare shell', 'Warm shell', 'Semi-furnished', 'Furnished', 'Plug & play']
const PRICE_KEYS = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'otherCharges']

// Commercial projects have no towers, so every unit is stored under a single fixed block
const COMMERCIAL_BLOCK = 'COMMERCIAL'

export default function AddCommercialModal({ projectId, project, block = '', onClose, onCreated }) {
  // Mixed use projects place commercial units inside towers, and their bhkTypes also hold BHK configs
  const isMixedUseProject = project?.type === 'Mixed Use'
  const projectTypes = (project?.bhkTypes || []).filter((t) => !isMixedUseProject || COMMERCIAL_UNIT_TYPES.includes(t))
  const unitTypeOptions = projectTypes.length ? projectTypes : COMMERCIAL_UNIT_TYPES
  const [form, setForm] = useState({
    block: block || project?.blocks?.[0] || '',
    floor: '', unitNo: '',
    bhkType: unitTypeOptions[0], facing: '', cornerUnit: false,
    carpetArea: '', builtUpArea: '', superBuiltUpArea: '',
    frontage: '', ceilingHeight: '', powerLoad: '', bathrooms: '', parkingSpaces: '',
    furnishingStatus: 'Bare shell', pantry: false,
    basePrice: '', pricePerSqft: '', plc: '', floorRise: '', parkingCharges: '', otherCharges: '', maintenancePerSqft: '',
    parkingIncluded: false, parkingNumber: '',
    possessionStatus: 'Under Construction', status: 'Available',
  })
  const [files, setFiles] = useState({ floorPlan: null, priceSheet: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggle = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const totalPricePreview = PRICE_KEYS.some((k) => form[k])
    ? PRICE_KEYS.reduce((sum, k) => sum + (Number(form[k]) || 0), 0)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isMixedUseProject && !form.block.trim()) { setError('Tower is required'); return }
    if (form.floor === '' || !form.unitNo.trim()) { setError('Floor and unit number are required'); return }
    if (!form.carpetArea) { setError('Carpet area is required'); return }
    if (Number(form.carpetArea) <= 0) { setError('Carpet area must be greater than 0'); return }

    setSaving(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }
      append('block', isMixedUseProject ? form.block.trim() : COMMERCIAL_BLOCK)
      append('unitCategory', 'Commercial')
      append('floor', form.floor)
      append('unitNo', form.unitNo.trim())
      append('bhkType', form.bhkType)
      append('facing', form.facing)
      fd.append('cornerUnit', String(form.cornerUnit))
      append('carpetArea', form.carpetArea)
      append('builtUpArea', form.builtUpArea)
      append('superBuiltUpArea', form.superBuiltUpArea)
      append('frontage', form.frontage)
      append('ceilingHeight', form.ceilingHeight)
      append('powerLoad', form.powerLoad)
      append('bathrooms', form.bathrooms)
      append('parkingSpaces', form.parkingSpaces)
      append('furnishingStatus', form.furnishingStatus)
      fd.append('pantry', String(form.pantry))
      append('basePrice', form.basePrice)
      append('pricePerSqft', form.pricePerSqft)
      append('plc', form.plc)
      append('floorRise', form.floorRise)
      append('parkingCharges', form.parkingCharges)
      append('otherCharges', form.otherCharges)
      append('maintenancePerSqft', form.maintenancePerSqft)
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
      setError(err.response?.data?.message || 'Failed to create commercial unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <EditModal
      title={`Add Commercial Unit${isMixedUseProject && block ? ` — Tower ${block}` : ''}`}
      icon="🏬"
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      error={error}
      wide
      submitLabel={saving ? 'Adding...' : 'Add Commercial'}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isMixedUseProject && (
          <Field label="Tower *">
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
        )}
        <Field label="Unit / Shop Number *">
          <input value={form.unitNo} onChange={set('unitNo')} className={inputCls} placeholder="S-012" />
        </Field>
        <Field label="Floor *">
          <input type="number" min="0" value={form.floor} onChange={set('floor')} className={inputCls} placeholder="0 = Ground" />
        </Field>
        <Field label="Unit Type">
          <select value={form.bhkType} onChange={set('bhkType')} className={selectCls}>
            {unitTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Facing">
          <select value={form.facing} onChange={set('facing')} className={selectCls}>
            <option value="">Select facing...</option>
            {FACING.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.cornerUnit} onChange={toggle('cornerUnit')} className="w-4 h-4 accent-primary-600" />
        <span className="text-sm text-gray-600">This is a corner unit</span>
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Carpet Area (sqft) *"><input type="number" min="0" value={form.carpetArea} onChange={set('carpetArea')} className={inputCls} placeholder="850" /></Field>
        <Field label="Built-up Area (sqft)"><input type="number" min="0" value={form.builtUpArea} onChange={set('builtUpArea')} className={inputCls} /></Field>
        <Field label="Super Built-up (sqft)"><input type="number" min="0" value={form.superBuiltUpArea} onChange={set('superBuiltUpArea')} className={inputCls} /></Field>
        <Field label="Frontage (ft)"><input type="number" min="0" value={form.frontage} onChange={set('frontage')} className={inputCls} placeholder="20" /></Field>
        <Field label="Ceiling Height (ft)"><input type="number" min="0" step="0.1" value={form.ceilingHeight} onChange={set('ceilingHeight')} className={inputCls} placeholder="14" /></Field>
        <Field label="Power Load (kVA)"><input type="number" min="0" value={form.powerLoad} onChange={set('powerLoad')} className={inputCls} placeholder="10" /></Field>
        <Field label="Washrooms"><input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} className={inputCls} /></Field>
        <Field label="Parking Spaces"><input type="number" min="0" value={form.parkingSpaces} onChange={set('parkingSpaces')} className={inputCls} /></Field>
        <Field label="Furnishing">
          <select value={form.furnishingStatus} onChange={set('furnishingStatus')} className={selectCls}>
            {FURNISHING_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.pantry} onChange={toggle('pantry')} className="w-4 h-4 accent-primary-600" />
        <span className="text-sm text-gray-600">Private pantry included</span>
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Base Price (₹)"><input type="number" min="0" value={form.basePrice} onChange={set('basePrice')} className={inputCls} /></Field>
        <Field label="Price / Sq.ft (₹)"><input type="number" min="0" value={form.pricePerSqft} onChange={set('pricePerSqft')} className={inputCls} /></Field>
        <Field label="PLC (₹)"><input type="number" min="0" value={form.plc} onChange={set('plc')} className={inputCls} /></Field>
        <Field label="Floor Rise (₹)"><input type="number" min="0" value={form.floorRise} onChange={set('floorRise')} className={inputCls} /></Field>
        <Field label="Parking Charges (₹)"><input type="number" min="0" value={form.parkingCharges} onChange={set('parkingCharges')} className={inputCls} /></Field>
        <Field label="Other Charges (₹)"><input type="number" min="0" value={form.otherCharges} onChange={set('otherCharges')} className={inputCls} /></Field>
        <Field label="Maintenance / Sq.ft / month (₹)"><input type="number" min="0" value={form.maintenancePerSqft} onChange={set('maintenancePerSqft')} className={inputCls} /></Field>
      </div>
      {totalPricePreview !== null && (
        <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-primary-700 font-medium">Total Price</span>
          <span className="text-sm font-bold text-primary-800">₹{totalPricePreview.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.parkingIncluded} onChange={toggle('parkingIncluded')} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">Parking included with this unit</span>
        </label>
        <Field label="Parking Number"><input value={form.parkingNumber} onChange={set('parkingNumber')} className={inputCls} placeholder="P-104" /></Field>
      </div>

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
