import { useState } from 'react'
import api from '../../api/axios'
import { EditModal, Field, inputCls, selectCls } from './editShared'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const PLOT_USAGE = ['Residential', 'Commercial', 'Agricultural', 'Industrial']
const PRICE_KEYS = ['basePrice', 'plc', 'otherCharges']

const REQUIRED = {
  unitNo: 'Plot number',
  plotArea: 'Plot area',
  facing: 'Facing',
  basePrice: 'Base price',
}

function Label({ text, required }) {
  return <>{text}{required && <span className="text-red-500"> *</span>}</>
}

// Pass `unit` to edit an existing plot; omit it to add a new one
export default function AddPlotModal({ projectId, project, unit, onClose, onCreated }) {
  const isEdit = Boolean(unit)
  const [form, setForm] = useState({
    block: unit ? (unit.block === 'PLOT' ? '' : unit.block) : (project?.blocks?.[0] || ''), unitNo: unit?.unitNo || '',
    plotLength: unit?.plotLength ?? '', plotWidth: unit?.plotWidth ?? '', plotArea: unit?.plotArea ?? '', roadWidth: unit?.roadWidth ?? '',
    facing: unit?.facing || '', plotUsage: unit?.plotUsage || 'Residential', cornerUnit: !!unit?.cornerUnit,
    basePrice: unit?.basePrice ?? '', pricePerSqft: unit?.pricePerSqft ?? '', plc: unit?.plc ?? '', otherCharges: unit?.otherCharges ?? '',
    possessionStatus: unit?.possessionStatus || 'Ready', status: unit?.status || 'Available',
  })
  const [files, setFiles] = useState({ floorPlan: null, priceSheet: null })
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Derive area from dimensions so the two stay consistent
      if ((key === 'plotLength' || key === 'plotWidth') && Number(next.plotLength) > 0 && Number(next.plotWidth) > 0) {
        next.plotArea = String(Number(next.plotLength) * Number(next.plotWidth))
      }
      return next
    })
    setFieldErrors((prev) => ({ ...prev, [key]: '', ...(key === 'plotLength' || key === 'plotWidth' ? { plotArea: '' } : {}) }))
  }

  const totalPricePreview = PRICE_KEYS.some((k) => form[k])
    ? PRICE_KEYS.reduce((sum, k) => sum + (Number(form[k]) || 0), 0)
    : null

  const validate = () => {
    const errors = {}
    Object.entries(REQUIRED).forEach(([key, label]) => {
      if (!String(form[key] ?? '').trim()) errors[key] = `${label} is required`
    })
    if (form.plotArea && Number(form.plotArea) <= 0) errors.plotArea = 'Plot area must be greater than 0'
    if (form.basePrice && Number(form.basePrice) <= 0) errors.basePrice = 'Base price must be greater than 0'
    ;['plotLength', 'plotWidth', 'roadWidth', 'pricePerSqft', 'plc', 'otherCharges'].forEach((key) => {
      if (form[key] && Number(form[key]) < 0) errors[key] = 'Cannot be negative'
    })
    if (Boolean(form.plotLength) !== Boolean(form.plotWidth)) {
      errors[form.plotLength ? 'plotWidth' : 'plotLength'] = 'Enter both length and width'
    }
    setFieldErrors(errors)
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    const messages = Object.values(errors)
    if (messages.length) { setError(messages[0]); return }
    setError('')

    setSaving(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }
      append('block', String(form.block).trim() || 'PLOT')
      append('floor', 0)
      append('unitNo', String(form.unitNo).trim())
      append('bhkType', 'Plot')
      append('facing', form.facing)
      fd.append('cornerUnit', String(form.cornerUnit))
      append('plotLength', form.plotLength)
      append('plotWidth', form.plotWidth)
      append('plotArea', form.plotArea)
      append('roadWidth', form.roadWidth)
      append('plotUsage', form.plotUsage)
      append('basePrice', form.basePrice)
      append('pricePerSqft', form.pricePerSqft)
      append('plc', form.plc)
      append('otherCharges', form.otherCharges)
      append('possessionStatus', form.possessionStatus)
      append('status', form.status)
      if (files.floorPlan) fd.append('floorPlan', files.floorPlan)
      if (files.priceSheet) fd.append('priceSheet', files.priceSheet)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (isEdit) await api.put(`/projects/${projectId}/units/${unit._id}`, fd, config)
      else await api.post(`/projects/${projectId}/units`, fd, config)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? 'Failed to update plot' : 'Failed to create plot'))
    } finally {
      setSaving(false)
    }
  }

  const cls = (key, base = inputCls) => `${base} ${fieldErrors[key] ? '!border-red-300' : ''}`
  const err = (key) => fieldErrors[key] && <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>

  return (
    <EditModal
      title={isEdit ? `Plot ${unit.unitNo}` : 'Add Plot'}
      icon="📍"
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      error={error}
      wide
      submitLabel={saving ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Plot' : 'Add Plot')}
    >
      <p className="text-xs text-gray-400">Fields marked <span className="text-red-500">*</span> are required.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={<Label text="Plot No." required />}>
          <input value={form.unitNo} onChange={set('unitNo')} className={cls('unitNo')} placeholder="P-101" />
          {err('unitNo')}
        </Field>
        <Field label="Phase / Sector" hint="Leave blank if the layout has no phases">
          {project?.blocks?.length > 0 ? (
            <select value={form.block} onChange={set('block')} className={selectCls}>
              {project.blocks.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <input value={form.block} onChange={set('block')} className={inputCls} placeholder="Phase 1" />
          )}
        </Field>
        <Field label="Plot Usage">
          <select value={form.plotUsage} onChange={set('plotUsage')} className={selectCls}>
            {PLOT_USAGE.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Length (ft)">
          <input type="number" min="0" value={form.plotLength} onChange={set('plotLength')} className={cls('plotLength')} placeholder="40" />
          {err('plotLength')}
        </Field>
        <Field label="Width (ft)">
          <input type="number" min="0" value={form.plotWidth} onChange={set('plotWidth')} className={cls('plotWidth')} placeholder="30" />
          {err('plotWidth')}
        </Field>
        <Field label={<Label text="Plot Area (sqft)" required />} hint={form.plotLength && form.plotWidth ? 'Calculated from length × width' : undefined}>
          <input type="number" min="0" value={form.plotArea} onChange={set('plotArea')} className={cls('plotArea')} placeholder="1200" />
          {err('plotArea')}
        </Field>
        <Field label="Road Width (ft)">
          <input type="number" min="0" value={form.roadWidth} onChange={set('roadWidth')} className={cls('roadWidth')} placeholder="30" />
          {err('roadWidth')}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={<Label text="Facing" required />}>
          <select value={form.facing} onChange={set('facing')} className={cls('facing', selectCls)}>
            <option value="">Select facing...</option>
            {FACING.map((f) => <option key={f}>{f}</option>)}
          </select>
          {err('facing')}
        </Field>
        <label className="flex items-center gap-2 cursor-pointer sm:mt-6">
          <input type="checkbox" checked={form.cornerUnit} onChange={(e) => setForm((f) => ({ ...f, cornerUnit: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">This is a corner plot</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label={<Label text="Base Price (₹)" required />}>
          <input type="number" min="0" value={form.basePrice} onChange={set('basePrice')} className={cls('basePrice')} />
          {err('basePrice')}
        </Field>
        <Field label="Price / Sq.ft (₹)">
          <input type="number" min="0" value={form.pricePerSqft} onChange={set('pricePerSqft')} className={cls('pricePerSqft')} />
          {err('pricePerSqft')}
        </Field>
        <Field label="PLC (₹)" hint="Corner / park-facing premium">
          <input type="number" min="0" value={form.plc} onChange={set('plc')} className={cls('plc')} />
          {err('plc')}
        </Field>
        <Field label="Other Charges (₹)">
          <input type="number" min="0" value={form.otherCharges} onChange={set('otherCharges')} className={cls('otherCharges')} />
          {err('otherCharges')}
        </Field>
      </div>
      {totalPricePreview !== null && (
        <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-primary-700 font-medium">Total Price</span>
          <span className="text-sm font-bold text-primary-800">₹{totalPricePreview.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={<Label text="Sales Status" required />}>
          <select value={form.status} onChange={set('status')} className={selectCls}>
            {['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Possession">
          <select value={form.possessionStatus} onChange={set('possessionStatus')} className={selectCls}>
            <option>Ready</option>
            <option>Under Construction</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Plot Layout / Map">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, floorPlan: e.target.files?.[0] || null }))} className="text-sm" />
        </Field>
        <Field label="Price Sheet">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, priceSheet: e.target.files?.[0] || null }))} className="text-sm" />
        </Field>
      </div>
    </EditModal>
  )
}
